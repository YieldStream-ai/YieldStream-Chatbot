export default function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "#9ca3af",
        textAlign: "center",
        padding: 40,
      }}
    >
      <p style={{ fontSize: 16, marginBottom: 8 }}>No clients yet</p>
      <p style={{ fontSize: 13 }}>
        Create one using the "+ New client" button in the sidebar.
      </p>
    </div>
  );
}
