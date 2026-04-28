interface Props {
  welcomeMessage: string;
  onWelcomeMessageChange: (v: string) => void;
  themeColor: string;
  onThemeColorChange: (v: string) => void;
  embedCode: string;
}

export default function WidgetTab({
  welcomeMessage,
  onWelcomeMessageChange,
  themeColor,
  onThemeColorChange,
  embedCode,
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

      <label className="label">
        Theme Color
        <div className="color-row">
          <input
            type="color"
            value={themeColor}
            onChange={(e) => onThemeColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            value={themeColor}
            onChange={(e) => onThemeColorChange(e.target.value)}
            className="input color-text"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      </label>

      <label className="label">
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
