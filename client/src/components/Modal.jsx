import { useEffect } from "react"
import { FiX } from "react-icons/fi"

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  if (!isOpen) return null

  const widthMap = { sm: "400px", md: "560px", lg: "720px", xl: "900px" }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: widthMap[size] || widthMap.md,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "#f3f4f6", border: "none", borderRadius: "8px",
                width: "32px", height: "32px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6b7280",
              }}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
