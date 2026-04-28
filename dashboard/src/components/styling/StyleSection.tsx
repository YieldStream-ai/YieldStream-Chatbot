import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function StyleSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="style-section">
      <button
        className="style-section-header"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{title}</span>
        <span className="style-section-chevron">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && <div className="style-section-body">{children}</div>}
    </div>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className="label">
      {label}
      <div className="color-row">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-picker"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input color-text"
          pattern="^#[0-9A-Fa-f]{6}$"
        />
      </div>
    </label>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}

export function SliderField({ label, value, min, max, unit = "px", onChange }: SliderFieldProps) {
  return (
    <label className="label">
      <span className="slider-label-row">
        <span>{label}</span>
        <span className="slider-value">{value}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-input"
      />
    </label>
  );
}

interface SegmentedFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function SegmentedField({ label, value, options, onChange }: SegmentedFieldProps) {
  return (
    <label className="label">
      {label}
      <div className="segmented-control">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`segmented-btn ${value === opt.value ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </label>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  return (
    <label className="label toggle-row">
      <span>{label}</span>
      <button
        type="button"
        className={`toggle-btn ${checked ? "active" : ""}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="toggle-knob" />
      </button>
    </label>
  );
}
