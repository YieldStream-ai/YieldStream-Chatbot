interface Props {
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  maxTokens: number;
  onMaxTokensChange: (v: number) => void;
  isActive: boolean;
  onIsActiveChange: (v: boolean) => void;
}

export default function PromptTab({
  systemPrompt,
  onSystemPromptChange,
  maxTokens,
  onMaxTokensChange,
  isActive,
  onIsActiveChange,
}: Props) {
  const estimatedTokens = Math.round(systemPrompt.length / 4);

  return (
    <div className="tab-section">
      <label className="label">
        <textarea
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          className="input prompt-textarea"
          placeholder="You are a helpful assistant..."
        />
      </label>

      <div className="prompt-footer">
        <span className="token-counter">
          ~{estimatedTokens} / 8000 tokens
        </span>
        <span className="prompt-footer-sep">·</span>
        <span className="prompt-max-response">
          Max response: {maxTokens}
        </span>
        <a href="#" className="prompt-sandbox-link" onClick={(e) => e.preventDefault()}>
          Test in sandbox &rarr;
        </a>
      </div>

      <div className="prompt-controls">
        <label className="label">
          Max Tokens
          <span className="hint">Maximum length of each AI response (1-8192).</span>
          <input
            type="number"
            min={1}
            max={8192}
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(Number(e.target.value))}
            className="input input-narrow"
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => onIsActiveChange(e.target.checked)}
          />
          Client active
        </label>
      </div>
    </div>
  );
}
