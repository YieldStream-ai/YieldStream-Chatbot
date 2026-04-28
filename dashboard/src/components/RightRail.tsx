import { useState, useRef } from "react";
import type { Client } from "../types";
import { mockStats, mockRecentMessages } from "../mockData";
import "./RightRail.css";

interface Props {
  client: Client | null;
  apiKey?: string;
  apiUrl?: string;
}

export default function RightRail({ client, apiKey, apiUrl }: Props) {
  const [previewInput, setPreviewInput] = useState("");
  const [previewMessages, setPreviewMessages] = useState<
    { role: "bot" | "user"; text: string }[]
  >([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  if (!client) return <div className="right-rail" />;

  async function handlePreviewSend() {
    if (!previewInput.trim() || !apiKey || !apiUrl) return;

    const userMsg = previewInput.trim();
    setPreviewInput("");
    setPreviewMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const sessionId = `preview-${client!.id}`;
      const res = await fetch(`${apiUrl}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setPreviewMessages((prev) => [
          ...prev,
          { role: "bot", text: "Error connecting to API." },
        ]);
        setStreaming(false);
        return;
      }

      setPreviewMessages((prev) => [...prev, { role: "bot", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setPreviewMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "bot") {
                    updated[updated.length - 1] = {
                      ...last,
                      text: last.text + data.content,
                    };
                  }
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setPreviewMessages((prev) => [
          ...prev,
          { role: "bot", text: "Preview unavailable." },
        ]);
      }
    } finally {
      setStreaming(false);
    }
  }

  const hasApiKey = !!apiKey;

  return (
    <div className="right-rail">
      {/* Live Preview */}
      <div className="card right-card">
        <div className="card-title">LIVE PREVIEW</div>
        <div className="preview-widget">
          <div className="preview-bot-bubble">
            {client.welcome_message || "Hi! How can I help?"}
          </div>

          {previewMessages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user"
                  ? "preview-user-bubble"
                  : "preview-bot-bubble"
              }
            >
              {msg.text || (streaming && i === previewMessages.length - 1 ? "..." : "")}
            </div>
          ))}

          {hasApiKey ? (
            <div className="preview-input-row">
              <input
                type="text"
                className="input preview-input"
                placeholder="Test a message..."
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !streaming && handlePreviewSend()}
                disabled={streaming}
              />
              <button
                className="preview-send-btn"
                onClick={handlePreviewSend}
                disabled={streaming || !previewInput.trim()}
              >
                &rarr;
              </button>
            </div>
          ) : (
            <p className="preview-hint">
              Generate an API key to enable live testing.
            </p>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="card right-card">
        <div className="card-title">TODAY</div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{mockStats.messages}</span>
            <span className="stat-label">Messages</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {mockStats.tokens >= 1000
                ? `${Math.round(mockStats.tokens / 1000)}k`
                : mockStats.tokens}
            </span>
            <span className="stat-label">Tokens</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{mockStats.sessions}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-item">
            <span className="stat-value stat-uptime">{mockStats.uptime}%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="card right-card">
        <div className="card-title">RECENT</div>
        <div className="recent-list">
          {mockRecentMessages.map((msg, i) => (
            <button key={i} className="recent-item" title="View full thread">
              <span className="recent-time">{msg.timestamp}</span>
              <span className="recent-sep">&middot;</span>
              <span className="recent-text">&ldquo;{msg.text}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
