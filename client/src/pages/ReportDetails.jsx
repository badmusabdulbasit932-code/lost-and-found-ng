import {
  FiMapPin,
  FiClock,
  FiShare2,
  FiFlag,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiMessageCircle,
  FiCheckCircle,
} from "react-icons/fi"

import { useParams, useNavigate } from "react-router-dom"

import { useEffect, useState } from "react"

import * as alert from "../utils/alert"

import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import { getReport, getAllReports } from "../services/reportService"

import "../styles/report-details.css"

const FAQS = [
  {
    question: "How do I know this report is genuine?",
    answer: "Every report goes through our verification process before it appears publicly, and community members can flag anything suspicious.",
  },
  {
    question: "Is it safe to message the finder/owner?",
    answer: "Yes — messaging keeps your contact details private until both sides agree to reveal them, so you can chat safely on the platform.",
  },
  {
    question: "What happens after I claim an item?",
    answer: "We'll connect you with the other party through our messaging system so you can arrange verification and, if needed, a handover.",
  },
]

function ReportDetails() {

  const { id } = useParams()
  const navigate = useNavigate()

  // ── Data state ────────────────────────────────────────────────────────
  const [report, setReport] = useState(null)
  const [relatedReports, setRelatedReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")
  const [openFaq, setOpenFaq] = useState(null)

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))
  const isAdmin = loggedInUser?.role === "admin"

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }

  // ── Fetch the report from backend ─────────────────────────────────────
  useEffect(() => {

    const fetchReport = async () => {

      try {

        const data = await getReport(id)
        setReport(data.report)

        const all = await getAllReports()
        setRelatedReports(all.reports || [])

      } catch (err) {

        alert.error(
          err.message || "Failed to load report.",
          "Error"
        )

      } finally {

        setLoading(false)

      }

    }

    fetchReport()

  }, [id])

  // ── Action handlers ─────────────────────────────────────────────────
  const shareReport = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: report?.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast("Link copied to clipboard!")
      }
    } catch {
      // user cancelled share sheet — nothing to do
    }
  }

  const flagFraud = async () => {
    const confirmed = await alert.confirm(
      "Report this listing as fraudulent or suspicious?",
      "Report Fraud"
    )
    if (confirmed) {
      showToast("Thanks — our team will review this report.")
    }
  }

  const claimItem = async () => {
    const confirmed = await alert.confirm(
      "We'll open a conversation so you can verify this is your item.",
      "This Is My Item"
    )
    if (confirmed) {
      navigate("/messages")
    }
  }

  const messageFinder = () => {
    navigate("/messages")
  }
  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <DashboardLayout>
          <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af" }}>
            Loading report...
          </div>
        </DashboardLayout>
      </MainLayout>
    )
  }

  // Not found state
  if (!report) {
    return (
      <MainLayout>
        <DashboardLayout>
          <div className="report-details-page">
            <div className="details-card" style={{ textAlign: "center", padding: 48 }}>
              <h2>Report Not Found</h2>
              <p style={{ color: "#6b7280", marginTop: 8, marginBottom: 24 }}>
                This report may have been removed or the link is incorrect.
              </p>
              <button className="primary-side-btn" onClick={() => navigate("/discover")}>
                Browse All Reports
              </button>
            </div>
          </div>
        </DashboardLayout>
      </MainLayout>
    )
  }
  return (

    <MainLayout>

      <DashboardLayout>

        <div className="report-details-page">

          {/* TOAST */}
          {toast && (
            <div className="details-toast">
              <FiCheckCircle />
              {toast}
            </div>
          )}

          {/* FIX: moderator bar only for admin users */}
          {isAdmin && (
            <div className="moderator-bar">
              <p>Moderator View: This report has active flags</p>
              <div className="moderator-actions">
                <button className="remove-btn">Remove Report</button>
                <button className="review-btn">Review Flags</button>
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="report-details-container">

            {/* LEFT */}
            <div className="details-left">

              {/* TOP */}
              <div className="details-top">

                <div>

                  <div className="breadcrumb">
                    Browse Reports {">"} {report.category} {">"} Report #{report._id?.slice(-6)}
                  </div>

                  <h1>{report.title}</h1>

                  <div className="details-meta">

                    {/* FIX: badge checks report.type, not report.status */}
                    <span
                      className={
                        report.type === "found"
                          ? "found-badge"
                          : "lost-badge"
                      }
                    >
                      {report.type?.toUpperCase()}
                    </span>

                    <span>
                      <FiMapPin />
                      {report.location}
                    </span>

                    <span>
                      <FiClock />
                      Listed {report.date}
                    </span>

                  </div>

                </div>

                <div className="top-actions">

                  <button className="share-btn" onClick={shareReport}>
                    <FiShare2 />
                    Share
                  </button>

                  <button className="report-flag-btn" onClick={flagFraud}>
                    <FiFlag />
                    Report Fraud
                  </button>

                </div>

              </div>

              {/* Image */}
              <div className="main-image-card">
                {report.images && report.images.length > 0 ? (
                  <>
                    <span className="verified-image">
                      {report.status !== "open" ? "Verified Image" : "Unverified"}
                    </span>
                    <img src={report.images[0]} alt={report.title} />
                  </>
                ) : (
                  <div className="details-img-placeholder">No image provided</div>
                )}
              </div>

              {/* Thumbnails */}
              {report.images && report.images.length > 0 && (
                <div className="thumbnail-row">
                  {report.images.map((img, i) => (
                    <img key={i} src={img} alt="" className={i === 0 ? "active-thumb" : ""} />
                  ))}
                </div>
              )}

              {/* DESCRIPTION */}
              <div className="details-card">

                <h2>Item Description</h2>

                <p>{report.description || "No description provided."}</p>

                <div className="spec-grid">

                  <div>
                    <span>CATEGORY</span>
                    <h4>{report.category}</h4>
                  </div>

                  <div>
                    <span>TYPE</span>
                    {/* FIX: show type not status here — status is open/matched */}
                    <h4 style={{ textTransform: "capitalize" }}>{report.type}</h4>
                  </div>

                  <div>
                    <span>STATUS</span>
                    <h4 style={{ textTransform: "capitalize" }}>{report.status}</h4>
                  </div>

                  <div>
                    <span>REWARD</span>
                    <h4>{report.reward || "₦0"}</h4>
                  </div>

                </div>

              </div>

              {/* TIMELINE */}
              <div className="details-card">

                <h2>Recovery Timeline</h2>

                <div className="timeline">

                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div>
                      <h4>Report Created</h4>
                      <span>{report.date}</span>
                      <p>This item was reported on Lost & Found NG.</p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div>
                      <h4>Verification Completed</h4>
                      <span>Same Day</span>
                      <p>Report information was reviewed successfully.</p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className={`timeline-dot ${report.status === "matched" ? "" : "inactive-dot"}`} />
                    <div>
                      <h4>Match Monitoring</h4>
                      <span>{report.status === "matched" ? "Match Found!" : "Active"}</span>
                      <p>AI monitoring is searching for possible matches.</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* FIX: FAQ accordion with open/close toggle */}
              <div className="details-card">

                <h2>Safety & Verification FAQ</h2>

                {FAQS.map((faq, i) => (

                  <div key={i} className="faq-item">

                    <div
                      className="faq-top"
                      onClick={() =>
                        setOpenFaq(openFaq === i ? null : i)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <h4>{faq.question}</h4>
                      {openFaq === i ? <FiChevronUp /> : <FiChevronDown />}
                    </div>

                    {openFaq === i && (
                      <p className="faq-answer">{faq.answer}</p>
                    )}

                  </div>

                ))}

              </div>

              {/* RELATED REPORTS */}
              <div className="related-section">

                <div className="related-top">
                  <div>
                    <h2>Similar Reports</h2>
                    <p>Other related items from the community.</p>
                  </div>
                </div>

                {relatedReports.filter((item) => item._id !== report._id).length === 0 ? (

                  <p style={{ color: "#9ca3af", fontSize: 14 }}>
                    No similar reports yet.
                  </p>

                ) : (

                  <div className="related-grid">

                    {relatedReports
                      .filter(
                        (item) =>
                          String(item._id) !== String(report._id) &&
                          (item.category === report.category ||
                            item.location === report.location)
                      )
                      .slice(0, 3)
                      .map((item) => (

                        <div
                          key={item._id}
                          className="related-card"
                          onClick={() =>
                            navigate(`/report/${item._id}`)
                          }
                          style={{ cursor: "pointer" }}
                        >

                          {item.image ? (
                            <img src={item.image} alt={item.title} />
                          ) : (
                            <div className="related-img-placeholder" />
                          )}

                          <div className="related-content">
                            <span
                              className={
                                item.type === "found"
                                  ? "found-badge"
                                  : "lost-badge"
                              }
                            >
                              {item.type?.toUpperCase()}
                            </span>
                            <h4>{item.title}</h4>
                            <p>{item.location}</p>
                          </div>

                        </div>

                      ))}

                  </div>

                )}

              </div>

            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="details-right">

              {/* RECOVERY ODDS */}
              <div className="side-card">

                <h3>Recovery Odds</h3>

                <p>AI comparison with your profile</p>

                <div className="match-circle">
                  {report.confidence || 85}%
                </div>

                {/* FIX: both buttons now navigate correctly */}
                <button
                  className="primary-side-btn"
                  onClick={claimItem}
                >
                  This Is My Item
                </button>

                <button
                  className="secondary-side-btn"
                  onClick={messageFinder}
                >
                  <FiMessageCircle style={{ marginRight: 6 }} />
                  Message Finder
                </button>

              </div>

              {/* REPORT INFO */}
              <div className="side-card">

                <h3>Report Information</h3>

                <div className="finder-box">
                  <img
                    src={report.userId?.avatar || `https://i.pravatar.cc/100?u=${report.userId?._id}`}
                    alt=""
                  />
                  <div>
                    <h4>{report.userId?.name || "Community Member"}</h4>
                    <p>Verified User</p>
                  </div>
                </div>

                <div className="verified-box">
                  <FiShield />
                  <p>Verified Community Member</p>
                </div>

              </div>

              {/* MAP PLACEHOLDER */}
              <div className="side-card">

                <h3>Found Location</h3>

                <div className="map-placeholder">
                  <FiMapPin size={28} />
                  <p>{report.location}</p>
                </div>

              </div>

              {/* SAFETY TIP */}
              <div className="safety-card">

                <h3>Safety Tip</h3>

                <p>
                  Never send money before verifying the item physically.
                  Meet in a public place and never share your bank details in chat.
                </p>

                <button onClick={() => navigate("/support")}>Read our Safety Tips</button>

              </div>

            </aside>

          </div>

        </div>

      </DashboardLayout>

    </MainLayout>

  )

}

export default ReportDetails