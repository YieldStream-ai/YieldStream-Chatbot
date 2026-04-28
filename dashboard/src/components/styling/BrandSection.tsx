import type { BrandTokens } from "../../types";
import StyleSection, { ColorField } from "./StyleSection";

interface Props {
  brand: BrandTokens;
  onChange: (brand: BrandTokens) => void;
  modifiedCount?: number;
}

export default function BrandSection({ brand, onChange, modifiedCount }: Props) {
  function set<K extends keyof BrandTokens>(key: K, value: BrandTokens[K]) {
    onChange({ ...brand, [key]: value });
  }

  return (
    <StyleSection title="Brand" defaultOpen modifiedCount={modifiedCount}>
      <div className="brand-grid">
        <ColorField label="Primary" value={brand.primary_color} onChange={(v) => set("primary_color", v)} />
        <ColorField label="Primary Text" value={brand.primary_text_color} onChange={(v) => set("primary_text_color", v)} />
        <ColorField label="Background" value={brand.background_color} onChange={(v) => set("background_color", v)} />
        <ColorField label="Surface (Bot)" value={brand.surface_color} onChange={(v) => set("surface_color", v)} />
        <ColorField label="Text" value={brand.text_color} onChange={(v) => set("text_color", v)} />
        <ColorField label="Muted Text" value={brand.text_muted_color} onChange={(v) => set("text_muted_color", v)} />
      </div>
    </StyleSection>
  );
}
