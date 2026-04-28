import type { APIKey } from "../types";

interface Props {
  allowedOrigins: string;
  onAllowedOriginsChange: (v: string) => void;
  keys: APIKey[];
  newKeyRaw: string;
  onCreateKey: () => void;
  onRevokeKey: (keyId: string) => void;
  onDismissNewKey: () => void;
  onDeleteClient: () => void;
}

export default function ApiKeysTab({
  allowedOrigins,
  onAllowedOriginsChange,
  keys,
  newKeyRaw,
  onCreateKey,
  onRevokeKey,
  onDismissNewKey,
  onDeleteClient,
}: Props) {
  return (
    <div className="tab-section">
      <label className="label">
        Allowed Origins (CORS)
        <span className="hint">
          Comma-separated list of domains that can use this widget. e.g.
          https://acme.com,https://staging.acme.com
        </span>
        <input
          value={allowedOrigins}
          onChange={(e) => onAllowedOriginsChange(e.target.value)}
          className="input"
          placeholder="https://example.com,https://staging.example.com"
        />
      </label>

      <div className="keys-section">
        <div className="keys-header">
          <h3>API Keys</h3>
          <button onClick={onCreateKey} className="btn-primary">
            + Generate Key
          </button>
        </div>

        {newKeyRaw && (
          <div className="key-alert">
            <strong>New API Key (copy now — won't be shown again):</strong>
            <code
              className="key-code"
              onClick={(e) => {
                navigator.clipboard.writeText(newKeyRaw);
                (e.target as HTMLElement).textContent = "Copied!";
                setTimeout(() => {
                  (e.target as HTMLElement).textContent = newKeyRaw;
                }, 1500);
              }}
            >
              {newKeyRaw}
            </code>
            <button onClick={onDismissNewKey} className="btn-secondary">
              Dismiss
            </button>
          </div>
        )}

        {keys.length === 0 ? (
          <p className="keys-empty">No API keys yet.</p>
        ) : (
          <table className="keys-table">
            <thead>
              <tr>
                <th>Key Prefix</th>
                <th>RPM</th>
                <th>RPD</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <code>{k.key_prefix}...</code>
                  </td>
                  <td>{k.rate_limit_rpm}</td>
                  <td>{k.rate_limit_rpd}</td>
                  <td>
                    <span
                      className={
                        k.is_active ? "status-active" : "status-revoked"
                      }
                    >
                      {k.is_active ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td>
                    {k.is_active && (
                      <button
                        onClick={() => onRevokeKey(k.id)}
                        className="btn-secondary btn-revoke"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="danger-zone">
        <button onClick={onDeleteClient} className="btn-secondary btn-danger">
          Delete Client
        </button>
      </div>
    </div>
  );
}
