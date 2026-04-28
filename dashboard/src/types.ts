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

export const DEFAULT_WIDGET_STYLING: WidgetStyling = {
  brand: {
    primary_color: "#4F46E5",
    primary_text_color: "#ffffff",
    background_color: "#ffffff",
    surface_color: "#f3f4f6",
    text_color: "#1f2937",
    text_muted_color: "#6b7280",
  },
  typography: {
    font_family: "Inter, system-ui, sans-serif",
    font_url: null,
    font_size_base: 14,
    font_weight_body: 400,
    font_weight_heading: 600,
  },
  shape: {
    border_radius_panel: 12,
    border_radius_bubble: 28,
    border_radius_message: 12,
    border_width: 1,
  },
  layout: {
    position: "bottom-right",
    offset_x: 20,
    offset_y: 20,
    bubble_size: 56,
    panel_width: 380,
    panel_height: 520,
  },
  motion: {
    animation_style: "slide",
    animation_speed: "normal",
    respect_reduced_motion: true,
  },
  template_id: "default",
  template_modified: false,
};

export interface Client {
  id: string;
  name: string;
  slug: string;
  allowed_origins: string;
  system_prompt: string;
  welcome_message: string;
  theme_color: string;
  max_tokens: number;
  model_name: string;
  is_active: boolean;
  widget_styling?: WidgetStyling;
}

export interface APIKey {
  id: string;
  key_prefix: string;
  rate_limit_rpm: number;
  rate_limit_rpd: number;
  is_active: boolean;
}

export interface APIKeyCreateResponse extends APIKey {
  raw_key: string;
}

export interface DashboardStats {
  messages: number;
  tokens: number;
  sessions: number;
  uptime: number;
}

export interface RecentMessage {
  text: string;
  timestamp: string;
}
