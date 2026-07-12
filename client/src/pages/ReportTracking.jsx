import { useState, useRef, useEffect } from "react"
import {
  FiFileText, FiSearch, FiMessageSquare, FiCheckCircle,
  FiUpload, FiMessageCircle, FiShield,
  FiPlus, FiSend, FiX, FiGrid, FiAlertCircle,
  FiImage, FiEye,
} from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import Footer from "../components/Footer"
import { getMyReports, updateReportStatus } from "../services/reportService"
import { getMyMatches } from "../services/matchService"
import * as alert from "../utils/alert"
import Swal from "sweetalert2"
import "../styles/recovery-tracker.css"

function RecoveryTracker() {

  const navigate = useNavigate()
  const chatEndRef = useRef(null)

  const [myReports, setMyReports] = useState([])
  const [myMatches, setMyMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [matchedReport, setMatchedReport] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [showChatModal, setShowChatModal] = useState(false)
  const [proofImage, setProofImage] = useState("")
  const [showProofModal, setShowProofModal] = useState(false)
  const [showProofView, setShowProofView] = useState(false)
  const [pendingProof, setPendingProof] = useState("")
  const [toast, setToast] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsData, matchesData] = await Promise.all([
          getMyReports({ limit: 20 }),
          getMyMatches(),
        ])
        const reports = reportsData.reports || []
        const matches = matchesData.matches || []
        setMyReports(reports)
        setMyMatches(matches)

        const matched = reports.find((r) => r.status === "matched")
        if (matched) {
          setSelectedReport(matched)
          const relMatch = matches.find(
            (m) =>
              String(m.lostReportId?._id) === String(matched._id) ||
              String(m.foundReportId?._id) === String(matched._id)
          )
          if (relMatch) setMatchedReport(relMatch)
        } else if (reports.length > 0) {
          setSelectedReport(reports[0])
        }
      } catch (err) {
        console.error("Failed to load tracker data:", err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showChatModal])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3500)
  }

  const handleMarkResolved = async () => {
    if (!selectedReport) return
    const confirmed = await alert.confirm(
      "Mark this report as resolved? This means you have recovered your item.",
      "Mark as Resolved"
    )
    if (!confirmed) return
    alert.loading("Updating status...")
    try {
      const data = await updateReportStatus(selectedReport._id, "resolved")
      Swal.close()
      setSelectedReport(data.report)
      setMyReports((prev) =>
        prev.map((r) =>
          String(r._id) === String(selectedReport._id) ? data.report : r
        )
      )
      alert.toast("Report marked as resolved! 🎉", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to update status.", "Error")
    }
  }

  const handleChatFinder = () => {
    if (!matchedReport) {
      setShowChatModal(true)
      return
    }
    navigate("/messages")
  }

  const sendChatMessage = () => {
    if (!inputMessage.trim()) return
    const msg = {
      sender: "user",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, msg])
    setInputMessage("")
  }

  const handleProofFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPendingProof(reader.result)
    reader.readAsDataURL(file)
  }

  const submitProof = () => {
    if (!pendingProof) return
    setProofImage(pendingProof)
    setPendingProof("")
    setShowProofModal(false)
    showToast("Proof of ownership submitted successfully!")
  }

  const removeProof = () => {
    setProofImage("")
    setPendingProof("")
  }

  const getStep = () => {
    if (!selectedReport) return 1
    if (selectedReport.status === "resolved") return 4
    if (selectedReport.status === "matched") return 3
    if (matchedReport) return 2
    return 1
  }

  const currentStep = getStep()

  const steps = [
    { icon: <FiFileText />, label: "Reported" },
    { icon: <FiSearch />, label: "Matched" },
    { icon: <FiMessageSquare />, label: "Contacted" },
    { icon: <FiCheckCircle />, label: "Recovered" },
  ]

  const getOtherReport = () => {
    if (!matchedReport) return null
    const isLost = String(matchedReport.lostReportId?._id) === String(selectedReport?._id)
    return isLost ? matchedReport.foundReportId : matchedReport.lostReportId
  }

  const otherReport = getOtherReport()

  if (loading) {
    return (
      <MainLayout>
        <DashboardLayout>
          <div style={{ textAlign: "center", padding: "80px", color: "#9ca3af" }}>
            Loading tracker...
          </div>
        </DashboardLayout>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="tracker-page">

          {/* TOAST */}
          {toast && (
            <div className="tracker-toast">
              <FiCheckCircle /> {toast}
            </div>
          )}

          {/* TOP */}
          <div className="tracker-top">
            <div className="tracker-top-left">
              <div>
                <h1>Recovery Tracker</h1>
                <p>Track your lost item recovery process</p>
              </div>
            </div>
            <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
              <FiGrid /> Dashboard
            </button>
          </div>

          {/* REPORT SELECTOR */}
          {myReports.length > 1 && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                SELECT REPORT TO TRACK
              </label>
              <select
                value={selectedReport?._id || ""}
                onChange={(e) => {
                  const r = myReports.find((rep) => String(rep._id) === String(e.target.value))
                  setSelectedReport(r || null)
                  const m = myMatches.find(
                    (match) =>
                      String(match.lostReportId?._id) === String(r?._id) ||
                      String(match.foundReportId?._id) === String(r?._id)
                  )
                  setMatchedReport(m || null)
                }}
                style={{ padding: "10px 16px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "14px", fontWeight: 600, color: "#374151", width: "100%", maxWidth: "400px" }}
              >
                {myReports.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title} — {r.status?.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!selectedReport ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
              <FiFileText size={40} />
              <h3 style={{ marginTop: "16px" }}>No reports to track</h3>
              <p>Create a report first to start tracking.</p>
              <button
                onClick={() => navigate("/create-report")}
                style={{ marginTop: "20px", padding: "12px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                <FiPlus /> Create Report
              </button>
            </div>
          ) : (
            <>
              {/* STATUS CARD */}
              <div className="tracker-status-card">
                <div className="status-header">
                  <div>
                    <h2>Report Status</h2>
                    <span>{selectedReport.title}</span>
                  </div>
                  <div className="tracker-status-pill">
                    {selectedReport.status?.charAt(0).toUpperCase() + selectedReport.status?.slice(1)}
                  </div>
                </div>

                <div className="tracker-steps">
                  {steps.map((step, i) => (
                    <div key={step.label} style={{ display: "contents" }}>
                      <div className={`step ${currentStep > i ? "active-step" : ""}`}>
                        <div className="step-circle">
                          {currentStep > i ? <FiCheckCircle /> : step.icon}
                        </div>
                        <span>{step.label}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`step-line ${currentStep > i + 1 ? "active-line" : ""}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="matched-item-card">
                  {selectedReport.images?.[0]
                    ? <img src={selectedReport.images[0]} alt="" />
                    : <div className="matched-img-placeholder"><FiSearch size={28} /></div>
                  }
                  <div className="matched-content">
                    <div className="matched-title-row">
                      <div>
                        <h3>{selectedReport.title}</h3>
                        <p>{selectedReport.location}</p>
                      </div>
                      <span className="report-id">
                        LF-{String(selectedReport._id).slice(-6)}
                      </span>
                    </div>
                    {matchedReport && (
                      <div className="confidence-row">
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${matchedReport.confidenceScore || 0}%` }}
                          />
                        </div>
                        <span>{matchedReport.confidenceScore || 0}% Match Confidence</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* GRID */}
              <div className="tracker-grid">
                <div className="tracker-left">

                  {/* MATCHED ITEM INFO */}
                  {otherReport && (
                    <div className="action-card" style={{ marginBottom: "20px" }}>
                      <div className="action-head">
                        <h3>Matched Item</h3>
                        <p>
                          A {otherReport.type === "found" ? "found" : "lost"} report matches yours
                          with {matchedReport?.confidenceScore || 0}% confidence.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        {otherReport.images?.[0] && (
                          <img
                            src={otherReport.images[0]}
                            alt=""
                            style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }}
                          />
                        )}
                        <div>
                          <h4 style={{ fontWeight: 700, color: "#111827" }}>{otherReport.title}</h4>
                          <p style={{ fontSize: 13, color: "#6b7280" }}>{otherReport.location}</p>
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: 6,
                              padding: "3px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              background: otherReport.type === "found" ? "#dcfce7" : "#fef2f2",
                              color: otherReport.type === "found" ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {otherReport.type?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION CARD */}
                  <div className="action-card">
                    <div className="action-head">
                      <h3>Required Actions</h3>
                      <p>Complete these steps to proceed with recovery.</p>
                    </div>

                    {/* PROOF UPLOAD */}
                    <div className="proof-section">
                      {!proofImage ? (
                        <button className="upload-btn" onClick={() => setShowProofModal(true)}>
                          <FiUpload /> Upload Proof of Ownership
                        </button>
                      ) : (
                        <div className="uploaded-proof-card">
                          <div className="uploaded-proof-top">
                            <h4>Uploaded Proof</h4>
                            <div className="proof-card-actions">
                              <button className="view-proof-btn" onClick={() => setShowProofView(true)}>
                                <FiEye size={14} /> View
                              </button>
                              <button className="edit-proof-btn" onClick={() => setShowProofModal(true)}>
                                Edit
                              </button>
                            </div>
                          </div>
                          <div className="proof-thumb-wrapper">
                            <img src={proofImage} alt="Proof" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="action-buttons">
                      <button className="outline-btn" onClick={handleChatFinder}>
                        <FiMessageCircle /> Chat Finder
                      </button>
                      <button
                        className="outline-btn blue-btn"
                        onClick={() => showToast("Mediation request submitted. Our team will be in touch.")}
                      >
                        <FiShield /> Request Mediation
                      </button>
                    </div>

                    {selectedReport.status !== "resolved" && (
                      <button
                        onClick={handleMarkResolved}
                        style={{
                          width: "100%",
                          marginTop: "14px",
                          padding: "12px",
                          background: "#16a34a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <FiCheckCircle /> Mark as Recovered
                      </button>
                    )}
                  </div>

                  {/* TIMELINE */}
                  <div className="timeline-card">
                    <div className="timeline-head">
                      <h3>Recovery Timeline</h3>
                    </div>
                    <div className="timeline">
                      {[
                        {
                          icon: <FiFileText />,
                          title: "Report Published",
                          time: new Date(selectedReport.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }),
                          text: `Report LF-${String(selectedReport._id).slice(-6)} was published publicly.`,
                          active: true,
                        },
                        {
                          icon: <FiShield />,
                          title: "Identity Verified",
                          time: "Auto",
                          text: "Your account verification was successfully completed.",
                          active: true,
                        },
                        {
                          icon: <FiSearch />,
                          title: "Match Monitoring",
                          time: matchedReport ? "Match Found!" : "In Progress",
                          text: matchedReport
                            ? `A ${matchedReport.confidenceScore}% confidence match was found.`
                            : "AI is actively searching for possible matches.",
                          active: !!matchedReport,
                        },
                        {
                          icon: <FiCheckCircle />,
                          title: "Recovery Confirmed",
                          time: selectedReport.status === "resolved" ? "Done ✓" : "Pending",
                          text: "Final confirmation once the item is recovered.",
                          active: selectedReport.status === "resolved",
                        },
                      ].map((tl, i) => (
                        <div key={i} className={`timeline-item ${tl.active ? "active-timeline" : ""}`}>
                          <div className={`timeline-icon ${tl.active ? "" : "inactive-icon"}`}>
                            {tl.icon}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-title-row">
                              <h4>{tl.title}</h4>
                              <span>{tl.time}</span>
                            </div>
                            <p>{tl.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="tracker-right">
                  <div className="safety-card">
                    <div className="safety-icon"><FiShield /></div>
                    <div>
                      <h4>Meet In Public</h4>
                      <p>Always meet in a secure public location. Never send money upfront.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            className="floating-btn"
            onClick={() => navigate("/create-report")}
            title="Report new item"
          >
            <FiPlus />
          </button>

          {/* CHAT MODAL */}
          {showChatModal && (
            <div className="chat-modal-overlay" onClick={() => setShowChatModal(false)}>
              <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
                <div className="chat-header">
                  <h3>Chat Finder</h3>
                  <button className="chat-close-btn" onClick={() => setShowChatModal(false)}>
                    <FiX />
                  </button>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="chat-bubble finder">
                      <span className="bubble-text">Hello! I found an item matching your description.</span>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.sender}`}>
                      <span className="bubble-text">{msg.text}</span>
                      {msg.time && <span className="bubble-time">{msg.time}</span>}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    autoFocus
                  />
                  <button onClick={sendChatMessage} disabled={!inputMessage.trim()}>
                    <FiSend />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROOF UPLOAD MODAL */}
          {showProofModal && (
            <div className="proof-modal-overlay" onClick={() => setShowProofModal(false)}>
              <div className="proof-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Upload Proof of Ownership</h3>
                <p>Upload receipts, ID, warranty card, or any proof that confirms ownership.</p>
                {!pendingProof ? (
                  <label className="proof-upload-box">
                    <FiImage size={32} />
                    <h4>Select Image</h4>
                    <p>Click to browse · JPG, PNG, WEBP</p>
                    <input type="file" hidden accept="image/*" onChange={handleProofFileSelect} />
                  </label>
                ) : (
                  <div className="proof-preview-wrapper">
                    <div className="proof-preview">
                      <img src={pendingProof} alt="Preview" />
                    </div>
                    <div className="proof-preview-actions">
                      <label className="change-proof-btn">
                        Change Image
                        <input type="file" hidden accept="image/*" onChange={handleProofFileSelect} />
                      </label>
                      <button className="remove-proof-btn" onClick={() => setPendingProof("")}>Remove</button>
                    </div>
                  </div>
                )}
                <div className="proof-ownership-notice">
                  <FiAlertCircle size={14} />
                  <span>Once submitted, only you will be able to edit or remove this proof.</span>
                </div>
                <div className="proof-actions">
                  <button className="cancel-btn" onClick={() => setShowProofModal(false)}>Cancel</button>
                  <button className="submit-btn" disabled={!pendingProof} onClick={submitProof}>Submit Proof</button>
                </div>
              </div>
            </div>
          )}

          {/* PROOF VIEW MODAL */}
          {showProofView && proofImage && (
            <div className="proof-modal-overlay" onClick={() => setShowProofView(false)}>
              <div className="proof-modal proof-view-modal" onClick={(e) => e.stopPropagation()}>
                <div className="proof-view-header">
                  <h3>Proof of Ownership</h3>
                  <button className="chat-close-btn" onClick={() => setShowProofView(false)}>
                    <FiX />
                  </button>
                </div>
                <div className="proof-view-img-wrap">
                  <img src={proofImage} alt="Proof" />
                </div>
                <div className="proof-actions">
                  <button
                    className="remove-proof-btn"
                    onClick={() => {
                      removeProof()
                      setShowProofView(false)
                    }}
                  >
                    Remove Proof
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
        <Footer />
      </DashboardLayout>
    </MainLayout>
  )
}

export default RecoveryTracker