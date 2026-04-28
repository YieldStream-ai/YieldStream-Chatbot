import { useEffect, useRef, useState, useMemo } from "react";
import type { WidgetStyling } from "../types";

const SPEED_MAP: Record<string, string> = {
  slow: "400ms",
  normal: "250ms",
  fast: "150ms",
  instant: "0ms",
};

function stylingToCssVars(s: WidgetStyling): Record<string, string> {
  return {
    "--chat-primary-color": s.brand.primary_color,
    "--chat-primary-text": s.brand.primary_text_color,
    "--chat-bg": s.brand.background_color,
    "--chat-surface": s.brand.surface_color,
    "--chat-text": s.brand.text_color,
    "--chat-text-muted": s.brand.text_muted_color,
    "--chat-font-family": s.typography.font_family,
    "--chat-font-size": s.typography.font_size_base + "px",
    "--chat-font-weight-body": String(s.typography.font_weight_body),
    "--chat-font-weight-heading": String(s.typography.font_weight_heading),
    "--chat-radius-panel": s.shape.border_radius_panel + "px",
    "--chat-radius-bubble": s.shape.border_radius_bubble + "px",
    "--chat-radius-message": s.shape.border_radius_message + "px",
    "--chat-border-width": s.shape.border_width + "px",
    "--chat-offset-x": s.layout.offset_x + "px",
    "--chat-offset-y": s.layout.offset_y + "px",
    "--chat-bubble-size": s.layout.bubble_size + "px",
    "--chat-panel-width": s.layout.panel_width + "px",
    "--chat-panel-height": s.layout.panel_height + "px",
    "--chat-animation-duration": SPEED_MAP[s.motion.animation_speed] || "250ms",
  };
}

/**
 * Inline widget CSS — mirrors the production widget's styles.ts but scoped
 * to the preview container. This keeps the dashboard self-contained (no
 * cross-package import needed for Docker builds).
 */
const WIDGET_CSS = `
  .wp-root {
    font-family: var(--chat-font-family);
    font-size: var(--chat-font-size);
    font-weight: var(--chat-font-weight-body);
    line-height: 1.5;
    color: var(--chat-text);
    position: relative;
    width: 100%;
    height: 100%;
  }
  .wp-bubble {
    position: absolute;
    bottom: var(--chat-offset-y);
    right: var(--chat-offset-x);
    width: var(--chat-bubble-size);
    height: var(--chat-bubble-size);
    border-radius: var(--chat-radius-bubble);
    background: var(--chat-primary-color);
    color: var(--chat-primary-text);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: default;
  }
  .wp-bubble svg { width: 24px; height: 24px; fill: currentColor; }
  .wp-panel {
    position: absolute;
    bottom: calc(var(--chat-offset-y) + var(--chat-bubble-size) + 12px);
    right: var(--chat-offset-x);
    width: var(--chat-panel-width);
    height: var(--chat-panel-height);
    background: var(--chat-bg);
    border-radius: var(--chat-radius-panel);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: var(--chat-border-width) solid #e5e7eb;
  }
  .wp-header {
    padding: 16px;
    background: var(--chat-primary-color);
    color: var(--chat-primary-text);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .wp-header-title {
    font-weight: var(--chat-font-weight-heading);
    font-size: 15px;
  }
  .wp-close { background: none; border: none; color: var(--chat-primary-text); opacity: 0.8; display: flex; padding: 4px; cursor: default; }
  .wp-close svg { width: 18px; height: 18px; fill: currentColor; }
  .wp-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .wp-msg {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: var(--chat-radius-message);
    word-wrap: break-word;
    white-space: pre-wrap;
    font-weight: var(--chat-font-weight-body);
  }
  .wp-msg-bot {
    align-self: flex-start;
    background: var(--chat-surface);
    color: var(--chat-text);
    border-bottom-left-radius: 4px;
  }
  .wp-msg-user {
    align-self: flex-end;
    background: var(--chat-primary-color);
    color: var(--chat-primary-text);
    border-bottom-right-radius: 4px;
  }
  .wp-input-area {
    padding: 12px 16px;
    border-top: var(--chat-border-width) solid #e5e7eb;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .wp-input {
    flex: 1;
    padding: 10px 14px;
    border: var(--chat-border-width) solid #e5e7eb;
    border-radius: 8px;
    font-family: inherit;
    font-size: var(--chat-font-size);
    color: var(--chat-text);
    background: var(--chat-bg);
    outline: none;
  }
  .wp-send {
    width: 40px; height: 40px;
    border-radius: 8px;
    background: var(--chat-primary-color);
    color: var(--chat-primary-text);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
  }
  .wp-send svg { width: 18px; height: 18px; fill: currentColor; }
  .wp-footer {
    padding: 6px 16px;
    text-align: center;
    font-size: 11px;
    color: var(--chat-text-muted);
    border-top: var(--chat-border-width) solid #e5e7eb;
    flex-shrink: 0;
  }
`;

interface Props {
  styling: WidgetStyling;
  welcomeMessage: string;
}

export default function WidgetPreview({ styling, welcomeMessage }: Props) {
  const [showPanel, setShowPanel] = useState(true);
  const [debouncedStyling, setDebouncedStyling] = useState(styling);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce styling updates at 150ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedStyling(styling);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [styling]);

  // Load Google Font if needed
  useEffect(() => {
    const url = debouncedStyling.typography.font_url;
    if (!url) return;
    const existing = document.querySelector(`link[href="${url}"]`);
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [debouncedStyling.typography.font_url]);

  const cssVars = useMemo(() => stylingToCssVars(debouncedStyling), [debouncedStyling]);

  return (
    <div className="widget-preview-wrapper">
      <div className="preview-view-toggle">
        <button
          type="button"
          className={`segmented-btn ${showPanel ? "active" : ""}`}
          onClick={() => setShowPanel(true)}
        >
          Panel
        </button>
        <button
          type="button"
          className={`segmented-btn ${!showPanel ? "active" : ""}`}
          onClick={() => setShowPanel(false)}
        >
          Bubble
        </button>
      </div>
      <div className="widget-preview-container" style={cssVars as React.CSSProperties}>
        <style>{WIDGET_CSS}</style>
        <div className="wp-root">
          {/* Bubble */}
          <div className="wp-bubble">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
          </div>

          {/* Panel */}
          {showPanel && (
            <div className="wp-panel">
              <div className="wp-header">
                <span className="wp-header-title">Chat</span>
                <span className="wp-close">
                  <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </span>
              </div>
              <div className="wp-messages">
                <div className="wp-msg wp-msg-bot">{welcomeMessage || "Hi! How can I help you today?"}</div>
                <div className="wp-msg wp-msg-user">Can you tell me more about your product?</div>
                <div className="wp-msg wp-msg-bot">Of course! I'd be happy to help you learn more.</div>
              </div>
              <div className="wp-input-area">
                <div className="wp-input">Type a message...</div>
                <div className="wp-send">
                  <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </div>
              </div>
              <div className="wp-footer">Powered by Chat Widget</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
