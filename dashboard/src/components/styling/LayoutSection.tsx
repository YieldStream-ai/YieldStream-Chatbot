import type { LayoutTokens } from "../../types";
import StyleSection, { SliderField, SegmentedField } from "./StyleSection";

interface Props {
  layout: LayoutTokens;
  onChange: (layout: LayoutTokens) => void;
  modifiedCount?: number;
}

export default function LayoutSection({ layout, onChange, modifiedCount }: Props) {
  function set<K extends keyof LayoutTokens>(key: K, value: LayoutTokens[K]) {
    onChange({ ...layout, [key]: value });
  }

  return (
    <StyleSection title="Layout" modifiedCount={modifiedCount}>
      <SegmentedField
        label="Position"
        value={layout.position}
        options={[
          { value: "bottom-right", label: "BR" },
          { value: "bottom-left", label: "BL" },
          { value: "top-right", label: "TR" },
          { value: "top-left", label: "TL" },
        ]}
        onChange={(v) => set("position", v as LayoutTokens["position"])}
      />
      <SliderField label="Horizontal Offset" value={layout.offset_x} min={0} max={80} onChange={(v) => set("offset_x", v)} />
      <SliderField label="Vertical Offset" value={layout.offset_y} min={0} max={80} onChange={(v) => set("offset_y", v)} />
      <SliderField label="Bubble Size" value={layout.bubble_size} min={48} max={72} onChange={(v) => set("bubble_size", v)} />
      <SliderField label="Panel Width" value={layout.panel_width} min={320} max={480} onChange={(v) => set("panel_width", v)} />
      <SliderField label="Panel Height" value={layout.panel_height} min={400} max={680} onChange={(v) => set("panel_height", v)} />
    </StyleSection>
  );
}
