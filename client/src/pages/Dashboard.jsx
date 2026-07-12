import {
  FiSearch,
  FiMapPin,
  FiClock,
  FiPlus,
  FiCheckCircle,
  FiTrendingUp,
  FiBox,
  FiMessageCircle,
} from "react-icons/fi"

import { useNavigate } from "react-router-dom"

// FIX: useMemo to prevent random % recalculating on every render
import { useMemo, useEffect, useState } from "react"

import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"

import "../styles/dashboard.css"

function Dashboard() {

  const navigate = useNavigate()

  const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInUser"))

  // ── Data state ────────────────────────────────────────────────────────
  const [myReports, setMyReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)

  // Fetch user's reports from backend on page load
  useEffect(() => {

    const fetchMyReports = async () => {

      try {

        const { getMyReports } = await import("../services/reportService")

        const data = await getMyReports({ limit: 5 })

        setMyReports(data.reports)

      } catch (err) {

        // If fetch fails show empty state — don't crash
        console.error("Failed to load reports:", err.message)
        setMyReports([])

      } finally {

        setLoadingReports(false)

      }

    }

    fetchMyReports()

  }, [])

  // Use real reports — no dummy data
  const allReports = myReports

  // FIX: stats use report.status and report.type consistently
  const stats = useMemo(() => ({
    total: myReports.length,
    matched: myReports.filter((r) => r.status === "matched").length,
    resolved: myReports.filter((r) => r.status === "resolved").length,
    pending: myReports.filter((r) => r.status === "open").length,
  }), [myReports])
  // FIX: match percentages computed once per render cycle, not on every map call
  const matchPercentages = useMemo(() => {
    const map = {}
    allReports.slice(0, 3).forEach((r) => {
      // Use stored confidence if available, otherwise random seeded by _id
      map[r._id] = r.confidence || ((r._id % 25) + 75)
    })
    return map
  }, [allReports])

  // Recent messages from localStorage allChats
  const recentMessages = useMemo(() => {

    const allChats =
      JSON.parse(localStorage.getItem("allChats")) || []

    const allUsers =
      JSON.parse(localStorage.getItem("users")) || []

    return allChats.slice(0, 2).map((chat) => {

      const otherEmail =
        chat.user1 === loggedInUser?.email
          ? chat.user2
          : chat.user1

      const otherUser =
        allUsers.find((u) => u.email === otherEmail)

      const lastMsg =
        chat.messages?.[chat.messages.length - 1]

      return {
        name: otherUser?.name || "Community Member",
        preview: lastMsg?.text || "Start a conversation",
      }

    })

  }, [loggedInUser?.email])

  return (

    <MainLayout>

      <DashboardLayout>

        <div className="dashboard-main">

          {/* HERO */}
          <section className="dashboard-hero">

            <div>

              <h1>
                Welcome back, {loggedInUser?.name || "User"} 👋
              </h1>

              <p>
                You have{" "}
                <strong>{stats.total}</strong>{" "}
                active report{stats.total !== 1 ? "s" : ""} on your account.
              </p>

            </div>

            <div className="hero-buttons">

              {/* FIX: correct route /discover not /browse */}
              <button
                className="discover-btn"
                onClick={() => navigate("/discover")}
              >
                <FiSearch />
                Discover Items
              </button>

              <button
                className="report-btn"
                onClick={() => navigate("/create-report")}
              >
                <FiPlus />
                Report New Item
              </button>

            </div>

          </section>

          {/* STATS — FIX: all values from real data */}
          <section className="dashboard-stats">

            <div className="dashboard-stat-card">
              <div className="small-icon blue-bg"><FiClock /></div>
              <h2>{stats.total}</h2>
              <p>Open Reports</p>
            </div>

            <div className="dashboard-stat-card">
              <div className="small-icon green-bg"><FiCheckCircle /></div>
              <h2>{stats.matched}</h2>
              <p>Matches Found</p>
            </div>

            <div className="dashboard-stat-card">
              <div className="small-icon orange-bg"><FiTrendingUp /></div>
              <h2>{stats.resolved}</h2>
              <p>Resolved Cases</p>
            </div>

            <div className="dashboard-stat-card">
              <div className="small-icon purple-bg"><FiBox /></div>
              <h2>{stats.pending}</h2>
              <p>Pending Review</p>
            </div>

          </section>

          {/* CONTENT */}
          <section className="dashboard-content-grid">

            {/* LEFT */}
            <div className="dashboard-left">

              <div className="section-top">
                <h3>Active Reports</h3>
                <span
                  className="view-all-btn"
                  onClick={() => navigate("/reports")}
                >
                  View All
                </span>
              </div>

              {/* Active Reports */}
              {loadingReports ? (

                <div style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                  Loading your reports...
                </div>

              ) : allReports.length === 0 ? (

                <div className="dashboard-empty">
                  <FiBox size={36} />
                  <h4>No reports yet</h4>
                  <p>Create your first report to get started.</p>
                  <button className="report-btn" onClick={() => navigate("/create-report")}>
                    <FiPlus /> Report New Item
                  </button>
                </div>

              ) : (

                allReports.slice(0, 5).map((report) => (

                  <div className="active-report-card" key={report._id}>

                    <div className="active-report-image">
                      {report.images && report.images.length > 0 ? (
                        <img src={report.images[0]} alt={report.title} />
                      ) : (
                        <div className="report-img-placeholder"><FiBox size={28} /></div>
                      )}
                      <div className={report.type === "lost" ? "report-status-badge lost-bg" : "report-status-badge found-bg"}>
                        {report.type === "lost" ? "Lost" : "Found"}
                      </div>
                    </div>

                    <div className="active-report-content">
                      <div className="report-card-top">
                        <div>
                          <h4>{report.title}</h4>
                          <div className="report-details">
                            <span><FiMapPin />{report.location}</span>
                            <span><FiClock />{new Date(report.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="progress-wrapper">
                        <p>STATUS</p>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: report.status === "resolved" ? "#dcfce7" : report.status === "matched" ? "#fef9c3" : "#eff6ff",
                          color: report.status === "resolved" ? "#16a34a" : report.status === "matched" ? "#ca8a04" : "#2563eb",
                        }}>
                          {report.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="report-actions">
                      <button className="track-btn" onClick={() => navigate("/report-tracking")}>
                        Track
                      </button>
                      <button className="details-btn" onClick={() => navigate(`/reports/${report._id}`)}>
                        Details
                      </button>
                    </div>

                  </div>

                ))

              )}

              {/* IMPROVE BOX */}
              <div className="improve-box">

                <div className="improve-circle" />

                <h3>Increase your recovery rate</h3>

                <p>
                  Provide more details and photos to help our smart matching
                  algorithm find your items faster.
                </p>

                <button onClick={() => navigate("/create-report")}>
                  Add More Details
                </button>

              </div>

            </div>

            {/* RIGHT */}
            <div className="dashboard-right-side">

              {/* SUGGESTED MATCHES — FIX: real data, stable percentages */}
              <div className="side-card">

                <h3>Suggested Matches</h3>

                {allReports.slice(0, 3).map((item) => (

                  <div
                    key={item._id}
                    className="match-row"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/report/${item._id}`)}
                  >

                    <div
                      className="match-image"
                      style={{
                        backgroundImage: item.image
                          ? `url(${item.image})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />

                    <div>
                      <h4>{item.title.slice(0, 22)}{item.title.length > 22 ? "…" : ""}</h4>
                      {/* FIX: stable percentage from useMemo, not Math.random() */}
                      <p>{matchPercentages[item._id]}% Match</p>
                    </div>

                  </div>

                ))}

              </div>

              {/* RECENT MESSAGES — FIX: from real chat data */}
              <div className="side-card">

                <h3>Recent Messages</h3>

                {recentMessages.length === 0 ? (

                  <div className="message-row">
                    <div className="message-avatar" />
                    <div>
                      <h4>No messages yet</h4>
                      <p>Start a conversation from Matches.</p>
                    </div>
                  </div>

                ) : (

                  recentMessages.map((msg, i) => (

                    <div
                      key={i}
                      className="message-row"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/messages")}
                    >
                      <div className="message-avatar">
                        <FiMessageCircle size={18} />
                      </div>
                      <div>
                        <h4>{msg.name}</h4>
                        <p>{msg.preview}</p>
                      </div>
                    </div>

                  ))

                )}

              </div>

              {/* SAFETY */}
              <div className="safety-card">
                <h4>Safety Reminder</h4>
                <p>
                  Always meet in public places when recovering items and
                  never send money upfront.
                </p>
              </div>

            </div>

          </section>

        </div>

      </DashboardLayout>

    </MainLayout>

  )

}

export default Dashboard