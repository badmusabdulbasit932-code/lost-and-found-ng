import {
  FiFilter, FiChevronDown, FiThumbsUp, FiThumbsDown,
  FiMapPin, FiClock, FiMessageCircle, FiCheck, FiX,
  FiShield,
} from "react-icons/fi"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import MainLayout from "../layouts/MainLayout"
import { getMyMatches, acceptMatch, rejectMatch } from "../services/matchService"
import { startConversation } from "../services/messageService"
import * as alert from "../utils/alert"
import Swal from "sweetalert2"
import "../styles/matches.css"

function Matches() {

  const navigate = useNavigate()

  const [matches, setMatches] = useState([])
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [selectedMatches, setSelectedMatches] = useState([])
  const [minimumScore, setMinimumScore] = useState(0)
  const [confidenceFilter, setConfidenceFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMyMatches()
        const list = data.matches || []
        setMatches(list)
        if (list.length > 0) setSelectedEvidence(list[0])
      } catch (err) {
        alert.error(err.message || "Failed to load matches.", "Error")
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const handleAcceptMatch = async (matchId) => {
    const confirmed = await alert.confirm(
      "Are you sure you want to accept this match?",
      "Accept Match"
    )
    if (!confirmed) return
    alert.loading("Accepting match...")
    try {
      await acceptMatch(matchId)
      Swal.close()
      setMatches((prev) =>
        prev.map((m) =>
          String(m._id) === String(matchId)
            ? { ...m, status: "accepted" }
            : m
        )
      )
      setSelectedEvidence((prev) =>
        prev && String(prev._id) === String(matchId)
          ? { ...prev, status: "accepted" }
          : prev
      )
      alert.toast("Match accepted! You can now start a conversation.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to accept match.", "Error")
    }
  }

  const handleRejectMatch = async (matchId) => {
    const confirmed = await alert.confirm(
      "Are you sure you want to reject this match? We will keep searching for you.",
      "Reject Match"
    )
    if (!confirmed) return
    alert.loading("Rejecting match...")
    try {
      await rejectMatch(matchId)
      Swal.close()
      setMatches((prev) =>
        prev.map((m) =>
          String(m._id) === String(matchId)
            ? { ...m, status: "rejected" }
            : m
        )
      )
      setSelectedEvidence((prev) =>
        prev && String(prev._id) === String(matchId)
          ? { ...prev, status: "rejected" }
          : prev
      )
      alert.toast("Match rejected. We will keep searching.", "info")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to reject match.", "Error")
    }
  }

  const messageFinder = async () => {
    if (!selectedEvidence) return
    if (selectedEvidence.status !== "accepted") {
      alert.info(
        "You need to accept the match first before starting a conversation.",
        "Accept Match First"
      )
      return
    }
    alert.loading("Starting conversation...")
    try {
      const data = await startConversation(selectedEvidence._id)
      Swal.close()
      navigate("/messages", {
        state: { conversationId: data.conversation._id },
      })
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to start conversation.", "Error")
    }
  }

  const handleLike = (_id) => setMatches((p) => p.map((m) => m._id === _id ? { ...m, liked: !m.liked, disliked: false } : m))
  const handleDislike = (_id) => setMatches((p) => p.map((m) => m._id === _id ? { ...m, disliked: !m.disliked, liked: false } : m))
  const toggleSelect = (_id) => setSelectedMatches((p) => p.includes(_id) ? p.filter((i) => i !== _id) : [...p, _id])

  const getConfidence = (match) => match.confidenceScore || 0

  const getLostImage = (match) => match.lostReportId?.images?.[0] || null
  const getFoundImage = (match) => match.foundReportId?.images?.[0] || null
  const getTitle = (match) => match.lostReportId?.title || match.foundReportId?.title || "Unknown Item"
  const getLocation = (match) => match.lostReportId?.location || match.foundReportId?.location || "—"

  const filteredMatches = matches.filter((m) => {
    const score = getConfidence(m)
    if (score < minimumScore) return false
    if (confidenceFilter === "high" && score < 80) return false
    if (confidenceFilter === "normal" && score >= 80) return false
    return true
  })

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="matches-page">

          {/* FILTER SIDEBAR */}
          <aside className="matches-filter-sidebar">
            <div className="filter-top">
              <div className="filter-title">
                <FiFilter />
                <h2>Filter Matches</h2>
              </div>
            </div>
            <div className="filter-section">
              <div className="filter-heading">
                <h3>Match Confidence</h3>
                <FiChevronDown />
              </div>
              <div className="confidence-header">
                <span>Minimum Score</span>
                <strong>{minimumScore}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={minimumScore}
                onChange={(e) => setMinimumScore(Number(e.target.value))}
              />
              <div className="confidence-pills">
                {["high", "normal", "all"].map((f) => (
                  <button
                    key={f}
                    className={confidenceFilter === f ? "active-pill" : ""}
                    onClick={() => setConfidenceFilter(f)}
                  >
                    {f === "high" ? "High (>80%)" : f === "normal" ? "Normal" : "All"}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN FEED */}
          <main className="matches-main">

            <div className="matches-main-top">
              <div className="matches-feed-left">
                <h1>Matches Feed</h1>
                <span>
                  {filteredMatches.length} Match{filteredMatches.length !== 1 ? "es" : ""}
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="no-more-matches">
                <div className="empty-icon">⚡</div>
                <h3>No matches found</h3>
                <p>Create LOST and FOUND reports with similar details to trigger matching.</p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="no-more-matches">
                <div className="empty-icon">🔍</div>
                <h3>No matches at this level</h3>
                <p>Lower the score or switch to "All".</p>
              </div>
            ) : (
              <div className="match-group">
                {filteredMatches.map((match) => {
                  const score = getConfidence(match)
                  const title = getTitle(match)
                  const location = getLocation(match)
                  const lostImg = getLostImage(match)

                  return (
                    <div
                      key={match._id}
                      className={`match-card
                        ${selectedEvidence?._id === match._id ? "active-match" : ""}
                        ${match.status !== "pending" ? `status-${match.status}` : ""}
                      `}
                      onClick={() => setSelectedEvidence(match)}
                    >

                      <div className="match-left">
                        <input
                          type="checkbox"
                          checked={selectedMatches.includes(match._id)}
                          onChange={() => toggleSelect(match._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {lostImg
                          ? <img src={lostImg} alt="" />
                          : <div className="match-img-placeholder"><FiShield /></div>
                        }
                      </div>

                      <div className="match-middle">
                        <div className="match-top-row">
                          <h3>{title}</h3>
                          <span className={`confidence-badge ${score >= 90 ? "badge-high" : score >= 75 ? "badge-medium" : "badge-low"}`}>
                            {score >= 90 ? "Very High" : score >= 75 ? "High" : "Moderate"} Confidence
                          </span>
                        </div>
                        <div className="match-meta">
                          <span><FiMapPin />{location}</span>
                          <span><FiClock />{new Date(match.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        <p>{match.lostReportId?.description?.slice(0, 120)}{match.lostReportId?.description?.length > 120 ? "..." : ""}</p>
                        {match.status !== "pending" && (
                          <span className={`match-status-tag status-tag-${match.status}`}>
                            {match.status === "accepted" ? "✓ Accepted" : "✕ Rejected"}
                          </span>
                        )}
                      </div>

                      <div className="match-right">
                        <div className="match-score">
                          <h2>{score}%</h2>
                          <span>MATCH</span>
                        </div>
                        <div className="match-actions">
                          <button
                            className={match.liked ? "liked-btn" : ""}
                            onClick={(e) => { e.stopPropagation(); handleLike(match._id) }}
                          >
                            <FiThumbsUp />
                          </button>
                          <button
                            className={match.disliked ? "disliked-btn" : ""}
                            onClick={(e) => { e.stopPropagation(); handleDislike(match._id) }}
                          >
                            <FiThumbsDown />
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

          </main>

          {/* EVIDENCE PANEL */}
          {selectedEvidence && (
            <aside className="evidence-panel">
              <h1>Evidence Comparison</h1>
              <p className="evidence-subtitle">
                Verification for: <span>{getTitle(selectedEvidence)}</span>
              </p>

              <div className="comparison-images">
                <div>
                  <small>LOST REPORT</small>
                  {getLostImage(selectedEvidence)
                    ? <img src={getLostImage(selectedEvidence)} alt="Lost" />
                    : <div className="comparison-placeholder">No image</div>
                  }
                </div>
                <div>
                  <small>FOUND REPORT</small>
                  {getFoundImage(selectedEvidence)
                    ? <img src={getFoundImage(selectedEvidence)} alt="Found" />
                    : <div className="comparison-placeholder">No image</div>
                  }
                </div>
              </div>

              <div className="score-breakdown">
                <h3>Similarity Score Breakdown</h3>
                {[
                  { label: "Category", value: selectedEvidence.similarityBreakdown?.category || 0 },
                  { label: "Location", value: selectedEvidence.similarityBreakdown?.location || 0 },
                  { label: "Title", value: selectedEvidence.similarityBreakdown?.title || 0 },
                  { label: "Date", value: selectedEvidence.similarityBreakdown?.date || 0 },
                  { label: "Images", value: selectedEvidence.similarityBreakdown?.images || 0 },
                ].map((s) => (
                  <div key={s.label} className="score-row">
                    <div className="score-label">
                      <span>{s.label}</span>
                      <strong>{s.value}%</strong>
                    </div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="ai-analysis">
                <h3>AI Assistant Analysis</h3>
                <p>
                  {getConfidence(selectedEvidence) >= 90
                    ? "Strong match — very likely the same item."
                    : getConfidence(selectedEvidence) >= 75
                      ? "Likely match — verify key details before accepting."
                      : "Possible match — verify carefully before accepting."}
                </p>
              </div>

              <button className="message-btn" onClick={messageFinder}>
                <FiMessageCircle /> Message Finder
              </button>

              <div className="bottom-actions">
                <button
                  className="accept-btn"
                  disabled={selectedEvidence.status === "accepted"}
                  onClick={() => handleAcceptMatch(selectedEvidence._id)}
                >
                  <FiCheck />
                  {selectedEvidence.status === "accepted" ? "Accepted" : "Accept Match"}
                </button>
                <button
                  className="reject-btn"
                  disabled={selectedEvidence.status === "rejected"}
                  onClick={() => handleRejectMatch(selectedEvidence._id)}
                >
                  <FiX />
                  {selectedEvidence.status === "rejected" ? "Rejected" : "Reject"}
                </button>
              </div>
            </aside>
          )}

        </div>
      </DashboardLayout>
    </MainLayout>
  )
}

export default Matches