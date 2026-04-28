import { useState } from "react";
import "./CreateClientModal.css";

interface Props {
  onClose: () => void;
  onCreate: (name: string, slug: string) => Promise<void>;
}

export default function CreateClientModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === toSlug(name)) {
      setSlug(toSlug(value));
    }
  }

  function toSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await onCreate(name, slug);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">New Client</h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="label">
            Name
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input"
              placeholder="Acme Corp"
              required
              autoFocus
            />
          </label>

          <label className="label">
            Slug
            <span className="hint">
              URL-friendly identifier. Lowercase letters, numbers, and hyphens only.
            </span>
            <input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              className="input"
              placeholder="acme-corp"
              required
            />
          </label>

          {error && <span className="error-text">{error}</span>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
            >
              {creating ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
