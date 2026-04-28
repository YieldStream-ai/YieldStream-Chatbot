/**
 * TypeScript interfaces used across the widget.
 */

export interface WidgetConfig {
  apiKey: string;
  apiUrl: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export interface BrandTokens {
  primary_color: string;
  primary_text_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  text_muted_color: string;
}

export interface TypographyTokens {
  font_family: string;
  font_url: string | null;
  font_size_base: number;
  font_weight_body: number;
  font_weight_heading: number;
}

export interface ShapeTokens {
  border_radius_panel: number;
  border_radius_bubble: number;
  border_radius_message: number;
  border_width: number;
}

export interface LayoutTokens {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  offset_x: number;
  offset_y: number;
  bubble_size: number;
  panel_width: number;
  panel_height: number;
}

export interface MotionTokens {
  animation_style: "slide" | "fade" | "scale" | "none";
  animation_speed: "slow" | "normal" | "fast" | "instant";
  respect_reduced_motion: boolean;
}

export interface WidgetStyling {
  brand: BrandTokens;
  typography: TypographyTokens;
  shape: ShapeTokens;
  layout: LayoutTokens;
  motion: MotionTokens;
  template_id: string | null;
  template_modified: boolean;
}

export interface WidgetServerConfig {
  welcome_message: string;
  theme_color: string;
  widget_styling?: WidgetStyling;
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
