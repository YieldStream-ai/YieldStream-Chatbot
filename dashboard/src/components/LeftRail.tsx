import { useState } from "react";
import { Link } from "react-router-dom";
import type { Client } from "../types";
import "./LeftRail.css";

interface Props {
  clients: Client[];
  selectedId: string | undefined;
  onNewClient: () => void;
  onLogout: () => void;
}

export default function LeftRail({
  clients,
  selectedId,
  onNewClient,
  onLogout,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  function getAdminEmail(): string {
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) return "Admin";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || payload.sub || "Admin";
    } catch {
      return "Admin";
    }
  }

  return (
    <div className="left-rail">
      <div className="left-rail-header">
        <span className="left-rail-title">CLIENTS</span>
      </div>

      <div className="left-rail-search">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input left-rail-search-input"
        />
      </div>

      <div className="left-rail-list">
        {filtered.map((client) => (
          <Link
            to={`/clients/${client.id}`}
            key={client.id}
            className={`left-rail-item ${client.id === selectedId ? "active" : ""}`}
          >
            <span
              className={`left-rail-dot ${client.is_active ? "active" : "inactive"}`}
            />
            <span className="left-rail-item-name">{client.name}</span>
          </Link>
        ))}
        {filtered.length === 0 && clients.length > 0 && (
          <p className="left-rail-empty">
            No matches for &ldquo;{search}&rdquo;
          </p>
        )}
        {clients.length === 0 && (
          <p className="left-rail-empty">
            No clients yet. Create one below.
          </p>
        )}
      </div>

      <div className="left-rail-bottom">
        <button onClick={onNewClient} className="left-rail-new-btn">
          + New client
        </button>

        <div className="left-rail-account">
          <span className="left-rail-email">{getAdminEmail()}</span>
          <button onClick={onLogout} className="left-rail-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
