/**
 * TypeScript interfaces used across the widget.
 */

export interface WidgetConfig {
  apiKey: string;
  apiUrl: string;
  position: "bottom-right" | "bottom-left";
}

export interface WidgetServerConfig {
  welcome_message: string;
  theme_color: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatDoneEvent {
  conversation_id: string;
  message_id: string;
  token_count: number | null;
}
