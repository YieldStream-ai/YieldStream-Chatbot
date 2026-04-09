/**
 * Widget CSS
 */
export function getStyles(): string {
  return `
    :host {
      --chat-primary-color: #4F46E5;
      --chat-bg: #ffffff;
      --chat-text: #1f2937;
      --chat-text-light: #6b7280;
      --chat-border: #e5e7eb;
      --chat-user-bg: var(--chat-primary-color);
      --chat-user-text: #ffffff;
      --chat-assistant-bg: #f3f4f6;
      --chat-radius: 12px;

      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
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
      bottom: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--chat-primary-color);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 9999;
    }

    .chat-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .chat-bubble.bottom-right { right: 20px; }
    .chat-bubble.bottom-left { left: 20px; }

    .chat-bubble svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    /* --- Chat panel --- */
    .chat-panel {
      position: fixed;
      bottom: 88px;
      width: 380px;
      height: 520px;
      background: var(--chat-bg);
      border-radius: var(--chat-radius);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      border: 1px solid var(--chat-border);
    }

    .chat-panel.open { display: flex; }
    .chat-panel.bottom-right { right: 20px; }
    .chat-panel.bottom-left { left: 20px; }

    /* --- Header --- */
    .chat-header {
      padding: 16px;
      background: var(--chat-primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .chat-header-title {
      font-weight: 600;
      font-size: 15px;
    }

    .chat-close-btn {
      background: none;
      border: none;
      color: white;
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
      border-radius: var(--chat-radius);
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .chat-message.user {
      align-self: flex-end;
      background: var(--chat-user-bg);
      color: var(--chat-user-text);
      border-bottom-right-radius: 4px;
    }

    .chat-message.assistant {
      align-self: flex-start;
      background: var(--chat-assistant-bg);
      color: var(--chat-text);
      border-bottom-left-radius: 4px;
    }

    .chat-message.welcome {
      align-self: flex-start;
      background: var(--chat-assistant-bg);
      color: var(--chat-text);
      border-bottom-left-radius: 4px;
    }

    /* --- Typing indicator --- */
    .typing-indicator {
      display: none;
      align-self: flex-start;
      padding: 10px 14px;
      background: var(--chat-assistant-bg);
      border-radius: var(--chat-radius);
      border-bottom-left-radius: 4px;
    }

    .typing-indicator.visible { display: flex; gap: 4px; }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--chat-text-light);
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
      border-top: 1px solid var(--chat-border);
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--chat-border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
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
      color: white;
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
      color: var(--chat-text-light);
      border-top: 1px solid var(--chat-border);
      flex-shrink: 0;
    }
  `;
}
