import type { WidgetStyling } from "../../types";
import { TEMPLATES } from "../../constants/templates";

interface Props {
  widgetStyling: WidgetStyling;
  onApply: (styling: WidgetStyling) => void;
}

export default function TemplateSelector({ widgetStyling, onApply }: Props) {
  const activeTemplate = TEMPLATES.find((t) => t.id === widgetStyling.template_id);

  function handleApply(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    if (widgetStyling.template_modified) {
      if (!confirm("Apply template? This will replace your current customizations.")) {
        return;
      }
    }

    onApply({ ...template.styling });
  }

  function handleReset() {
    if (!activeTemplate) return;
    onApply({ ...activeTemplate.styling });
  }

  return (
    <div>
      <div className="template-row">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`template-card ${widgetStyling.template_id === t.id ? "active" : ""}`}
            onClick={() => handleApply(t.id)}
            title={t.description}
          >
            <div
              className="template-mini-preview"
              style={{
                background: t.styling.brand.background_color,
                borderRadius: Math.min(t.styling.shape.border_radius_panel, 6) + "px",
                border: `${Math.min(t.styling.shape.border_width, 1) || 0}px solid #e5e7eb`,
              }}
            >
              <div
                className="tmpl-pill-bot"
                style={{
                  background: t.styling.brand.surface_color,
                  borderRadius: Math.min(t.styling.shape.border_radius_message, 6) + "px",
                  border: t.styling.shape.border_width > 0 ? "1px solid #d1d5db" : "none",
                }}
              />
              <div
                className="tmpl-pill-user"
                style={{
                  background: t.styling.brand.primary_color,
                  borderRadius: Math.min(t.styling.shape.border_radius_message, 6) + "px",
                }}
              />
            </div>
            <div className="template-name">{t.name}</div>
          </button>
        ))}
      </div>

      {widgetStyling.template_modified && activeTemplate && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span className="template-modified-hint">
            Modified from {activeTemplate.name}
          </span>
          <button
            type="button"
            className="template-reset-btn"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
