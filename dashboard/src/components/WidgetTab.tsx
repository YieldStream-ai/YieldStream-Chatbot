import { useState } from "react";
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
  savedStyling: WidgetStyling;
  onStylingChange: (styling: WidgetStyling) => void;
  onTemplateApply: (styling: WidgetStyling) => void;
}

function countModified(current: Record<string, any>, baseline: Record<string, any>): number {
  let count = 0;
  for (const key of Object.keys(current)) {
    if (current[key] !== baseline[key]) count++;
  }
  return count;
}

export default function WidgetTab({
  welcomeMessage,
  onWelcomeMessageChange,
  embedCode,
  widgetStyling,
  savedStyling,
  onStylingChange,
  onTemplateApply,
}: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          modifiedCount={countModified(widgetStyling.brand, savedStyling.brand)}
        />
        <TypographySection
          typography={widgetStyling.typography}
          onChange={(typography) => onStylingChange({ ...widgetStyling, typography })}
          modifiedCount={countModified(widgetStyling.typography, savedStyling.typography)}
        />
        <ShapeSection
          shape={widgetStyling.shape}
          onChange={(shape) => onStylingChange({ ...widgetStyling, shape })}
          modifiedCount={countModified(widgetStyling.shape, savedStyling.shape)}
        />
        <LayoutSection
          layout={widgetStyling.layout}
          onChange={(layout) => onStylingChange({ ...widgetStyling, layout })}
          modifiedCount={countModified(widgetStyling.layout, savedStyling.layout)}
        />
        <MotionSection
          motion={widgetStyling.motion}
          onChange={(motion) => onStylingChange({ ...widgetStyling, motion })}
          modifiedCount={countModified(widgetStyling.motion, savedStyling.motion)}
        />
      </div>

      <label className="label" style={{ marginTop: 16 }}>
        Embed Code
        <span className="hint">
          Paste this into any HTML page to add BubbleChat.
        </span>
        <div className="embed-code-wrapper">
          <textarea
            value={embedCode}
            readOnly
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="input embed-code"
          />
          <button type="button" className="btn-copy" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </label>
    </div>
  );
}
