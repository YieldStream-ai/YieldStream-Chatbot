import { useState } from "react";
import { Link } from "react-router-dom";
import type { Client } from "../types";
import "./LeftRail.css";

interface Props {
  clients: Client[];
  selectedId: string | undefined;
  onCreateClient: (name: string, slug: string) => Promise<void>;
  onLogout: () => void;
}

export default function LeftRail({
  clients,
  selectedId,
  onCreateClient,
  onLogout,
}: Props) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [createError, setCreateError] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    try {
      await onCreateClient(newName, newSlug);
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
    } catch (err: any) {
      setCreateError(err.message);
    }
  }

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
        {filtered.length === 0 && (
          <p className="left-rail-empty">No clients found.</p>
        )}
      </div>

      <div className="left-rail-bottom">
        {showCreate ? (
          <form onSubmit={handleCreate} className="left-rail-create-form">
            <input
              placeholder="Client name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input"
              required
            />
            <input
              placeholder="slug"
              value={newSlug}
              onChange={(e) =>
                setNewSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                )
              }
              className="input"
              required
            />
            {createError && <span className="error-text">{createError}</span>}
            <div className="left-rail-create-actions">
              <button type="submit" className="btn-primary">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="left-rail-new-btn"
          >
            + New client
          </button>
        )}

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
