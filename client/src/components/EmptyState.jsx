function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
      textAlign: "center",
    }}>
      {icon && (
        <div style={{
          fontSize: "48px",
          marginBottom: "16px",
          color: "#9ca3af",
        }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        {title || "Nothing here yet"}
      </h3>
      {description && (
        <p style={{ fontSize: "14px", color: "#6b7280", maxWidth: "320px", marginBottom: "24px" }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "10px 24px",
            background: "#059669",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
