interface Props {
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  maxTokens: number;
  onMaxTokensChange: (v: number) => void;
  modelName: string;
  onModelNameChange: (v: string) => void;
}

const MODELS = [
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-pro", label: "Gemini 2.0 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

export default function PromptTab({
  systemPrompt,
  onSystemPromptChange,
  maxTokens,
  onMaxTokensChange,
  modelName,
  onModelNameChange,
}: Props) {
  const estimatedTokens = Math.round(systemPrompt.length / 4);

  return (
    <div className="tab-section">
      <textarea
        value={systemPrompt}
        onChange={(e) => onSystemPromptChange(e.target.value)}
        className="input prompt-textarea"
        rows={12}
        placeholder="You are a helpful assistant..."
      />

      <div className="prompt-footer">
        <span className="token-counter">
          ~{estimatedTokens} / 8000 tokens
        </span>
        <span className="prompt-footer-sep">·</span>
        <span className="prompt-max-response">
          Max response:
        </span>
        <input
          type="number"
          min={1}
          max={8192}
          value={maxTokens}
          onChange={(e) => onMaxTokensChange(Number(e.target.value))}
          className="input prompt-max-input"
        />
      </div>

      <div className="prompt-model-row">
        <label className="label">
          Model
          <select
            value={modelName}
            onChange={(e) => onModelNameChange(e.target.value)}
            className="input prompt-model-select"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
