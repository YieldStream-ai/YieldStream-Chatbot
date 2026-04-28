import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, clearToken } from "../../hooks/useApi";
import type { Client } from "../../types";
import LeftRail from "../../components/LeftRail";
import CenterPanel from "../../components/CenterPanel";
import RightRail from "../../components/RightRail";
import EmptyState from "../../components/EmptyState";
import "./Dashboard.css";

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!loading && clients.length > 0 && !id) {
      navigate(`/clients/${clients[0].id}`, { replace: true });
    }
  }, [loading, clients, id]);

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

  async function handleCreateClient(name: string, slug: string) {
    await api.post("/clients", { name, slug });
    await loadClients();
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  function handleClientDeleted() {
    loadClients();
    navigate("/", { replace: true });
  }

  const selectedClient = clients.find((c) => c.id === id) || null;

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <LeftRail
        clients={clients}
        selectedId={id}
        onCreateClient={handleCreateClient}
        onLogout={handleLogout}
      />

      {clients.length === 0 ? (
        <EmptyState />
      ) : id ? (
        <>
          <CenterPanel
            key={id}
            clientId={id}
            onClientDeleted={handleClientDeleted}
            onClientUpdated={loadClients}
          />
          <RightRail client={selectedClient} />
        </>
      ) : null}
    </div>
  );
}
