import type { WidgetStyling } from "../types";
import TemplateSelector from "./styling/TemplateSelector";
import BrandSection from "./styling/BrandSection";
import TypographySection from "./styling/TypographySection";
import ShapeSection from "./styling/ShapeSection";
import LayoutSection from "./styling/LayoutSection";
import MotionSection from "./styling/MotionSection";

interface Props {
  welcomeMessage: string;
  onWelcomeMessageChange: (v: string) => void;
  embedCode: string;
  widgetStyling: WidgetStyling;
  onStylingChange: (styling: WidgetStyling) => void;
  onTemplateApply: (styling: WidgetStyling) => void;
}

export default function WidgetTab({
  welcomeMessage,
  onWelcomeMessageChange,
  embedCode,
  widgetStyling,
  onStylingChange,
  onTemplateApply,
}: Props) {
  return (
    <div className="tab-section">
      <label className="label">
        Welcome Message
        <input
          value={welcomeMessage}
          onChange={(e) => onWelcomeMessageChange(e.target.value)}
          className="input"
        />
      </label>

      <TemplateSelector
        widgetStyling={widgetStyling}
        onApply={onTemplateApply}
      />

      <div className="styling-sections">
        <BrandSection
          brand={widgetStyling.brand}
          onChange={(brand) => onStylingChange({ ...widgetStyling, brand })}
        />
        <TypographySection
          typography={widgetStyling.typography}
          onChange={(typography) => onStylingChange({ ...widgetStyling, typography })}
        />
        <ShapeSection
          shape={widgetStyling.shape}
          onChange={(shape) => onStylingChange({ ...widgetStyling, shape })}
        />
        <LayoutSection
          layout={widgetStyling.layout}
          onChange={(layout) => onStylingChange({ ...widgetStyling, layout })}
        />
        <MotionSection
          motion={widgetStyling.motion}
          onChange={(motion) => onStylingChange({ ...widgetStyling, motion })}
        />
      </div>

      <label className="label" style={{ marginTop: 16 }}>
        Embed Code
        <span className="hint">
          Paste this into any HTML page to add the chat widget.
        </span>
        <textarea
          value={embedCode}
          readOnly
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          className="input embed-code"
        />
      </label>
    </div>
  );
}
