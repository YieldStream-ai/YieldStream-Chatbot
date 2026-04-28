interface Props {
  message?: string;
  detail?: string;
}

export default function EmptyState({
  message = "No clients yet",
  detail = 'Create one using the "+ New client" button in the sidebar.',
}: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="empty-state-message">{message}</p>
      <p className="empty-state-detail">{detail}</p>
    </div>
  );
}
