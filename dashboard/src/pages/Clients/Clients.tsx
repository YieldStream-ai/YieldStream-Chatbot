import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, clearToken } from "../../hooks/useApi";
import type { Client } from "../../types";
import "./Clients.css";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const data = await api.get<Client[]>("/clients");
      setClients(data);
    } catch {
      // 401 handled by api hook
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    try {
      await api.post("/clients", { name: newName, slug: newSlug });
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      loadClients();
    } catch (err: any) {
      setCreateError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  if (loading)
    return (
      <div className="clients-container">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1>Clients</h1>
        <div className="clients-header-actions">
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + New Client
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="clients-create-form">
          <input
            placeholder="Client name (e.g. Acme Corp)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input"
            required
          />
          <input
            placeholder="Slug (e.g. acme-corp)"
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
          <div className="clients-create-actions">
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
      )}

      {clients.length === 0 ? (
        <p className="clients-empty">
          No clients yet. Create one to get started.
        </p>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <Link
              to={`/clients/${client.id}`}
              key={client.id}
              className="client-card"
            >
              <div className="client-card-header">
                <span
                  className={`client-card-dot ${client.is_active ? "active" : "inactive"}`}
                />
                <strong>{client.name}</strong>
              </div>
              <div className="client-card-slug">{client.slug}</div>
              <div className="client-card-meta">
                <span
                  className="client-card-color-swatch"
                  style={{ background: client.theme_color }}
                />
                {client.model_name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
