import type { ShapeTokens } from "../../types";
import StyleSection, { SliderField } from "./StyleSection";

interface Props {
  shape: ShapeTokens;
  onChange: (shape: ShapeTokens) => void;
  modifiedCount?: number;
}

export default function ShapeSection({ shape, onChange, modifiedCount }: Props) {
  function set<K extends keyof ShapeTokens>(key: K, value: ShapeTokens[K]) {
    onChange({ ...shape, [key]: value });
  }

  return (
    <StyleSection title="Shape" modifiedCount={modifiedCount}>
      <SliderField label="Panel Radius" value={shape.border_radius_panel} min={0} max={24} onChange={(v) => set("border_radius_panel", v)} />
      <SliderField label="Bubble Radius" value={shape.border_radius_bubble} min={0} max={28} onChange={(v) => set("border_radius_bubble", v)} />
      <SliderField label="Message Radius" value={shape.border_radius_message} min={0} max={20} onChange={(v) => set("border_radius_message", v)} />
      <SliderField label="Border Width" value={shape.border_width} min={0} max={2} onChange={(v) => set("border_width", v)} />
    </StyleSection>
  );
}
