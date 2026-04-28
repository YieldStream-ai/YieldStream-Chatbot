import type { TypographyTokens } from "../../types";
import StyleSection, { SliderField, SegmentedField } from "./StyleSection";

interface Props {
  typography: TypographyTokens;
  onChange: (typography: TypographyTokens) => void;
  modifiedCount?: number;
}

const FONT_PRESETS: { value: string; label: string; url?: string }[] = [
  { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: "System" },
  { value: "Inter, system-ui, sans-serif", label: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
  { value: "Roboto, system-ui, sans-serif", label: "Roboto", url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" },
  { value: "'Open Sans', system-ui, sans-serif", label: "Open Sans", url: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" },
  { value: "Lato, system-ui, sans-serif", label: "Lato", url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" },
  { value: "'Source Sans 3', system-ui, sans-serif", label: "Source Sans", url: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" },
  { value: "'IBM Plex Sans', system-ui, sans-serif", label: "IBM Plex", url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
];

export default function TypographySection({ typography, onChange, modifiedCount }: Props) {
  function set<K extends keyof TypographyTokens>(key: K, value: TypographyTokens[K]) {
    onChange({ ...typography, [key]: value });
  }

  const currentPreset = FONT_PRESETS.find((p) => p.value === typography.font_family);

  return (
    <StyleSection title="Typography" modifiedCount={modifiedCount}>
      <label className="label">
        Font Family
        <select
          className="input"
          value={currentPreset ? typography.font_family : "__custom__"}
          onChange={(e) => {
            if (e.target.value === "__custom__") return;
            const preset = FONT_PRESETS.find((p) => p.value === e.target.value);
            onChange({
              ...typography,
              font_family: e.target.value,
              font_url: preset?.url || null,
            });
          }}
        >
          {FONT_PRESETS.map((p) => (
            <option key={p.label} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>

      <SliderField label="Base Font Size" value={typography.font_size_base} min={12} max={18} onChange={(v) => set("font_size_base", v)} />

      <SegmentedField
        label="Body Weight"
        value={String(typography.font_weight_body)}
        options={[
          { value: "400", label: "Regular" },
          { value: "500", label: "Medium" },
        ]}
        onChange={(v) => set("font_weight_body", Number(v))}
      />

      <SegmentedField
        label="Heading Weight"
        value={String(typography.font_weight_heading)}
        options={[
          { value: "500", label: "Medium" },
          { value: "600", label: "Semi" },
          { value: "700", label: "Bold" },
        ]}
        onChange={(v) => set("font_weight_heading", Number(v))}
      />
    </StyleSection>
  );
}
