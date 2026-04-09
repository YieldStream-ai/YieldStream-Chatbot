/**
 * ChatWidget
 */
import { ChatAPI } from "./api";
import { getStyles } from "./styles";
import { ChatMessage, WidgetConfig } from "./types";

export class ChatWidget extends HTMLElement {
  private api: ChatAPI;
  private config: WidgetConfig;
  private shadow: ShadowRoot;
  private messages: ChatMessage[] = [];
  private isOpen = false;
  private isStreaming = false;
  private configLoaded = false;

  // DOM references (set in render())
  private panel!: HTMLDivElement;
  private messageList!: HTMLDivElement;
  private typingIndicator!: HTMLDivElement;
  private input!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;

  constructor(config: WidgetConfig) {
    super();
    this.config = config;
    this.api = new ChatAPI(config);
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  private render() {
    const position = this.config.position || "bottom-right";

    this.shadow.innerHTML = `
      <style>${getStyles()}</style>

      <!-- Floating bubble button -->
      <button class="chat-bubble ${position}" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>

      <!-- Chat panel (hidden by default) -->
      <div class="chat-panel ${position}">
        <div class="chat-header">
          <span class="chat-header-title">Chat</span>
          <button class="chat-close-btn" aria-label="Close chat">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="chat-messages">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>

        <div class="chat-input-area">
          <textarea
            class="chat-input"
            placeholder="Type a message..."
            rows="1"
          ></textarea>
          <button class="chat-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <div class="chat-footer">Powered by Chat Widget</div>
      </div>
    `;

    // Grab DOM references
    this.panel = this.shadow.querySelector(".chat-panel") as HTMLDivElement;
    this.messageList = this.shadow.querySelector(
      ".chat-messages",
    ) as HTMLDivElement;
    this.typingIndicator = this.shadow.querySelector(
      ".typing-indicator",
    ) as HTMLDivElement;
    this.input = this.shadow.querySelector(
      ".chat-input",
    ) as HTMLTextAreaElement;
    this.sendBtn = this.shadow.querySelector(
      ".chat-send-btn",
    ) as HTMLButtonElement;
  }

  private attachEventListeners() {
    // Bubble click → toggle panel
    const bubble = this.shadow.querySelector(
      ".chat-bubble",
    ) as HTMLButtonElement;
    bubble.addEventListener("click", () => this.toggle());

    // Close button
    const closeBtn = this.shadow.querySelector(
      ".chat-close-btn",
    ) as HTMLButtonElement;
    closeBtn.addEventListener("click", () => this.close());

    // Send button
    this.sendBtn.addEventListener("click", () => this.sendMessage());

    // Enter key sends (Shift+Enter for newline)
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea as user types
    this.input.addEventListener("input", () => {
      this.input.style.height = "auto";
      this.input.style.height = Math.min(this.input.scrollHeight, 100) + "px";
    });
  }

  private toggle() {
    this.isOpen ? this.close() : this.open();
  }

  private async open() {
    this.isOpen = true;
    this.panel.classList.add("open");

    // Load config on first open (welcome message, theme color)
    if (!this.configLoaded) {
      try {
        const serverConfig = await this.api.fetchConfig();
        this.configLoaded = true;

        // Apply theme color from server
        this.style.setProperty(
          "--chat-primary-color",
          serverConfig.theme_color,
        );

        // Show welcome message
        if (serverConfig.welcome_message) {
          this.addMessageToDOM({
            id: "welcome",
            role: "assistant",
            content: serverConfig.welcome_message,
          });
        }
      } catch (err) {
        console.error("[ChatWidget] Failed to load config:", err);
      }
    }

    // Focus the input
    setTimeout(() => this.input.focus(), 100);
  }

  private close() {
    this.isOpen = false;
    this.panel.classList.remove("open");
  }

  private async sendMessage() {
    const text = this.input.value.trim();
    if (!text || this.isStreaming) return;

    // Clear input and reset height
    this.input.value = "";
    this.input.style.height = "auto";

    // Add user message to the UI
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    this.messages.push(userMsg);
    this.addMessageToDOM(userMsg);

    // Show typing indicator while waiting for response
    this.isStreaming = true;
    this.sendBtn.disabled = true;
    this.typingIndicator.classList.add("visible");
    this.scrollToBottom();

    // Create a placeholder for the assistant's response
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    let assistantElement: HTMLDivElement | null = null;

    // Stream the response from the server
    await this.api.streamChat(
      text,
      // onToken — called for each chunk of the AI's response
      (token: string) => {
        // Hide typing indicator on first token
        if (!assistantElement) {
          this.typingIndicator.classList.remove("visible");
          assistantElement = this.addMessageToDOM(assistantMsg);
        }

        // Append the token to the message — this creates the "typing" effect
        assistantMsg.content += token;
        assistantElement!.textContent = assistantMsg.content;
        this.scrollToBottom();
      },
      // onDone — response is complete
      (event) => {
        assistantMsg.id = event.message_id;
        this.messages.push(assistantMsg);
        this.isStreaming = false;
        this.sendBtn.disabled = false;
        this.typingIndicator.classList.remove("visible");
      },
      // onError — something went wrong
      (error: string) => {
        this.typingIndicator.classList.remove("visible");
        this.isStreaming = false;
        this.sendBtn.disabled = false;

        // Show error as a system message
        if (!assistantElement) {
          assistantElement = this.addMessageToDOM({
            id: "error",
            role: "assistant",
            content: `⚠️ ${error}`,
          });
        } else {
          assistantMsg.content += `\n\n⚠️ ${error}`;
          assistantElement.textContent = assistantMsg.content;
        }
        this.scrollToBottom();
      },
    );
  }

  /**
   * Add a message bubble to the chat UI and return the DOM element.
   */
  private addMessageToDOM(msg: ChatMessage): HTMLDivElement {
    const div = document.createElement("div");
    div.className = `chat-message ${msg.role}`;
    div.textContent = msg.content;

    // Insert before the typing indicator so it stays at the bottom
    this.messageList.insertBefore(div, this.typingIndicator);
    this.scrollToBottom();
    return div;
  }

  private scrollToBottom() {
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }
}
