import { useState } from "react"

import {
  FiFilter,
  FiChevronDown,
  FiThumbsUp,
  FiThumbsDown,
  FiMapPin,
  FiClock,
  FiMessageCircle,
  FiCheck,
  FiX,
  FiShield,
  FiMoreVertical,
} from "react-icons/fi"

import { useNavigate } from "react-router-dom"

import DashboardLayout from "../layouts/DashboardLayout"
import MainLayout from "../layouts/MainLayout"

import "../styles/matches.css"

function Matches() {

  const navigate = useNavigate()

  const [confidenceValue, setConfidenceValue] = useState(70)

  const [selectedFilters, setSelectedFilters] = useState({
    within10: false,
    statewide: true,
    nigeria: false,
    aiVerified: true,
    adminReviewed: false,
    newLeads: false,
  })

  const [selectedMatches, setSelectedMatches] = useState([])

  const [activeMatch, setActiveMatch] = useState(1)

  const [matches, setMatches] = useState([
    {
      id: 1,
      brand: "Apple",
      location: "Ikeja, Lagos",
      time: "2 hours ago",
      description:
        "Exact match on unique sticker layout on top lid and matching",
      score: 94,
      confidence: "High Confidence",
      image:
        "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
      liked: false,
      disliked: false,
      status: "pending",
    },

    {
      id: 2,
      brand: "Silver",
      location: "Surulere, Lagos",
      time: "5 hours ago",
      description:
        "Matching model year and color. No visible serial number",
      score: 72,
      confidence: "High Confidence",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
      liked: false,
      disliked: false,
      status: "pending",
    },

    {
      id: 3,
      brand: "Samsung",
      location: "Enugu, EN",
      time: "1 day ago",
      description:
        "Unique cracked screen pattern matches the user's reference",
      score: 88,
      confidence: "High Confidence",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
      liked: false,
      disliked: false,
      status: "pending",
    },
  ])

  const toggleCheckbox = (key) => {

    setSelectedFilters({
      ...selectedFilters,
      [key]: !selectedFilters[key],
    })

  }

  const toggleMatchSelection = (id) => {

    if (selectedMatches.includes(id)) {

      setSelectedMatches(
        selectedMatches.filter((item) => item !== id)
      )

    } else {

      setSelectedMatches([
        ...selectedMatches,
        id,
      ])

    }

  }

  const handleLike = (id) => {

    const updated = matches.map((match) => {

      if (match.id === id) {

        return {
          ...match,
          liked: !match.liked,
          disliked: false,
        }

      }

      return match

    })

    setMatches(updated)

  }

  const handleDislike = (id) => {

    const updated = matches.map((match) => {

      if (match.id === id) {

        return {
          ...match,
          disliked: !match.disliked,
          liked: false,
        }

      }

      return match

    })

    setMatches(updated)

  }

  const acceptMatch = (id) => {

    const updated = matches.map((match) => {

      if (match.id === id) {

        return {
          ...match,
          status: "accepted",
        }

      }

      return match

    })

    setMatches(updated)

    alert("Match Accepted")

  }

  const rejectMatch = (id) => {

    const updated = matches.map((match) => {

      if (match.id === id) {

        return {
          ...match,
          status: "rejected",
        }

      }

      return match

    })

    setMatches(updated)

    alert("Match Rejected")

  }

  const acceptSelectedMatches = () => {

    if (selectedMatches.length === 0) {

      alert("Select matches first")
      return

    }

    const updated = matches.map((match) => {

      if (selectedMatches.includes(match.id)) {

        return {
          ...match,
          status: "accepted",
        }

      }

      return match

    })

    setMatches(updated)

    alert("Selected matches accepted")

  }

  const activeMatchData =
    matches.find((item) => item.id === activeMatch)

  return (

    <MainLayout>

      <DashboardLayout>

        <div className="matches-page">

          {/* LEFT FILTER */}
          <aside className="matches-filter-sidebar">

            <div className="filter-top">

              <div className="filter-title">

                <FiFilter />

                <h2>
                  Filter Matches
                </h2>

              </div>

              <button
                onClick={() => {

                  setConfidenceValue(70)

                  setSelectedFilters({
                    within10: false,
                    statewide: true,
                    nigeria: false,
                    aiVerified: true,
                    adminReviewed: false,
                    newLeads: false,
                  })

                }}
              >
                Reset All
              </button>

            </div>

            {/* MATCH CONFIDENCE */}
            <div className="filter-section">

              <div className="filter-heading">

                <h3>
                  Match Confidence
                </h3>

                <FiChevronDown />

              </div>

              <div className="confidence-header">

                <span>
                  Minimum Score
                </span>

                <strong>
                  {confidenceValue}%
                </strong>

              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={confidenceValue}
                onChange={(e) =>
                  setConfidenceValue(e.target.value)
                }
              />

              <div className="confidence-pills">

                <button
                  className={
                    confidenceValue >= 80
                    ? "active-pill"
                    : ""
                  }
                >
                  High (&gt;80%)
                </button>

                <button
                  className={
                    confidenceValue < 80
                    ? "active-pill"
                    : ""
                  }
                >
                  Normal
                </button>

              </div>

            </div>

            {/* LOCATION */}
            <div className="filter-section">

              <div className="filter-heading">

                <h3>
                  Location Radius
                </h3>

                <FiChevronDown />

              </div>

              <label>

                <input
                  type="checkbox"
                  checked={selectedFilters.within10}
                  onChange={() =>
                    toggleCheckbox("within10")
                  }
                />

                Within 10km

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedFilters.statewide}
                  onChange={() =>
                    toggleCheckbox("statewide")
                  }
                />

                State-wide

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedFilters.nigeria}
                  onChange={() =>
                    toggleCheckbox("nigeria")
                  }
                />

                Across Nigeria

              </label>

            </div>

            {/* VERIFICATION */}
            <div className="filter-section">

              <div className="filter-heading">

                <h3>
                  Verification Status
                </h3>

                <FiChevronDown />

              </div>

              <label>

                <input
                  type="checkbox"
                  checked={selectedFilters.aiVerified}
                  onChange={() =>
                    toggleCheckbox("aiVerified")
                  }
                />

                AI Verified

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedFilters.adminReviewed}
                  onChange={() =>
                    toggleCheckbox("adminReviewed")
                  }
                />

                Admin Reviewed

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedFilters.newLeads}
                  onChange={() =>
                    toggleCheckbox("newLeads")
                  }
                />

                New Leads

              </label>

            </div>

            {/* ADMIN */}
            <div className="admin-actions">

              <h4>
                ADMIN QUICK ACTIONS
              </h4>

              <button
                className="admin-btn"
                onClick={() =>
                  alert("Exited Admin Mode")
                }
              >

                <FiShield />

                Exit Admin Mode

              </button>

              <button
                className="logs-btn"
                onClick={() =>
                  alert("Opening Advanced Logs")
                }
              >

                <FiMoreVertical />

                Advanced Logs

              </button>

            </div>

          </aside>

          {/* CENTER */}
          <main className="matches-main">

            {/* TOP */}
            <div className="matches-main-top">

              <div className="matches-feed-left">

                <h1>
                  Matches Feed
                </h1>

                <span>
                  12 New Hits
                </span>

              </div>

              <div className="matches-feed-right">

                <p>
                  Sort by:
                </p>

                <button
                  onClick={acceptSelectedMatches}
                >
                  Accept Selected
                </button>

              </div>

            </div>

            {/* MATCH GROUP */}
            <div className="match-group">

              <div className="group-header">

                <div className="group-left">

                  <span className="lost-tag">
                    LOST
                  </span>

                  <h2>
                    Matches for: MacBook Pro 14'
                    (2021)
                  </h2>

                </div>

                <span className="group-count">
                  {matches.length} Matches
                </span>

              </div>

              {
                matches
                  .filter(
                    (item) =>
                      item.score >= confidenceValue
                  )
                  .map((match) => (

                    <div
                      key={match.id}
                      className={`match-card ${
                        activeMatch === match.id
                        ? "active-match"
                        : ""
                      }`}
                      onClick={() =>
                        setActiveMatch(match.id)
                      }
                    >

                      <div className="match-left">

                        <input
                          type="checkbox"
                          checked={
                            selectedMatches.includes(
                              match.id
                            )
                          }
                          onChange={() =>
                            toggleMatchSelection(
                              match.id
                            )
                          }
                        />

                        <img
                          src={match.image}
                          alt=""
                        />

                      </div>

                      <div className="match-middle">

                        <div className="match-top-row">

                          <h3>
                            {match.brand}
                          </h3>

                          <span className="confidence-badge">
                            {match.confidence}
                          </span>

                        </div>

                        <div className="match-meta">

                          <span>

                            <FiMapPin />

                            {match.location}

                          </span>

                          <span>

                            <FiClock />

                            {match.time}

                          </span>

                        </div>

                        <p>
                          "{match.description}"
                        </p>

                        {
                          match.status === "accepted" && (
                            <div className="accepted-text">
                              Accepted
                            </div>
                          )
                        }

                        {
                          match.status === "rejected" && (
                            <div className="rejected-text">
                              Rejected
                            </div>
                          )
                        }

                      </div>

                      <div className="match-right">

                        <div className="match-score">

                          <h2>
                            {match.score}%
                          </h2>

                          <span>
                            MATCH
                          </span>

                        </div>

                        <div className="match-actions">

                          <button
                            className={
                              match.liked
                              ? "liked-btn"
                              : ""
                            }
                            onClick={(e) => {

                              e.stopPropagation()

                              handleLike(match.id)

                            }}
                          >

                            <FiThumbsUp />

                          </button>

                          <button
                            className={`danger ${
                              match.disliked
                              ? "disliked-btn"
                              : ""
                            }`}
                            onClick={(e) => {

                              e.stopPropagation()

                              handleDislike(match.id)

                            }}
                          >

                            <FiThumbsDown />

                          </button>

                        </div>

                      </div>

                    </div>

                  ))
              }

            </div>

            {/* EMPTY */}
            {
              matches.filter(
                (item) =>
                  item.score >= confidenceValue
              ).length === 0 && (

                <div className="no-more-matches">

                  <div className="empty-icon">
                    ⚡
                  </div>

                  <h3>
                    No more high-confidence matches found
                  </h3>

                  <p>
                    Adjust your filters to see
                    lower-confidence candidates.
                  </p>

                </div>

              )
            }

          </main>

          {/* RIGHT PANEL */}
          <aside className="evidence-panel">

            <h1>
              Evidence Comparison
            </h1>

            <p className="evidence-subtitle">

              Verification for your report:

              <span>
                MacBook Pro 14' (2021)
              </span>

            </p>

            {/* IMAGES */}
            <div className="comparison-images">

              <div>

                <small>
                  YOUR REFERENCE
                </small>

                <img
                  src="https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop"
                  alt=""
                />

              </div>

              <div>

                <small>
                  POTENTIAL MATCH
                </small>

                <img
                  src={activeMatchData?.image}
                  alt=""
                />

              </div>

            </div>

            {/* BREAKDOWN */}
            <div className="score-breakdown">

              <h3>
                Similarity Score Breakdown
              </h3>

              <div className="score-row">

                <div className="score-label">

                  <span>
                    Color Matching
                  </span>

                  <strong>
                    100%
                  </strong>

                </div>

                <div className="score-bar">
                  <div className="score-fill w100"></div>
                </div>

              </div>

              <div className="score-row">

                <div className="score-label">

                  <span>
                    Model/Serial Identifiers
                  </span>

                  <strong>
                    95%
                  </strong>

                </div>

                <div className="score-bar">
                  <div className="score-fill w95"></div>
                </div>

              </div>

            </div>

            {/* AI */}
            <div className="ai-analysis">

              <h3>
                AI Assistant Analysis
              </h3>

              <p>
                The matched item features a
                unique sticker pattern and visible
                wear pattern which strongly aligns
                with the original report.
              </p>

            </div>

            {/* ADMIN */}
            <div className="admin-override">

              <h3>
                Administrator Overrides
              </h3>

              <div className="override-buttons">

                <button
                  onClick={() =>
                    alert("Fraud flagged")
                  }
                >
                  Flag Fraud
                </button>

                <button
                  onClick={() =>
                    alert("Manual Link Added")
                  }
                >
                  Manual Link
                </button>

              </div>

            </div>

            {/* BOTTOM */}
            <button
              className="message-btn"
              onClick={() =>
                navigate("/messages")
              }
            >

              <FiMessageCircle />

              Message Finder

            </button>

            <div className="bottom-actions">

              <button
                className="accept-btn"
                onClick={() =>
                  acceptMatch(activeMatch)
                }
              >

                <FiCheck />

                Accept Match

              </button>

              <button
                className="reject-btn"
                onClick={() =>
                  rejectMatch(activeMatch)
                }
              >

                <FiX />

                Reject

              </button>

            </div>

          </aside>

        </div>

      </DashboardLayout>

    </MainLayout>

  )

}

export default Matches