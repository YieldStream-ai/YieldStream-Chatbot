import type { Client } from "../types";
import { mockStats, mockRecentMessages } from "../mockData";
import "./RightRail.css";

interface Props {
  client: Client | null;
}

export default function RightRail({ client }: Props) {
  if (!client) return <div className="right-rail" />;

  return (
    <div className="right-rail">
      {/* Live Preview */}
      <div className="card right-card">
        <div className="card-title">LIVE PREVIEW</div>
        <div className="preview-widget">
          <div
            className="preview-bot-bubble"
            style={{ background: client.theme_color, color: "white" }}
          >
            {client.welcome_message || "Hi! How can I help?"}
          </div>
          <div className="preview-user-bubble">What are your hours?</div>
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
            <div key={i} className="recent-item">
              <span className="recent-time">{msg.timestamp}</span>
              <span className="recent-sep">·</span>
              <span className="recent-text">"{msg.text}"</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
