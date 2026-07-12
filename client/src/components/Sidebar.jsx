import { useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  FiGrid, FiFileText, FiShield, FiMessageSquare,
  FiLogOut, FiX,
  FiCompass, FiUser, FiLifeBuoy,
} from "react-icons/fi"
import "../styles/sidebar.css"

const NAV = [
  { to: "/dashboard", icon: <FiGrid />, label: "Dashboard" },
  { to: "/reports", icon: <FiFileText />, label: "My Reports" },
  { to: "/matches", icon: <FiShield />, label: "Matches", badge: null },
  { to: "/messages", icon: <FiMessageSquare />, label: "Messages" },
  { to: "/discover", icon: <FiCompass />, label: "Discover" },
  { to: "/profile", icon: <FiUser />, label: "Profile" },
  { to: "/support", icon: <FiLifeBuoy />, label: "Support" },
]

const BOTTOM_NAV = [
  { to: "/dashboard", icon: <FiGrid />, label: "Home" },
  { to: "/reports", icon: <FiFileText />, label: "Reports" },
  { to: "/discover", icon: <FiCompass />, label: "Discover" },
  { to: "/messages", icon: <FiMessageSquare />, label: "Messages" },
  { to: "/profile", icon: <FiUser />, label: "Profile" },
]

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  // close drawer on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser")
    localStorage.removeItem("token")
    navigate("/signin")
  }

  const is = (path) => location.pathname === path

  return (
    <>
      {/* ── DESKTOP + MOBILE DRAWER ── */}
      {open && (
        <div
          className="sidebar-overlay active"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        {/* Close btn (mobile drawer) */}
        <button className="sidebar-close-btn" onClick={() => setOpen(false)}>
          <FiX size={15} />
        </button>

        <div>
          {/* Logo */}
          <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>
            <div className="logo-icon">🛡️</div>
            <h2>Lost &amp; Found NG</h2>
          </div>

          {/* Nav links */}
          <div className="sidebar-links">
            {NAV.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className={is(n.to) ? "active-link" : ""}
              >
                {n.icon}
                <span>{n.label}</span>
                {n.badge && <span className="sidebar-badge">{n.badge}</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> Log Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {BOTTOM_NAV.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={`mob-nav-item${is(n.to) ? " active" : ""}`}
          >
            {n.icon}
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
