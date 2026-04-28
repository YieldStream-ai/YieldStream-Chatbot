import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../hooks/useApi";
import type { Client, APIKey, APIKeyCreateResponse } from "../types";
import PromptTab from "./PromptTab";
import WidgetTab from "./WidgetTab";
import ApiKeysTab from "./ApiKeysTab";
import LimitsTab from "./LimitsTab";
import "./CenterPanel.css";

type Tab = "prompt" | "widget" | "keys" | "limits";

interface Props {
  clientId: string;
  onClientDeleted: () => void;
  onClientUpdated: () => void;
}

export default function CenterPanel({
  clientId,
  onClientDeleted,
  onClientUpdated,
}: Props) {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [tab, setTab] = useState<Tab>("prompt");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newKeyRaw, setNewKeyRaw] = useState("");

  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [themeColor, setThemeColor] = useState("#ea580c");
  const [allowedOrigins, setAllowedOrigins] = useState("");
  const [maxTokens, setMaxTokens] = useState(1024);
  const [modelName, setModelName] = useState("gemini-2.0-flash");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadClient();
    loadKeys();
  }, [clientId]);

  async function loadClient() {
    try {
      const data = await api.get<Client>(`/clients/${clientId}`);
      setClient(data);
      setSystemPrompt(data.system_prompt);
      setWelcomeMessage(data.welcome_message);
      setThemeColor(data.theme_color);
      setAllowedOrigins(data.allowed_origins);
      setMaxTokens(data.max_tokens);
      setModelName(data.model_name);
      setIsActive(data.is_active);
    } catch {
      navigate("/");
    }
  }

  async function loadKeys() {
    try {
      const data = await api.get<APIKey[]>(`/clients/${clientId}/api-keys`);
      setKeys(data);
    } catch {}
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await api.patch(`/clients/${clientId}`, {
        system_prompt: systemPrompt,
        welcome_message: welcomeMessage,
        theme_color: themeColor,
        allowed_origins: allowedOrigins,
        max_tokens: maxTokens,
        model_name: modelName,
        is_active: isActive,
      });
      setMessage("Saved!");
      setTimeout(() => setMessage(""), 2000);
      loadClient();
      onClientUpdated();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateKey() {
    try {
      const res = await api.post<APIKeyCreateResponse>(
        `/clients/${clientId}/api-keys`
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
    await api.delete(`/clients/${clientId}/api-keys/${keyId}`);
    loadKeys();
  }

  async function handleDeleteClient() {
    if (!confirm(`Delete "${client?.name}"? This cannot be undone.`)) return;
    await api.delete(`/clients/${clientId}`);
    onClientDeleted();
  }

  if (!client) {
    return (
      <div className="center-panel">
        <p className="center-loading">Loading...</p>
      </div>
    );
  }

  const embedCode = `<script
  src="YOUR_CDN_URL/chat-widget.min.js"
  data-api-key="YOUR_API_KEY"
  data-api-url="${window.location.origin.replace("5173", "8000")}"
  data-position="bottom-right"
  async defer
><\/script>`;

  const tabs: { key: Tab; label: string }[] = [
    { key: "prompt", label: "Prompt" },
    { key: "widget", label: "Widget" },
    { key: "keys", label: "API keys" },
    { key: "limits", label: "Limits" },
  ];

  return (
    <div className="center-panel">
      <div className="center-header">
        <div className="center-header-left">
          <div className="center-title-row">
            <h1 className="center-client-name">{client.name}</h1>
            <button
              className={`center-active-badge ${isActive ? "active" : "inactive"}`}
              onClick={() => setIsActive(!isActive)}
              title={isActive ? "Click to deactivate" : "Click to activate"}
            >
              {isActive ? "Active" : "Inactive"}
            </button>
          </div>
          <span className="center-meta">
            {client.slug} · {modelName}
          </span>
        </div>
        <div className="center-header-right">
          {message && (
            <span
              className={
                message.startsWith("Error") ? "error-text" : "success-text"
              }
            >
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="center-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`center-tab ${tab === t.key ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "prompt" && (
        <PromptTab
          systemPrompt={systemPrompt}
          onSystemPromptChange={setSystemPrompt}
          maxTokens={maxTokens}
          onMaxTokensChange={setMaxTokens}
          modelName={modelName}
          onModelNameChange={setModelName}
        />
      )}

      {tab === "widget" && (
        <WidgetTab
          welcomeMessage={welcomeMessage}
          onWelcomeMessageChange={setWelcomeMessage}
          themeColor={themeColor}
          onThemeColorChange={setThemeColor}
          embedCode={embedCode}
        />
      )}

      {tab === "keys" && (
        <ApiKeysTab
          allowedOrigins={allowedOrigins}
          onAllowedOriginsChange={setAllowedOrigins}
          keys={keys}
          newKeyRaw={newKeyRaw}
          onCreateKey={handleCreateKey}
          onRevokeKey={handleRevokeKey}
          onDismissNewKey={() => setNewKeyRaw("")}
          onDeleteClient={handleDeleteClient}
        />
      )}

      {tab === "limits" && <LimitsTab keys={keys} />}
    </div>
  );
}
