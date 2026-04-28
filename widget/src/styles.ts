/**
 * Widget CSS — all visual properties use CSS custom properties with sensible defaults.
 * The widget sets these variables at runtime via applyTokens().
 */
export function getStyles(): string {
  return `
    :host {
      --chat-primary-color: #4F46E5;
      --chat-primary-text: #ffffff;
      --chat-bg: #ffffff;
      --chat-surface: #f3f4f6;
      --chat-text: #1f2937;
      --chat-text-muted: #6b7280;
      --chat-border: #e5e7eb;
      --chat-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --chat-font-size: 14px;
      --chat-font-weight-body: 400;
      --chat-font-weight-heading: 600;
      --chat-radius-panel: 12px;
      --chat-radius-bubble: 28px;
      --chat-radius-message: 12px;
      --chat-border-width: 1px;
      --chat-offset-x: 20px;
      --chat-offset-y: 20px;
      --chat-bubble-size: 56px;
      --chat-panel-width: 380px;
      --chat-panel-height: 520px;
      --chat-animation-duration: 250ms;

      font-family: var(--chat-font-family);
      font-size: var(--chat-font-size);
      font-weight: var(--chat-font-weight-body);
      line-height: 1.5;
      color: var(--chat-text);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* --- Floating bubble button --- */
    .chat-bubble {
      position: fixed;
      width: var(--chat-bubble-size);
      height: var(--chat-bubble-size);
      border-radius: var(--chat-radius-bubble);
      background: var(--chat-primary-color);
      color: var(--chat-primary-text);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform var(--chat-animation-duration), box-shadow var(--chat-animation-duration);
      z-index: 9999;
    }

    .chat-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    /* Position variants for bubble */
    .chat-bubble.bottom-right { bottom: var(--chat-offset-y); right: var(--chat-offset-x); }
    .chat-bubble.bottom-left  { bottom: var(--chat-offset-y); left: var(--chat-offset-x); }
    .chat-bubble.top-right    { top: var(--chat-offset-y); right: var(--chat-offset-x); }
    .chat-bubble.top-left     { top: var(--chat-offset-y); left: var(--chat-offset-x); }

    .chat-bubble svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    /* --- Chat panel --- */
    .chat-panel {
      position: fixed;
      width: var(--chat-panel-width);
      height: var(--chat-panel-height);
      background: var(--chat-bg);
      border-radius: var(--chat-radius-panel);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      border: var(--chat-border-width) solid var(--chat-border);
      opacity: 0;
      transform: translateY(0);
    }

    /* Position variants for panel */
    .chat-panel.bottom-right { bottom: calc(var(--chat-offset-y) + var(--chat-bubble-size) + 12px); right: var(--chat-offset-x); }
    .chat-panel.bottom-left  { bottom: calc(var(--chat-offset-y) + var(--chat-bubble-size) + 12px); left: var(--chat-offset-x); }
    .chat-panel.top-right    { top: calc(var(--chat-offset-y) + var(--chat-bubble-size) + 12px); right: var(--chat-offset-x); }
    .chat-panel.top-left     { top: calc(var(--chat-offset-y) + var(--chat-bubble-size) + 12px); left: var(--chat-offset-x); }

    /* Animation: open state */
    .chat-panel.open {
      display: flex;
      opacity: 1;
    }

    /* Slide animation */
    .chat-panel[data-animation="slide"] {
      transform: translateY(12px);
      transition: opacity var(--chat-animation-duration) ease, transform var(--chat-animation-duration) ease;
    }
    .chat-panel[data-animation="slide"].open {
      transform: translateY(0);
    }

    /* Fade animation */
    .chat-panel[data-animation="fade"] {
      transition: opacity var(--chat-animation-duration) ease;
    }

    /* Scale animation */
    .chat-panel[data-animation="scale"] {
      transform: scale(0.95);
      transition: opacity var(--chat-animation-duration) ease, transform var(--chat-animation-duration) ease;
    }
    .chat-panel[data-animation="scale"].open {
      transform: scale(1);
    }

    /* None / instant animation */
    .chat-panel[data-animation="none"] {
      transition: none;
    }

    /* Reduced motion override */
    @media (prefers-reduced-motion: reduce) {
      :host([data-respect-reduced-motion="true"]) .chat-panel,
      :host([data-respect-reduced-motion="true"]) .chat-bubble {
        transition-duration: 0ms !important;
      }
    }

    /* --- Header --- */
    .chat-header {
      padding: 16px;
      background: var(--chat-primary-color);
      color: var(--chat-primary-text);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .chat-header-title {
      font-weight: var(--chat-font-weight-heading);
      font-size: 15px;
    }

    .chat-close-btn {
      background: none;
      border: none;
      color: var(--chat-primary-text);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      opacity: 0.8;
      transition: opacity 0.15s;
    }

    .chat-close-btn:hover { opacity: 1; }
    .chat-close-btn svg { width: 18px; height: 18px; fill: currentColor; }

    /* --- Messages area --- */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chat-message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: var(--chat-radius-message);
      font-weight: var(--chat-font-weight-body);
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .chat-message.user {
      align-self: flex-end;
      background: var(--chat-primary-color);
      color: var(--chat-primary-text);
      border-bottom-right-radius: 4px;
    }

    .chat-message.assistant {
      align-self: flex-start;
      background: var(--chat-surface);
      color: var(--chat-text);
      border-bottom-left-radius: 4px;
    }

    .chat-message.welcome {
      align-self: flex-start;
      background: var(--chat-surface);
      color: var(--chat-text);
      border-bottom-left-radius: 4px;
    }

    /* --- Typing indicator --- */
    .typing-indicator {
      display: none;
      align-self: flex-start;
      padding: 10px 14px;
      background: var(--chat-surface);
      border-radius: var(--chat-radius-message);
      border-bottom-left-radius: 4px;
    }

    .typing-indicator.visible { display: flex; gap: 4px; }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--chat-text-muted);
      animation: typing-bounce 1.4s ease-in-out infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    /* --- Input area --- */
    .chat-input-area {
      padding: 12px 16px;
      border-top: var(--chat-border-width) solid var(--chat-border);
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border: var(--chat-border-width) solid var(--chat-border);
      border-radius: 8px;
      font-family: inherit;
      font-size: var(--chat-font-size);
      color: var(--chat-text);
      background: var(--chat-bg);
      outline: none;
      transition: border-color 0.15s;
      resize: none;
      min-height: 40px;
      max-height: 100px;
    }

    .chat-input:focus {
      border-color: var(--chat-primary-color);
    }

    .chat-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--chat-primary-color);
      color: var(--chat-primary-text);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s;
    }

    .chat-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .chat-send-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    /* --- Powered by footer --- */
    .chat-footer {
      padding: 6px 16px;
      text-align: center;
      font-size: 11px;
      color: var(--chat-text-muted);
      border-top: var(--chat-border-width) solid var(--chat-border);
      flex-shrink: 0;
    }
  `;
}
