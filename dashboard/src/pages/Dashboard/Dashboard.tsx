import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, clearToken } from "../../hooks/useApi";
import type { Client, WidgetStyling } from "../../types";
import { DEFAULT_WIDGET_STYLING } from "../../types";
import LeftRail from "../../components/LeftRail";
import CenterPanel from "../../components/CenterPanel";
import RightRail from "../../components/RightRail";
import EmptyState from "../../components/EmptyState";
import CreateClientModal from "../../components/CreateClientModal";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApiKey, setActiveApiKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewStyling, setPreviewStyling] = useState<WidgetStyling>(DEFAULT_WIDGET_STYLING);
  const [previewWelcome, setPreviewWelcome] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (!loading && clients.length > 0 && !id) {
      navigate(`/clients/${clients[0].id}`, { replace: true });
    }
  }, [loading, clients, id]);

  useEffect(() => {
    if (id) {
      loadFirstApiKey(id);
      // Initialize preview from selected client
      const client = clients.find((c) => c.id === id);
      if (client) {
        setPreviewStyling(client.widget_styling || DEFAULT_WIDGET_STYLING);
        setPreviewWelcome(client.welcome_message);
      }
    } else {
      setActiveApiKey(null);
    }
  }, [id, clients]);

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

  async function loadFirstApiKey(_clientId: string) {
    setActiveApiKey(null);
  }

  async function handleCreateClient(name: string, slug: string) {
    const created = await api.post<Client>("/clients", { name, slug });
    await loadClients();
    navigate(`/clients/${created.id}`);
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
        onNewClient={() => setShowCreateModal(true)}
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
            onStylingChange={setPreviewStyling}
          />
          <RightRail
            client={selectedClient}
            apiKey={activeApiKey || undefined}
            apiUrl={API_URL}
            previewStyling={previewStyling}
            previewWelcome={previewWelcome}
          />
        </>
      ) : null}

      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClient}
        />
      )}
    </div>
  );
}
