import type { APIKey } from "../types";

interface Props {
  keys: APIKey[];
}

export default function LimitsTab({ keys }: Props) {
  const activeKeys = keys.filter((k) => k.is_active);

  return (
    <div className="tab-section">
      <p className="hint" style={{ marginBottom: 16 }}>
        Rate limits are applied per API key. Adjust RPM (requests per minute)
        and RPD (requests per day) for each key.
      </p>

      {activeKeys.length === 0 ? (
        <p className="keys-empty">No active API keys to configure.</p>
      ) : (
        <table className="keys-table">
          <thead>
            <tr>
              <th>Key Prefix</th>
              <th>RPM</th>
              <th>RPD</th>
            </tr>
          </thead>
          <tbody>
            {activeKeys.map((k) => (
              <tr key={k.id}>
                <td>
                  <code>{k.key_prefix}...</code>
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={k.rate_limit_rpm}
                    className="input input-narrow"
                    min={1}
                    disabled
                    title="Rate limit editing coming soon"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    defaultValue={k.rate_limit_rpd}
                    className="input input-narrow"
                    min={1}
                    disabled
                    title="Rate limit editing coming soon"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="hint" style={{ marginTop: 16 }}>
        Editable rate limits will be available once the backend endpoint is
        implemented.
      </p>
    </div>
  );
}
