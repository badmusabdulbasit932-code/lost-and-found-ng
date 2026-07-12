function StatusBadge({ status, type }) {
  const getStyle = () => {
    const s = (status || type || "").toLowerCase()
    const map = {
      lost:     { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
      found:    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      open:     { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      matched:  { bg: "#faf5ff", color: "#7c3aed", border: "#ddd6fe" },
      closed:   { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
      resolved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      pending:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
      verified: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    }
    return map[s] || { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" }
  }

  const style = getStyle()
  const label = (status || type || "").toUpperCase()

  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
    }}>
      {label}
    </span>
  )
}

export default StatusBadge
