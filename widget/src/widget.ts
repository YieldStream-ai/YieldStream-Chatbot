/**
 * ChatWidget
 */
import { ChatAPI } from "./api";
import { getStyles } from "./styles";
import { ChatMessage, WidgetConfig, WidgetStyling } from "./types";

const SPEED_MAP: Record<string, string> = {
  slow: "400ms",
  normal: "250ms",
  fast: "150ms",
  instant: "0ms",
};

export class ChatWidget extends HTMLElement {
  private api: ChatAPI;
  private config: WidgetConfig;
  private shadow: ShadowRoot;
  private messages: ChatMessage[] = [];
  private isOpen = false;
  private isStreaming = false;
  private configLoaded = false;
  private loadedFontUrl: string | null = null;

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

  /**
   * Public API for the dashboard live preview — push styling changes
   * without re-fetching from the server.
   */
  public updateStyling(styling: WidgetStyling) {
    this.applyTokens(styling);
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
      <div class="chat-panel ${position}" data-animation="slide">
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

        // Apply full styling if available, otherwise fall back to theme_color only
        if (serverConfig.widget_styling) {
          this.applyTokens(serverConfig.widget_styling);
        } else {
          this.style.setProperty(
            "--chat-primary-color",
            serverConfig.theme_color,
          );
        }

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

  private applyTokens(styling: WidgetStyling) {
    const s = this.style;

    // Brand
    s.setProperty("--chat-primary-color", styling.brand.primary_color);
    s.setProperty("--chat-primary-text", styling.brand.primary_text_color);
    s.setProperty("--chat-bg", styling.brand.background_color);
    s.setProperty("--chat-surface", styling.brand.surface_color);
    s.setProperty("--chat-text", styling.brand.text_color);
    s.setProperty("--chat-text-muted", styling.brand.text_muted_color);

    // Typography
    s.setProperty("--chat-font-family", styling.typography.font_family);
    s.setProperty("--chat-font-size", styling.typography.font_size_base + "px");
    s.setProperty("--chat-font-weight-body", String(styling.typography.font_weight_body));
    s.setProperty("--chat-font-weight-heading", String(styling.typography.font_weight_heading));

    // Shape
    s.setProperty("--chat-radius-panel", styling.shape.border_radius_panel + "px");
    s.setProperty("--chat-radius-bubble", styling.shape.border_radius_bubble + "px");
    s.setProperty("--chat-radius-message", styling.shape.border_radius_message + "px");
    s.setProperty("--chat-border-width", styling.shape.border_width + "px");

    // Layout
    s.setProperty("--chat-offset-x", styling.layout.offset_x + "px");
    s.setProperty("--chat-offset-y", styling.layout.offset_y + "px");
    s.setProperty("--chat-bubble-size", styling.layout.bubble_size + "px");
    s.setProperty("--chat-panel-width", styling.layout.panel_width + "px");
    s.setProperty("--chat-panel-height", styling.layout.panel_height + "px");

    // Motion
    const duration = SPEED_MAP[styling.motion.animation_speed] || "250ms";
    s.setProperty("--chat-animation-duration", duration);
    this.panel.setAttribute("data-animation", styling.motion.animation_style);

    // Reduced motion
    this.setAttribute(
      "data-respect-reduced-motion",
      String(styling.motion.respect_reduced_motion),
    );

    // Update position classes
    const bubble = this.shadow.querySelector(".chat-bubble") as HTMLElement;
    if (bubble) {
      bubble.className = `chat-bubble ${styling.layout.position}`;
    }
    this.panel.className = this.panel.className.replace(
      /\b(bottom-right|bottom-left|top-right|top-left)\b/,
      styling.layout.position,
    );

    // Load Google Font if needed
    if (styling.typography.font_url) {
      this.loadFont(styling.typography.font_url);
    }
  }

  private loadFont(url: string) {
    if (this.loadedFontUrl === url) return;
    this.loadedFontUrl = url;

    // Try shadow DOM first, fall back to document head
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;

    // Insert into document head (fonts must be accessible globally for shadow DOM to use them)
    const existing = document.querySelector(`link[href="${url}"]`);
    if (!existing) {
      document.head.appendChild(link);
    }
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
            content: `\u26a0\ufe0f ${error}`,
          });
        } else {
          assistantMsg.content += `\n\n\u26a0\ufe0f ${error}`;
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
