import type { MotionTokens } from "../../types";
import StyleSection, { SegmentedField, ToggleField } from "./StyleSection";

interface Props {
  motion: MotionTokens;
  onChange: (motion: MotionTokens) => void;
  modifiedCount?: number;
}

export default function MotionSection({ motion, onChange, modifiedCount }: Props) {
  function set<K extends keyof MotionTokens>(key: K, value: MotionTokens[K]) {
    onChange({ ...motion, [key]: value });
  }

  return (
    <StyleSection title="Motion" modifiedCount={modifiedCount}>
      <SegmentedField
        label="Animation Style"
        value={motion.animation_style}
        options={[
          { value: "slide", label: "Slide" },
          { value: "fade", label: "Fade" },
          { value: "scale", label: "Scale" },
          { value: "none", label: "None" },
        ]}
        onChange={(v) => set("animation_style", v as MotionTokens["animation_style"])}
      />
      <SegmentedField
        label="Animation Speed"
        value={motion.animation_speed}
        options={[
          { value: "slow", label: "Slow" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
          { value: "instant", label: "Instant" },
        ]}
        onChange={(v) => set("animation_speed", v as MotionTokens["animation_speed"])}
      />
      <ToggleField
        label="Respect Reduced Motion"
        checked={motion.respect_reduced_motion}
        onChange={(v) => set("respect_reduced_motion", v)}
      />
    </StyleSection>
  );
}
