import { FiMapPin, FiClock, FiArrowRight, FiShield } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import StatusBadge from "./StatusBadge"

function MatchCard({ report, matchScore, onView }) {
  const navigate = useNavigate()

  if (!report) return null

  const confidence = matchScore || report.confidence || 0
  const barColor = confidence >= 75 ? "#16a34a" : confidence >= 50 ? "#d97706" : "#dc2626"

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    onClick={() => onView ? onView(report) : navigate(`/reports/${report.id}`)}
    >
      {/* Image */}
      {report.image && (
        <div style={{ height: "160px", overflow: "hidden", position: "relative" }}>
          <img src={report.image} alt={report.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: "10px", left: "10px" }}>
            <StatusBadge type={report.type} />
          </div>
          {confidence > 0 && (
            <div style={{
              position: "absolute", top: "10px", right: "10px",
              background: "rgba(0,0,0,0.7)", color: "#fff",
              borderRadius: "6px", padding: "3px 8px",
              fontSize: "12px", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <FiShield size={11} /> {confidence}% match
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "16px" }}>
        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
          {report.title}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
          {report.location && (
            <span style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
              <FiMapPin size={12} /> {report.location}
            </span>
          )}
          {report.date && (
            <span style={{ fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
              <FiClock size={12} /> {report.date}
            </span>
          )}
        </div>

        {confidence > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>Match confidence</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: barColor }}>{confidence}%</span>
            </div>
            <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${confidence}%`, background: barColor, borderRadius: "999px", transition: "width 0.5s" }} />
            </div>
          </div>
        )}

        <button
          style={{
            width: "100%", padding: "8px", background: "#f0fdf4",
            color: "#059669", border: "1px solid #bbf7d0",
            borderRadius: "8px", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "6px",
          }}
        >
          View Details <FiArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}

export default MatchCard
