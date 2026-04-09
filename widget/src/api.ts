/**
 * API client — handles HTTP requests and SSE stream parsing.
 *
 * SSE (Server-Sent Events) parsing explained:
 * We can't use the browser's built-in EventSource API because it only supports
 * GET requests, and our chat endpoint is POST (we need to send the message body).
 *
 * Instead, we use fetch() with response.body.getReader() to read the response
 * as a stream of bytes. We then parse the SSE text protocol manually:
 *
 *   event: token\n
 *   data: {"content": "Hello"}\n
 *   \n
 *
 * Each "event" block is separated by a blank line (\n\n).
 * The "event:" line tells us the type, "data:" gives us the JSON payload.
 */
import { WidgetConfig, WidgetServerConfig, ChatDoneEvent } from "./types";

export class ChatAPI {
  private config: WidgetConfig;

  constructor(config: WidgetConfig) {
    this.config = config;
  }

  /**
   * Fetch widget display config (welcome message, theme color) from the server.
   * Called once when the widget first opens.
   */
  async fetchConfig(): Promise<WidgetServerConfig> {
    const res = await fetch(`${this.config.apiUrl}/api/v1/widget/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.config.apiKey,
      },
      body: JSON.stringify({ session_id: this.getSessionId() }),
    });

    if (!res.ok) {
      throw new Error(`Config fetch failed: ${res.status}`);
    }

    return res.json();
  }

  /**
   * Send a message and stream the AI response back token by token.
   *
   * This is the core function. Here's what happens:
   *
   * 1. We POST the message to /api/v1/chat
   * 2. The server starts streaming back SSE events
   * 3. We read the stream incrementally using ReadableStream
   * 4. For each "token" event, we call onToken() with the text chunk
   *    → The widget appends this to the current message, creating the "typing" effect
   * 5. When we get a "done" event, we call onDone()
   * 6. If we get an "error" event, we call onError()
   *
   * @param message - The user's message text
   * @param onToken - Called for each text chunk (for real-time display)
   * @param onDone - Called when the full response is complete
   * @param onError - Called if something goes wrong
   */
  async streamChat(
    message: string,
    onToken: (text: string) => void,
    onDone: (event: ChatDoneEvent) => void,
    onError: (error: string) => void
  ): Promise<void> {
    let res: Response;

    try {
      res = await fetch(`${this.config.apiUrl}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey,
        },
        body: JSON.stringify({
          session_id: this.getSessionId(),
          message,
        }),
      });
    } catch (err) {
      onError("Network error — please check your connection.");
      return;
    }

    if (!res.ok) {
      if (res.status === 429) {
        onError("Too many messages — please wait a moment and try again.");
      } else {
        onError(`Request failed (${res.status})`);
      }
      return;
    }

    // Read the SSE stream
    const reader = res.body?.getReader();
    if (!reader) {
      onError("Streaming not supported in this browser.");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk of bytes into text and add to our buffer
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines (\n\n)
        // Split on that boundary to extract complete events
        const events = buffer.split("\n\n");

        // The last element might be an incomplete event — keep it in the buffer
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          // Parse the SSE event block
          const parsed = this.parseSSEEvent(eventBlock);
          if (!parsed) continue;

          switch (parsed.event) {
            case "token":
              onToken(parsed.data.content);
              break;
            case "done":
              onDone(parsed.data as ChatDoneEvent);
              break;
            case "error":
              onError(parsed.data.message || "Unknown error");
              break;
          }
        }
      }
    } catch (err) {
      onError("Stream interrupted — please try again.");
    }
  }

  /**
   * Parse a single SSE event block into its event type and data.
   *
   * Input format:
   *   event: token
   *   data: {"content": "Hello"}
   *
   * Returns: { event: "token", data: { content: "Hello" } }
   */
  private parseSSEEvent(
    block: string
  ): { event: string; data: any } | null {
    let event = "";
    let data = "";

    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) {
        event = line.slice(7);
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (!event || !data) return null;

    try {
      return { event, data: JSON.parse(data) };
    } catch {
      return null;
    }
  }

  /**
   * Get or create a session ID for this browser tab.
   *
   * Uses sessionStorage (not localStorage) so each tab gets its own conversation.
   * When the user closes the tab, the session ID is lost and they start fresh.
   */
  getSessionId(): string {
    const key = "chat-widget-session-id";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  }
}
