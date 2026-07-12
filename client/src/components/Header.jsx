import { useState, useRef, useEffect } from "react"
import {
  FiSearch, FiBell, FiPlus, FiX, FiTrash2,
  FiCheckCircle, FiMenu, FiShield,
} from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useNotifications, NOTIF_META } from "../context/NotificationContext"
import "../styles/header.css"
import "../styles/notifications.css"

export default function DashboardHeader() {

  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    removeNotification,
  } = useNotifications()

  const [showDropdown, setShowDropdown] = useState(false)
  const [quickSearch, setQuickSearch] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef(null)
  const userMenuRef = useRef(null)

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [showDropdown])

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [showUserMenu])

  // User display info
  const displayName = user?.name || "User"
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  // Handle notification click — mark read then navigate
  const handleNotifClick = (n) => {
    markRead(n._id)
    setShowDropdown(false)
    if (n.relatedMatch) navigate(`/matches`)
    else if (n.relatedReport) navigate(`/reports/${n.relatedReport?._id || n.relatedReport}`)
    else if (n.relatedConversation) navigate("/messages")
  }

  // Search on Enter key
  const handleSearchKey = (e) => {
    if (e.key === "Enter" && quickSearch.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(quickSearch.trim())}`)
      setQuickSearch("")
    }
  }

  // Format time ago
  const timeAgo = (iso) => {
    const d = Date.now() - new Date(iso).getTime()
    const m = Math.floor(d / 60000)
    const h = Math.floor(d / 3600000)
    const dy = Math.floor(d / 86400000)
    if (m < 1) return "Just now"
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    return `${dy}d ago`
  }

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  return (
    <header className="dashboard-header">

      {/* LEFT — logo */}
      <div className="dashboard-header-left">

        <div className="dashboard-logo" onClick={() => navigate("/dashboard")}>
          <div className="dashboard-logo-box">🛡️</div>
          <div className="dashboard-logo-text">
            <h2>Lost &amp; Found NG</h2>
            <span>Recovery Platform</span>
          </div>
        </div>

      </div>

      {/* RIGHT */}
      <div className="dashboard-header-right">

        {/* SEARCH */}
        <div className="dashboard-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search reports..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            onKeyDown={handleSearchKey}
          />
        </div>

        {/* NEW REPORT BUTTON */}
        <button
          className="report-btn"
          onClick={() => navigate("/create-report")}
        >
          <FiPlus />
          <span>New Report</span>
        </button>

        {/* NOTIFICATION BELL */}
        <div style={{ position: "relative" }} ref={dropdownRef}>

          <button
            className="dashboard-icon-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Notifications"
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {showDropdown && (
            <div className="notif-dropdown">

              <div className="notif-header">
                <div className="notif-header-left">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="notif-count-badge">{unreadCount}</span>
                  )}
                </div>
                <button
                  className="notif-mark-all-btn"
                  onClick={() => { markAllRead(); setShowDropdown(false) }}
                >
                  <FiCheckCircle size={13} /> Mark all read
                </button>
              </div>

              <div className="notif-list">

                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <FiBell size={32} />
                    <p>No notifications yet</p>
                    <span>You're all caught up!</span>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => {
                    const meta = NOTIF_META[n.type] || NOTIF_META["system"]
                    return (
                      <div
                        key={n._id || n.id}
                        className={`notif-item ${!n.isRead ? "notif-unread" : ""}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div
                          className="notif-icon"
                          style={{ background: meta.color + "20", color: meta.color }}
                        >
                          {meta.icon}
                        </div>
                        <div className="notif-content">
                          <h4>{n.title}</h4>
                          <p>{n.body}</p>
                          <span className="notif-time">{timeAgo(n.createdAt)}</span>
                        </div>
                        <button
                          className="notif-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(n._id || n.id)
                          }}
                        >
                          <FiX size={13} />
                        </button>
                      </div>
                    )
                  })
                )}

              </div>

              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button
                    className="notif-view-all-btn"
                    onClick={() => { setShowDropdown(false); navigate("/profile?tab=Notifications") }}
                  >
                    View all notifications
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* USER AVATAR */}
        <div style={{ position: "relative" }} ref={userMenuRef}>

          <div
            className="dashboard-user"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="dashboard-avatar-wrapper">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="dashboard-avatar"
                />
              ) : (
                <div className="dashboard-avatar-fallback">
                  {initials}
                </div>
              )}
              <span className="online-dot" />
            </div>
            <div className="dashboard-user-info">
              <h4>{displayName}</h4>
              <p>{user?.role || "User"}</p>
            </div>
          </div>

          {/* USER DROPDOWN */}
          {showUserMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                minWidth: "180px",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {[
                { label: "My Profile", path: "/profile" },
                { label: "My Reports", path: "/reports" },
                { label: "Settings", path: "/settings" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowUserMenu(false) }}
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "12px 18px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  {item.label}
                </button>
              ))}

              <div style={{ borderTop: "1px solid #f3f4f6" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "12px 18px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#dc2626",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  Log Out
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  )
}