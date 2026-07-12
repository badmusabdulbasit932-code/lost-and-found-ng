import { useNavigate } from "react-router-dom"
import { FiHome, FiSearch, FiArrowLeft } from "react-icons/fi"

function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
      padding: "24px",
      textAlign: "center",
    }}>
      {/* Big 404 */}
      <div style={{
        fontSize: "120px",
        fontWeight: 900,
        color: "#d1fae5",
        lineHeight: 1,
        marginBottom: "8px",
        userSelect: "none",
      }}>
        404
      </div>

      {/* Icon */}
      <div style={{
        width: "80px", height: "80px",
        background: "#059669",
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "24px",
        fontSize: "36px",
      }}>
        🔍
      </div>

      <h1 style={{
        fontSize: "28px", fontWeight: 800,
        color: "#111827", marginBottom: "12px",
      }}>
        Page Not Found
      </h1>

      <p style={{
        fontSize: "16px", color: "#6b7280",
        maxWidth: "400px", marginBottom: "36px", lineHeight: 1.6,
      }}>
        Looks like this page got lost too! Let's help you find your way back to the right place.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 24px",
            background: "#fff", color: "#374151",
            border: "1px solid #e5e7eb", borderRadius: "10px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <FiArrowLeft /> Go Back
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 24px",
            background: "#059669", color: "#fff",
            border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <FiHome /> Go Home
        </button>

        <button
          onClick={() => navigate("/browse")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 24px",
            background: "#f0fdf4", color: "#059669",
            border: "1px solid #bbf7d0", borderRadius: "10px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <FiSearch /> Browse Reports
        </button>
      </div>

      <p style={{ marginTop: "48px", fontSize: "13px", color: "#9ca3af" }}>
        Lost & Found NG — Nigeria's #1 Recovery Platform
      </p>
    </div>
  )
}

export default NotFound
