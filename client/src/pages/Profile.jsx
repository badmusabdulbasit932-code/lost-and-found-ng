import {
  FiEdit2, FiMapPin, FiMail, FiPhone, FiShield,
  FiCamera, FiCheckCircle, FiClock, FiAlertCircle,
  FiArrowLeft, FiLock, FiEye, FiEyeOff,
  FiSave, FiX, FiBell, FiUser,
  FiAward, FiTrendingUp, FiPackage, FiMessageSquare,
  FiChevronRight, FiLogOut, FiDownload,
} from "react-icons/fi"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useNotifications, NOTIF_META } from "../context/NotificationContext"
import { updateProfile, uploadAvatar } from "../services/authService"
import { getMyReports } from "../services/reportService"
import * as alert from "../utils/alert"
import Swal from "sweetalert2"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import "../styles/profile.css"

const TABS = ["Overview", "Reports", "Security", "Notifications"]

export default function Profile() {

  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const { notifications, unreadCount } = useNotifications()

  const [activeTab, setActiveTab] = useState("Overview")
  const [editMode, setEditMode] = useState(false)
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [myReports, setMyReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    bio: user?.bio || "",
  })

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
  })

  const [notifSettings, setNotifSettings] = useState({
    emailMatch: true,
    smsMatch: true,
    emailMessage: true,
    smsMessage: false,
    emailWeekly: true,
    pushAll: false,
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getMyReports({ limit: 10 })
        setMyReports(data.reports || [])
      } catch (err) {
        console.error("Failed to load reports:", err.message)
      } finally {
        setLoadingReports(false)
      }
    }
    fetchReports()
  }, [])

  if (!user) {
    return (
      <MainLayout><DashboardLayout>
        <div className="prof-not-logged-in">
          <FiAlertCircle size={40} />
          <h2>Not logged in</h2>
          <button className="prof-btn-primary" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>
      </DashboardLayout></MainLayout>
    )
  }

  const stats = {
    total: myReports.length,
    open: myReports.filter((r) => r.status === "open").length,
    matched: myReports.filter((r) => r.status === "matched").length,
    resolved: myReports.filter((r) => r.status === "resolved").length,
  }

  const handleSaveProfile = async () => {
    alert.loading("Saving profile...")
    try {
      const data = await updateProfile(editForm)
      Swal.close()
      updateUser(data.user)
      alert.toast("Profile updated successfully!", "success")
      setEditMode(false)
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to update profile.", "Update Failed")
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    alert.loading("Uploading avatar...")
    try {
      const data = await uploadAvatar(file)
      Swal.close()
      updateUser({ avatar: data.avatar })
      alert.toast("Avatar updated!", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to upload avatar.", "Upload Failed")
    }
  }

  const handleChangePassword = async () => {
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      alert.error("Please fill both password fields.", "Missing Fields")
      return
    }
    if (pwdForm.newPassword.length < 6) {
      alert.error("New password must be at least 6 characters.", "Too Short")
      return
    }
    alert.loading("Changing password...")
    try {
      const { changePassword } = await import("../services/authService")
      await changePassword(pwdForm)
      Swal.close()
      alert.toast("Password changed successfully!", "success")
      setPwdForm({ currentPassword: "", newPassword: "" })
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to change password.", "Error")
    }
  }

  const handleLogout = async () => {
    const confirmed = await alert.confirm(
      "Are you sure you want to log out?",
      "Log Out"
    )
    if (!confirmed) return
    logout()
    navigate("/signin")
  }

  const handleExportData = () => {
    const payload = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        state: user.state,
        bio: user.bio,
        verified: user.verified,
        role: user.role,
      },
      reports: myReports,
      notifications,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `lostfound-ng-data-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    alert.toast("Your data has been downloaded.", "success")
  }

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="prof-page">

          {/* TOP BAR */}
          <div className="prof-topbar">
            <button className="prof-back-btn" onClick={() => navigate("/dashboard")}>
              <FiArrowLeft /> Dashboard
            </button>
            <div className="prof-topbar-right">
              <button className="prof-logout-btn" onClick={handleLogout}>
                <FiLogOut /> Log Out
              </button>
            </div>
          </div>

          {/* HERO */}
          <div className="prof-hero">
            <div className="prof-hero-content">

              {/* AVATAR */}
              <div className="prof-avatar-wrap">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="prof-avatar" />
                ) : (
                  <div className="prof-avatar-fallback">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <label className="prof-camera-btn">
                  <FiCamera />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              {/* INFO */}
              <div className="prof-hero-info">
                <h1>{user.name}</h1>
                <p className="prof-email">{user.email}</p>
                <div className="prof-hero-badges">
                  {user.verified && (
                    <span className="prof-badge verified-badge">
                      <FiCheckCircle /> Verified
                    </span>
                  )}
                  <span className="prof-badge role-badge">
                    <FiShield /> {user.role || "User"}
                  </span>
                </div>
              </div>

              {/* STATS */}
              <div className="prof-hero-stats">
                <div className="prof-stat">
                  <h3>{stats.total}</h3>
                  <p>Reports</p>
                </div>
                <div className="prof-stat">
                  <h3>{stats.matched}</h3>
                  <p>Matches</p>
                </div>
                <div className="prof-stat">
                  <h3>{stats.resolved}</h3>
                  <p>Resolved</p>
                </div>
                <div className="prof-stat">
                  <h3>{unreadCount}</h3>
                  <p>Notifications</p>
                </div>
              </div>

            </div>
          </div>

          {/* TABS */}
          <div className="prof-tabs-bar">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`prof-tab ${activeTab === tab ? "prof-tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "Overview" && (
            <div className="prof-body">

              <div className="prof-overview">

                {/* PERSONAL INFO CARD */}
                <div className="prof-card">
                  <div className="prof-card-header">
                    <h3>Personal Information</h3>
                    {!editMode ? (
                      <button className="prof-edit-btn" onClick={() => setEditMode(true)}>
                        <FiEdit2 /> Edit
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="prof-save-btn" onClick={handleSaveProfile}>
                          <FiSave /> Save
                        </button>
                        <button className="prof-cancel-btn" onClick={() => setEditMode(false)}>
                          <FiX /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="prof-card-body">
                    <div className="prof-form-grid">

                      <div className="prof-form-group">
                        <label><FiUser /> Full Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        ) : (
                          <p>{user.name || "—"}</p>
                        )}
                      </div>

                      <div className="prof-form-group">
                        <label><FiMail /> Email</label>
                        <p>{user.email}</p>
                      </div>

                      <div className="prof-form-group">
                        <label><FiPhone /> Phone</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            placeholder="+234 800 000 0000"
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        ) : (
                          <p>{user.phone || "—"}</p>
                        )}
                      </div>

                      <div className="prof-form-group">
                        <label><FiMapPin /> City</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editForm.city}
                            placeholder="e.g. Lagos"
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          />
                        ) : (
                          <p>{user.city || "—"}</p>
                        )}
                      </div>

                      <div className="prof-form-group">
                        <label><FiMapPin /> State</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editForm.state}
                            placeholder="e.g. Lagos State"
                            onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          />
                        ) : (
                          <p>{user.state || "—"}</p>
                        )}
                      </div>

                      <div className="prof-form-group full">
                        <label><FiUser /> Bio</label>
                        {editMode ? (
                          <textarea
                            value={editForm.bio}
                            placeholder="Tell us a little about yourself..."
                            maxLength={300}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          />
                        ) : (
                          <p>{user.bio || "—"}</p>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* QUICK LINKS CARD */}
                <div className="prof-card">
                  <div className="prof-card-header">
                    <h3>Quick Links</h3>
                  </div>
                  <div className="prof-card-body">
                    {[
                      { icon: <FiPackage />, label: "My Reports", path: "/reports" },
                      { icon: <FiTrendingUp />, label: "My Matches", path: "/matches" },
                      { icon: <FiMessageSquare />, label: "Messages", path: "/messages" },
                      { icon: <FiAward />, label: "Discover", path: "/discover" },
                    ].map((link) => (
                      <div
                        key={link.path}
                        className="prof-quick-link"
                        onClick={() => navigate(link.path)}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                        <FiChevronRight className="prof-chevron" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {activeTab === "Reports" && (
            <div className="prof-body">
              <div className="prof-card">
                <div className="prof-card-header">
                  <h3>My Reports</h3>
                  <button
                    className="prof-edit-btn"
                    onClick={() => navigate("/create-report")}
                  >
                    + New Report
                  </button>
                </div>
                <div className="prof-card-body">

                  {loadingReports ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "32px" }}>
                      Loading reports...
                    </p>
                  ) : myReports.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                      <FiPackage size={36} />
                      <p style={{ marginTop: "12px" }}>No reports yet.</p>
                      <button
                        className="prof-btn-primary"
                        style={{ marginTop: "16px" }}
                        onClick={() => navigate("/create-report")}
                      >
                        Create First Report
                      </button>
                    </div>
                  ) : (
                    myReports.map((report) => (
                      <div key={report._id} className="prof-report-row">
                        <div className="prof-report-image">
                          {report.images?.[0] ? (
                            <img src={report.images[0]} alt={report.title} />
                          ) : (
                            <div className="prof-report-img-placeholder">
                              <FiPackage />
                            </div>
                          )}
                        </div>
                        <div className="prof-report-info">
                          <h4>{report.title}</h4>
                          <p><FiMapPin /> {report.location}</p>
                          <p><FiClock /> {new Date(report.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="prof-report-right">
                          <span className={`prof-status-badge ${report.status}`}>
                            {report.status?.toUpperCase()}
                          </span>
                          <button
                            className="prof-view-btn"
                            onClick={() => navigate(`/reports/${report._id}`)}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "Security" && (
            <div className="prof-body">
              <div className="prof-card">
                <div className="prof-card-header">
                  <h3>Change Password</h3>
                </div>
                <div className="prof-card-body">
                  <div className="prof-form-grid">

                    <div className="prof-form-group">
                      <label><FiLock /> Current Password</label>
                      <div className="prof-pwd-input">
                        <input
                          type={showOldPwd ? "text" : "password"}
                          value={pwdForm.currentPassword}
                          placeholder="••••••••"
                          onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                        />
                        <button onClick={() => setShowOldPwd(!showOldPwd)}>
                          {showOldPwd ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                    <div className="prof-form-group">
                      <label><FiLock /> New Password</label>
                      <div className="prof-pwd-input">
                        <input
                          type={showNewPwd ? "text" : "password"}
                          value={pwdForm.newPassword}
                          placeholder="••••••••"
                          onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                        />
                        <button onClick={() => setShowNewPwd(!showNewPwd)}>
                          {showNewPwd ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>

                  </div>

                  <button
                    className="prof-btn-primary"
                    style={{ marginTop: "20px" }}
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </button>

                </div>
              </div>

              {/* DATA EXPORT */}
              <div className="prof-card">
                <div className="prof-card-header">
                  <h3>Your Data</h3>
                </div>
                <div className="prof-card-body">
                  <p style={{ color: "#6b7280", marginBottom: "16px" }}>
                    Download a copy of your profile, reports, and notifications as a JSON file.
                  </p>
                  <button className="prof-btn-primary" onClick={handleExportData}>
                    <FiDownload /> Download My Data
                  </button>
                </div>
              </div>

              {/* ACCOUNT DANGER ZONE */}
              <div className="prof-card" style={{ borderColor: "#fecaca" }}>
                <div className="prof-card-header">
                  <h3 style={{ color: "#dc2626" }}>Danger Zone</h3>
                </div>
                <div className="prof-card-body">
                  <p style={{ color: "#6b7280", marginBottom: "16px" }}>
                    Once you log out all your sessions will be cleared.
                  </p>
                  <button
                    className="prof-danger-btn"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Log Out
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "Notifications" && (
            <div className="prof-body">

              {/* SETTINGS CARD */}
              <div className="prof-card">
                <div className="prof-card-header">
                  <h3>Notification Preferences</h3>
                </div>
                <div className="prof-card-body">
                  {[
                    { key: "emailMatch", label: "Email me when a match is found" },
                    { key: "smsMatch", label: "SMS me when a match is found" },
                    { key: "emailMessage", label: "Email me when I get a new message" },
                    { key: "smsMessage", label: "SMS me when I get a new message" },
                    { key: "emailWeekly", label: "Weekly summary emails" },
                    { key: "pushAll", label: "Push notifications" },
                  ].map((pref) => (
                    <div key={pref.key} className="prof-notif-row">
                      <div>
                        <FiBell />
                        <span>{pref.label}</span>
                      </div>
                      <label className="prof-toggle">
                        <input
                          type="checkbox"
                          checked={notifSettings[pref.key]}
                          onChange={() =>
                            setNotifSettings((prev) => ({
                              ...prev,
                              [pref.key]: !prev[pref.key],
                            }))
                          }
                        />
                        <span className="prof-toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT NOTIFICATIONS */}
              <div className="prof-card">
                <div className="prof-card-header">
                  <h3>Recent Notifications</h3>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    {unreadCount} unread
                  </span>
                </div>
                <div className="prof-card-body">
                  {notifications.length === 0 ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: "24px" }}>
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif._id || notif.id}
                        className={`prof-notif-item ${!notif.isRead ? "prof-notif-unread" : ""}`}
                      >
                        <div className="prof-notif-icon">
                          {NOTIF_META[notif.type]?.icon || "🔔"}
                        </div>
                        <div className="prof-notif-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.body}</p>
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString("en-NG", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </DashboardLayout>
    </MainLayout>
  )
}