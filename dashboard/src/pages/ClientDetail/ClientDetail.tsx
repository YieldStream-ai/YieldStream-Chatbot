import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../hooks/useApi";
import type { Client, APIKey, APIKeyCreateResponse } from "../../types";
import "./ClientDetail.css";

type Tab = "prompt" | "widget" | "security";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [tab, setTab] = useState<Tab>("prompt");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newKeyRaw, setNewKeyRaw] = useState("");

  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [themeColor, setThemeColor] = useState("#4F46E5");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [maxTokens, setMaxTokens] = useState(1024);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadClient();
    loadKeys();
  }, [id]);

  async function loadClient() {
    try {
      const data = await api.get<Client>(`/clients/${id}`);
      setClient(data);
      setSystemPrompt(data.system_prompt);
      setWelcomeMessage(data.welcome_message);
      setThemeColor(data.theme_color);
      setAllowedOrigins(data.allowed_origins);
      setMaxTokens(data.max_tokens);
      setIsActive(data.is_active);
    } catch {
      navigate("/");
    }
  }

  async function loadKeys() {
    try {
      const data = await api.get<APIKey[]>(`/clients/${id}/api-keys`);
      setKeys(data);
    } catch {}
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await api.patch(`/clients/${id}`, {
        system_prompt: systemPrompt,
        welcome_message: welcomeMessage,
        theme_color: themeColor,
        allowed_origins: allowedOrigins,
        max_tokens: maxTokens,
        is_active: isActive,
      });
      setMessage("Saved!");
      setTimeout(() => setMessage(""), 2000);
      loadClient();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateKey() {
    try {
      const res = await api.post<APIKeyCreateResponse>(
        `/clients/${id}/api-keys`
      );
      setNewKeyRaw(res.raw_key);
      loadKeys();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (
      !confirm("Revoke this API key? Any widgets using it will stop working.")
    )
      return;
    await api.delete(`/clients/${id}/api-keys/${keyId}`);
    loadKeys();
  }

  async function handleDeleteClient() {
    if (!confirm(`Delete "${client?.name}"? This cannot be undone.`)) return;
    await api.delete(`/clients/${id}`);
    navigate("/");
  }

  if (!client)
    return (
      <div className="detail-container">
        <p>Loading...</p>
      </div>
    );

  const embedCode = `<script
  src="YOUR_CDN_URL/chat-widget.min.js"
  data-api-key="YOUR_API_KEY"
  data-api-url="${window.location.origin.replace("5173", "8000")}"
  data-position="bottom-right"
  async defer
><\/script>`;

  return (
    <div className="detail-container">
      <div className="detail-top-bar">
        <Link to="/" className="detail-back-link">
          &larr; All Clients
        </Link>
        <div className="detail-title-row">
          <h1>{client.name}</h1>
          <span
            className={`detail-badge ${isActive ? "active" : "inactive"}`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {(["prompt", "widget", "security"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`detail-tab ${tab === t ? "active" : ""}`}
          >
            {t === "prompt"
              ? "System Prompt"
              : t === "widget"
                ? "Widget Config"
                : "API Keys & Security"}
          </button>
        ))}
      </div>

      {/* Save bar */}
      <div className="detail-save-bar">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {message && (
          <span
            className={
              message.startsWith("Error") ? "error-text" : "success-text"
            }
          >
            {message}
          </span>
        )}
      </div>

      {/* Prompt tab */}
      {tab === "prompt" && (
        <div className="detail-section">
          <label className="label">
            System Prompt
            <span className="hint">
              This is injected server-side into every Gemini call. The widget
              user never sees it.
            </span>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="input"
            />
          </label>
          <label className="label">
            Max Tokens
            <span className="hint">
              Maximum length of each AI response (1-8192).
            </span>
            <input
              type="number"
              min={1}
              max={8192}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="input input-narrow"
            />
          </label>
          <label className="detail-checkbox-row">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Client active
          </label>
        </div>
      )}

      {/* Widget tab */}
      {tab === "widget" && (
        <div className="detail-section">
          <label className="label">
            Welcome Message
            <input
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="input"
            />
          </label>
          <label className="label">
            Theme Color
            <div className="detail-color-row">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="detail-color-picker"
              />
              <input
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="input detail-color-text"
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
              className="input detail-embed-code"
            />
          </label>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="detail-section">
          <label className="label">
            Allowed Origins (CORS)
            <span className="hint">
              Comma-separated list of domains that can use this widget. e.g.
              https://acme.com,https://staging.acme.com
            </span>
            <input
              value={allowedOrigins}
              onChange={(e) => setAllowedOrigins(e.target.value)}
              className="input"
              placeholder="https://example.com,https://staging.example.com"
            />
          </label>

          <div className="detail-keys-section">
            <div className="detail-keys-header">
              <h3>API Keys</h3>
              <button onClick={handleCreateKey} className="btn-primary">
                + Generate Key
              </button>
            </div>

            {newKeyRaw && (
              <div className="detail-key-alert">
                <strong>
                  New API Key (copy now — won't be shown again):
                </strong>
                <code
                  className="detail-key-code"
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
                <button
                  onClick={() => setNewKeyRaw("")}
                  className="btn-secondary"
                >
                  Dismiss
                </button>
              </div>
            )}

            {keys.length === 0 ? (
              <p className="detail-keys-empty">No API keys yet.</p>
            ) : (
              <table className="detail-table">
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
                            k.is_active
                              ? "detail-status-active"
                              : "detail-status-revoked"
                          }
                        >
                          {k.is_active ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td>
                        {k.is_active && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
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

          <div className="detail-danger-zone">
            <button
              onClick={handleDeleteClient}
              className="btn-secondary btn-danger"
            >
              Delete Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
