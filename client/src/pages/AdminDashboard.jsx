import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  FiRefreshCw, FiAlertOctagon, FiFileText, FiEdit3,
  FiFlag, FiUsers, FiTrendingUp, FiMapPin, FiClock,
  FiX, FiShield, FiSearch,
  FiChevronRight, FiZap,
  FiBell, FiLogOut, FiEye, FiLock,
} from "react-icons/fi"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import * as alert from "../utils/alert"
import Swal from "sweetalert2"
import "../styles/admin-dashboard.css"

const RECOVERY_DATA = [
  { month: "Jan", rate: 52 }, { month: "Feb", rate: 49 },
  { month: "Mar", rate: 55 }, { month: "Apr", rate: 61 },
  { month: "May", rate: 70 }, { month: "Jun", rate: 76 },
]

const CITY_DATA = [
  { city: "Lagos", base: 4821 },
  { city: "Abuja", base: 3240 },
  { city: "Ibadan", base: 2100 },
  { city: "P.H.", base: 1640 },
  { city: "Kano", base: 1290 },
]

const INIT_ACTIVITY = [
  { action: "Approved Report", ref: "Loading...", actor: "System", time: "Just now", color: "#22c55e" },
]

function LineChart({ data }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const dpr = window.devicePixelRatio || 1
    cvs.width = cvs.offsetWidth * dpr
    cvs.height = cvs.offsetHeight * dpr
    const ctx = cvs.getContext("2d")
    ctx.scale(dpr, dpr)
    const W = cvs.offsetWidth, H = cvs.offsetHeight
    const pad = { t: 16, r: 16, b: 30, l: 38 }
    const gw = W - pad.l - pad.r, gh = H - pad.t - pad.b
    const vals = data.map((d) => d.rate)
    const lo = Math.min(...vals) - 4, hi = Math.max(...vals) + 4
    const xp = (i) => pad.l + (i / (data.length - 1)) * gw
    const yp = (v) => pad.t + gh - ((v - lo) / (hi - lo)) * gh
    ctx.clearRect(0, 0, W, H)
      ;[lo, (lo + hi) / 2, hi].forEach((v) => {
        const y = yp(v)
        ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gw, y); ctx.stroke()
        ctx.fillStyle = "#9ca3af"; ctx.font = `11px 'DM Sans',sans-serif`; ctx.textAlign = "right"
        ctx.fillText(Math.round(v), pad.l - 6, y + 4)
      })
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + gh)
    grad.addColorStop(0, "rgba(29,78,216,.15)"); grad.addColorStop(1, "rgba(29,78,216,0)")
    ctx.beginPath(); ctx.moveTo(xp(0), yp(vals[0]))
    vals.forEach((v, i) => i > 0 && ctx.lineTo(xp(i), yp(v)))
    ctx.lineTo(xp(vals.length - 1), pad.t + gh); ctx.lineTo(xp(0), pad.t + gh)
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill()
    ctx.beginPath(); ctx.moveTo(xp(0), yp(vals[0]))
    vals.forEach((v, i) => i > 0 && ctx.lineTo(xp(i), yp(v)))
    ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke()
    vals.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(xp(i), yp(v), 4.5, 0, Math.PI * 2)
      ctx.fillStyle = "#1d4ed8"; ctx.fill()
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = "#6b7280"; ctx.font = `11px 'DM Sans',sans-serif`; ctx.textAlign = "center"
      ctx.fillText(data[i].month, xp(i), H - 6)
    })
  }, [data])
  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
}

export default function AdminDashboard() {

  const navigate = useNavigate()
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser")) || {}

  const [dashStats, setDashStats] = useState(null)
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")
  const [urgentMode, setUrgentMode] = useState(false)
  const [searchQ, setSearchQ] = useState("")
  const [selected, setSelected] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activity, setActivity] = useState(INIT_ACTIVITY)

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const { default: api } = await import("../services/api")

      const [statsRes, usersRes, reportsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/reports"),
      ])

      const statsData = statsRes.data
      const usersData = usersRes.data
      const reportsData = reportsRes.data

      setDashStats(statsData)
      setUsers(usersData.users || [])
      setReports(reportsData.reports || [])

      if (reportsData.reports?.length > 0) {
        setSelected(reportsData.reports[0])
      }

    } catch (err) {
      console.error("Failed to load admin data:", err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loggedIn || loggedIn.role !== "admin") {
      navigate("/dashboard")
      return
    }
    fetchAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAdminData()
    setRefreshing(false)
    alert.toast("Data refreshed.", "success")
  }

  const logAct = (action, ref, color = "#1d4ed8") => {
    setActivity((prev) => [
      { action, ref, actor: loggedIn.name || "Admin", time: "Just now", color },
      ...prev,
    ].slice(0, 8))
  }

  const handleDeleteReport = async (report) => {
    const confirmed = await alert.confirm(
      `Delete report "${report.title}"? Please provide a reason.`,
      "Delete Report"
    )
    if (!confirmed) return
    alert.loading("Deleting report...")
    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:5000/api/admin/reports/${report._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ reason: "Removed by admin for policy violation" }),
      })
      Swal.close()
      setReports((prev) => prev.filter((r) => String(r._id) !== String(report._id)))
      if (String(selected?._id) === String(report._id)) setSelected(null)
      logAct("Deleted Report", report._id, "#ef4444")
      alert.toast("Report deleted.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to delete report.", "Error")
    }
  }

  const handleFlagReport = async (report) => {
    alert.loading("Flagging report...")
    try {
      const token = localStorage.getItem("token")
      await fetch(`http://localhost:5000/api/admin/reports/${report._id}/flag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ reason: "Flagged by admin for review" }),
      })
      Swal.close()
      setReports((prev) =>
        prev.map((r) => String(r._id) === String(report._id) ? { ...r, status: "closed" } : r)
      )
      logAct("Flagged Report", report._id, "#f97316")
      alert.toast("Report flagged.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to flag report.", "Error")
    }
  }

  const handleToggleUser = async (user) => {
    alert.loading(`${user.isActive ? "Deactivating" : "Activating"} user...`)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/toggle`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      })
      const data = await res.json()
      Swal.close()
      setUsers((prev) =>
        prev.map((u) => String(u._id) === String(user._id) ? data.user : u)
      )
      logAct(data.user.isActive ? "Activated User" : "Deactivated User", user.name, "#f97316")
      alert.toast(data.message, "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to update user.", "Error")
    }
  }

  const filteredReports = useMemo(() => {
    let list = reports
    if (activeTab === "Flagged") list = list.filter((r) => r.status === "closed")
    if (urgentMode) list = list.filter((r) => r.type === "lost")
    if (searchQ) {
      const q = searchQ.toLowerCase()
      list = list.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.userId?.name?.toLowerCase().includes(q)
      )
    }
    return list
  }, [reports, activeTab, urgentMode, searchQ])

  const cityData = useMemo(() => {
    const rows = CITY_DATA.map((c) => {
      const real = reports.filter((r) =>
        r.location?.toLowerCase().includes(c.city.toLowerCase())
      ).length
      return { ...c, count: real > 0 ? real : c.base }
    })
    const max = Math.max(...rows.map((r) => r.count))
    return rows.map((r) => ({ ...r, pct: Math.round((r.count / max) * 100) }))
  }, [reports])

  const rewardStats = useMemo(() => {
    const withReward = reports.filter(
      (r) => parseInt((r.reward || "0").replace(/\D/g, "")) > 0
    )
    const total = withReward.reduce(
      (a, r) => a + (parseInt((r.reward || "0").replace(/\D/g, "")) || 0),
      0
    )
    const average = withReward.length ? Math.round(total / withReward.length) : 0
    return { total, count: withReward.length, average }
  }, [reports])

  const statusClass = (status) =>
  ({
    open: "badge-pending",
    matched: "badge-matched",
    resolved: "badge-approved",
    closed: "badge-rejected",
  }[status] || "badge-pending")

  if (loading) {
    return (
      <MainLayout>
        <DashboardLayout>
          <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af" }}>
            Loading admin data...
          </div>
        </DashboardLayout>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="adm-wrap">

          <main className="adm-main">

            {/* PAGE HEADER */}
            <div className="adm-page-header">
              <div>
                <h1 className="adm-page-title">Admin Nerve Center</h1>
                <p className="adm-page-sub">
                  Platform overview and moderation control panel for Nigeria operations.
                </p>
              </div>
              <div className="adm-page-actions">
                <button
                  className={`adm-refresh-btn ${refreshing ? "adm-spin" : ""}`}
                  onClick={handleRefresh}
                >
                  <FiRefreshCw size={13} /> Refresh Data
                </button>
                <button
                  className={`adm-urgent-btn ${urgentMode ? "adm-urgent-active" : ""}`}
                  onClick={() => setUrgentMode((p) => !p)}
                >
                  <FiAlertOctagon size={13} /> Urgent Alerts
                </button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="adm-stats">
              {[
                {
                  icon: <FiFileText size={19} />,
                  delta: "+12.5%", up: true,
                  val: (dashStats?.reports?.total || 0).toLocaleString(),
                  label: "TOTAL REPORTS",
                  sub: `${dashStats?.reports?.lost || 0} Lost | ${dashStats?.reports?.found || 0} Found`,
                },
                {
                  icon: <FiEdit3 size={19} />,
                  delta: "-8.2%", up: false,
                  val: (dashStats?.reports?.open || 0).toLocaleString(),
                  label: "OPEN REPORTS",
                  sub: `${dashStats?.reports?.matched || 0} Matched`,
                },
                {
                  icon: <FiUsers size={19} />,
                  delta: "+5.4%", up: true,
                  val: (dashStats?.users?.total || 0).toLocaleString(),
                  label: "TOTAL USERS",
                  sub: `${dashStats?.users?.active || 0} Active`,
                },
                {
                  icon: <FiTrendingUp size={19} />,
                  delta: "+3.2%", up: true,
                  val: `${dashStats?.matches?.total || 0}`,
                  label: "TOTAL MATCHES",
                  sub: `${dashStats?.matches?.accepted || 0} Accepted`,
                },
              ].map((s, i) => (
                <div className="adm-stat-card" key={i}>
                  <div className="adm-stat-top">
                    <div className="adm-stat-icon">{s.icon}</div>
                    <span className={`adm-stat-delta ${s.up ? "adm-up" : "adm-down"}`}>
                      {s.up ? "↗" : "↘"} {s.delta}
                    </span>
                  </div>
                  <div className="adm-stat-val">{s.val}</div>
                  <div className="adm-stat-label">{s.label}</div>
                  <div className="adm-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* MODERATION BLOCK */}
            <div className="adm-mod-block">

              {/* QUEUE */}
              <div className="adm-queue">
                <div className="adm-queue-top">
                  <div>
                    <h2 className="adm-section-h">Report Management</h2>
                    <p className="adm-section-p">Review and action all platform reports.</p>
                  </div>
                  <div className="adm-queue-search">
                    <FiSearch size={14} />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      style={{ border: "none", outline: "none", fontSize: "13px", background: "transparent" }}
                    />
                  </div>
                  <div className="adm-tabs">
                    {[
                      { label: "All", count: reports.length },
                      { label: "Flagged", count: reports.filter((r) => r.status === "closed").length },
                    ].map((t) => (
                      <button
                        key={t.label}
                        className={`adm-tab ${activeTab === t.label ? "adm-tab--active" : ""}`}
                        onClick={() => setActiveTab(t.label)}
                      >
                        {t.label} ({t.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="adm-table-head">
                  <span>Item Details</span>
                  <span>User</span>
                  <span>Type</span>
                  <span>Location</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="adm-queue-empty">
                    <FiShield size={28} />
                    <p>No reports in this category.</p>
                  </div>
                ) : (
                  filteredReports.slice(0, 8).map((report) => (
                    <div
                      key={report._id}
                      className={`adm-row ${String(selected?._id) === String(report._id) ? "adm-row--active" : ""}`}
                      onClick={() => setSelected(report)}
                    >
                      <div className="adm-row-item">
                        <div className="adm-item-thumb">
                          {report.images?.[0]
                            ? <img src={report.images[0]} alt="" />
                            : <span>{report.category?.[0]?.toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <div className="adm-item-name">{report.title}</div>
                          <div className="adm-item-code">LF-{String(report._id).slice(-6)}</div>
                        </div>
                      </div>

                      <div className="adm-row-user">
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "#dbeafe", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: "#1d4ed8",
                            flexShrink: 0,
                          }}
                        >
                          {report.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span>{report.userId?.name || "Unknown"}</span>
                      </div>

                      <div className="adm-row-type">
                        <span className={`adm-type-dot ${report.type === "found" ? "dot-found" : "dot-lost"}`} />
                        {report.type?.charAt(0)?.toUpperCase() + report.type?.slice(1)}
                      </div>

                      <div className="adm-row-loc">
                        <FiMapPin size={11} />{report.location}
                      </div>

                      <div>
                        <span className={`adm-badge ${statusClass(report.status)}`}>
                          {report.status}
                        </span>
                      </div>

                      <div className="adm-row-acts" onClick={(e) => e.stopPropagation()}>
                        <button className="adm-act-btn adm-act-orange" title="Flag" onClick={() => handleFlagReport(report)}>
                          <FiFlag size={12} />
                        </button>
                        <button className="adm-act-btn adm-act-red" title="Delete" onClick={() => handleDeleteReport(report)}>
                          <FiX size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {filteredReports.length > 8 && (
                  <button className="adm-view-full">
                    View Full List <FiChevronRight size={13} />
                  </button>
                )}
              </div>

              {/* DETAIL PANEL */}
              <div className="adm-detail">
                {selected ? (
                  <>
                    <div className="adm-detail-id-row">
                      <span className="adm-detail-id">LF-{String(selected._id).slice(-6)}</span>
                      <span className={`adm-badge ${statusClass(selected.status)}`}>{selected.status}</span>
                    </div>

                    <h3 className="adm-detail-title">{selected.title}</h3>
                    <p className="adm-detail-sub">Reviewing item for policy compliance.</p>

                    <div className="adm-detail-img-wrap">
                      {selected.images?.[0]
                        ? <img src={selected.images[0]} alt="" className="adm-detail-img" />
                        : <div className="adm-detail-img-ph"><FiEye size={30} /><span>{selected.category}</span></div>
                      }
                    </div>

                    <div className="adm-detail-meta">
                      <div>
                        <div className="adm-meta-lbl">Reported By</div>
                        <div className="adm-meta-val">{selected.userId?.name || "Unknown"}</div>
                      </div>
                      <div>
                        <div className="adm-meta-lbl">Date Reported</div>
                        <div className="adm-meta-val">
                          {new Date(selected.createdAt).toLocaleDateString("en-NG", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="adm-detail-loc">
                      <div className="adm-meta-lbl">Location</div>
                      <div className="adm-meta-val">{selected.location}</div>
                    </div>

                    <div className="adm-detail-desc">
                      <p>"{selected.description}"</p>
                    </div>

                    <div className="adm-secondary-btns" style={{ marginTop: "16px" }}>
                      <button className="adm-match-btn" onClick={() => handleFlagReport(selected)}>
                        <FiFlag size={13} /> Flag
                      </button>
                      <button className="adm-reject-btn" onClick={() => handleDeleteReport(selected)}>
                        <FiX size={13} /> Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="adm-detail-empty">
                    <FiShield size={36} />
                    <p>Select a report to review</p>
                  </div>
                )}

                {/* USERS */}
                <div className="adm-activity" style={{ marginTop: "20px" }}>
                  <div className="adm-activity-head">
                    <FiUsers size={12} /> Recent Users
                  </div>
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="adm-act-row">
                      <div>
                        <div className="adm-act-label">{u.name}</div>
                        <div className="adm-act-ref">{u.email}</div>
                      </div>
                      <div className="adm-act-right">
                        <span style={{ color: u.isActive ? "#22c55e" : "#ef4444", fontSize: 12, fontWeight: 700 }}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => handleToggleUser(u)}
                          style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 6,
                            border: "1px solid #e5e7eb", background: "#fff",
                            cursor: "pointer", fontWeight: 600,
                          }}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTIVITY */}
                <div className="adm-activity" style={{ marginTop: "16px" }}>
                  <div className="adm-activity-head">
                    <FiClock size={12} /> Recent Activity
                  </div>
                  {activity.slice(0, 5).map((a, i) => (
                    <div key={i} className="adm-act-row">
                      <div>
                        <div className="adm-act-label">{a.action}</div>
                        <div className="adm-act-ref">{a.ref}</div>
                      </div>
                      <div className="adm-act-right">
                        <span style={{ color: a.color, fontSize: 12, fontWeight: 600 }}>{a.actor}</span>
                        <span className="adm-act-time">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CHARTS */}
            <div className="adm-charts-row">

              <div className="adm-chart-card">
                <div className="adm-chart-head">
                  <div>
                    <h3 className="adm-chart-title">Recovery Rate Trends</h3>
                    <p className="adm-chart-sub">Monthly % of successfully returned items across Nigeria.</p>
                  </div>
                  <span className="adm-chart-period">Last 6 Months</span>
                </div>
                <div style={{ height: 180 }}>
                  <LineChart data={RECOVERY_DATA} />
                </div>
              </div>

              <div className="adm-chart-card">
                <div className="adm-chart-head">
                  <div>
                    <h3 className="adm-chart-title">Reports by City</h3>
                    <p className="adm-chart-sub">Total volume of reports by major Nigerian cities.</p>
                  </div>
                  <span className="adm-chart-period">Lagos Leading</span>
                </div>
                <div className="adm-city-list">
                  {cityData.map((c) => (
                    <div key={c.city} className="adm-city-row">
                      <span className="adm-city-name">{c.city}</span>
                      <div className="adm-city-track">
                        <div className="adm-city-fill" style={{ width: `${c.pct}%` }} />
                      </div>
                      <span className="adm-city-count">{c.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* REWARD BANNER */}
            <div className="adm-reward-banner">
              <div className="adm-reward-left">
                <div className="adm-reward-label"><FiZap size={13} /> REWARD ECONOMY</div>
                <div className="adm-reward-amount">₦{rewardStats.total.toLocaleString()}</div>
                <p className="adm-reward-sub">Total reward value across all reports.</p>
              </div>
              <div className="adm-reward-cards">
                <div className="adm-reward-card">
                  <div className="adm-reward-card-lbl">Reports With Reward</div>
                  <div className="adm-reward-card-val">{rewardStats.count}</div>
                </div>
                <div className="adm-reward-card">
                  <div className="adm-reward-card-lbl">Average Reward</div>
                  <div className="adm-reward-card-val">₦{rewardStats.average.toLocaleString()}</div>
                </div>
              </div>
            </div>

          </main>

        </div>
      </DashboardLayout>
    </MainLayout>
  )
}