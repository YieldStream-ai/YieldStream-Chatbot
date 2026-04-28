import type { WidgetStyling } from "../types";

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  styling: WidgetStyling;
}

export const TEMPLATES: WidgetTemplate[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean indigo theme with Inter font",
    styling: {
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
        font_url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
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
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Black and white, no rounded corners",
    styling: {
      brand: {
        primary_color: "#000000",
        primary_text_color: "#ffffff",
        background_color: "#ffffff",
        surface_color: "#f5f5f5",
        text_color: "#171717",
        text_muted_color: "#737373",
      },
      typography: {
        font_family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        font_url: null,
        font_size_base: 14,
        font_weight_body: 400,
        font_weight_heading: 500,
      },
      shape: {
        border_radius_panel: 0,
        border_radius_bubble: 0,
        border_radius_message: 0,
        border_width: 1,
      },
      layout: {
        position: "bottom-right",
        offset_x: 20,
        offset_y: 20,
        bubble_size: 48,
        panel_width: 360,
        panel_height: 480,
      },
      motion: {
        animation_style: "fade",
        animation_speed: "normal",
        respect_reduced_motion: true,
      },
      template_id: "minimal",
      template_modified: false,
    },
  },
  {
    id: "soft",
    name: "Soft",
    description: "Pastel blue with generous rounding",
    styling: {
      brand: {
        primary_color: "#7C9EF7",
        primary_text_color: "#ffffff",
        background_color: "#fafbff",
        surface_color: "#eef2ff",
        text_color: "#1e293b",
        text_muted_color: "#94a3b8",
      },
      typography: {
        font_family: "Lato, system-ui, sans-serif",
        font_url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
        font_size_base: 15,
        font_weight_body: 400,
        font_weight_heading: 700,
      },
      shape: {
        border_radius_panel: 20,
        border_radius_bubble: 28,
        border_radius_message: 16,
        border_width: 0,
      },
      layout: {
        position: "bottom-right",
        offset_x: 24,
        offset_y: 24,
        bubble_size: 60,
        panel_width: 400,
        panel_height: 560,
      },
      motion: {
        animation_style: "scale",
        animation_speed: "normal",
        respect_reduced_motion: true,
      },
      template_id: "soft",
      template_modified: false,
    },
  },
  {
    id: "sharp",
    name: "Sharp",
    description: "High-contrast with IBM Plex Sans",
    styling: {
      brand: {
        primary_color: "#000000",
        primary_text_color: "#ffffff",
        background_color: "#ffffff",
        surface_color: "#f0f0f0",
        text_color: "#000000",
        text_muted_color: "#555555",
      },
      typography: {
        font_family: "'IBM Plex Sans', system-ui, sans-serif",
        font_url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
        font_size_base: 14,
        font_weight_body: 400,
        font_weight_heading: 700,
      },
      shape: {
        border_radius_panel: 0,
        border_radius_bubble: 0,
        border_radius_message: 0,
        border_width: 2,
      },
      layout: {
        position: "bottom-right",
        offset_x: 16,
        offset_y: 16,
        bubble_size: 48,
        panel_width: 360,
        panel_height: 480,
      },
      motion: {
        animation_style: "none",
        animation_speed: "instant",
        respect_reduced_motion: true,
      },
      template_id: "sharp",
      template_modified: false,
    },
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm orange with Open Sans",
    styling: {
      brand: {
        primary_color: "#F97316",
        primary_text_color: "#ffffff",
        background_color: "#fffbf5",
        surface_color: "#fff7ed",
        text_color: "#1c1917",
        text_muted_color: "#a8a29e",
      },
      typography: {
        font_family: "'Open Sans', system-ui, sans-serif",
        font_url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
        font_size_base: 15,
        font_weight_body: 400,
        font_weight_heading: 600,
      },
      shape: {
        border_radius_panel: 20,
        border_radius_bubble: 28,
        border_radius_message: 20,
        border_width: 0,
      },
      layout: {
        position: "bottom-right",
        offset_x: 20,
        offset_y: 20,
        bubble_size: 64,
        panel_width: 400,
        panel_height: 540,
      },
      motion: {
        animation_style: "slide",
        animation_speed: "normal",
        respect_reduced_motion: true,
      },
      template_id: "friendly",
      template_modified: false,
    },
  },
];
