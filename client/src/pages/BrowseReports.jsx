import {
  FiSearch,
  FiMapPin,
  FiClock,
  FiFilter,
  FiGrid,
  FiList,
  FiHeart,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
  FiMenu,
  FiX,
} from "react-icons/fi"

import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getAllReports } from "../services/reportService"
import * as alert from "../utils/alert"
import Footer from "../components/Footer"
import "../styles/browseReports.css"

function BrowseReports() {

  const navigate = useNavigate()

  // ── Filter state ──────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState("")
  const [location, setLocation] = useState("")
  const [activeType, setActiveType] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [gridView, setGridView] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)

  // ── Data state ────────────────────────────────────────────────────────
  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  // ── Fetch reports from backend ────────────────────────────────────────
  const fetchReports = useCallback(async () => {

    // Start loading
    setLoading(true)

    try {

      // Build the filters object
      // Only include fields that have values
      const filters = { page, limit: 12 }

      if (activeType !== "all") filters.type = activeType
      if (activeCategory !== "all") filters.category = activeCategory
      if (searchText.trim()) filters.search = searchText.trim()
      if (location.trim()) filters.location = location.trim()

      // Call the backend
      const data = await getAllReports(filters)

      // Save results to state
      setReports(data.reports)
      setTotal(data.total)
      setTotalPages(data.totalPages)

    } catch (err) {

      alert.error(
        err.message || "Failed to load reports.",
        "Error"
      )

    } finally {

      // Stop loading whether success or failure
      setLoading(false)

    }

  }, [page, activeType, activeCategory, searchText, location])

  // ── Run fetch when filters change ─────────────────────────────────────
  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // ── Reset to page 1 when filters change ──────────────────────────────
  useEffect(() => {
    setPage(1)
  }, [activeType, activeCategory])

  // ── Format date to relative time ──────────────────────────────────────
  const formatTime = (dateStr) => {
    if (!dateStr) return ""
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
    return `${days} day${days !== 1 ? "s" : ""} ago`
  }

  return (

    <div className="browse-page">

      {/* HEADER */}
      <header className="navbar">

        <div className="logo-area">
          <div className="logo-box"><FiShield /></div>
          <h2>Lost & Found NG</h2>
        </div>

        <nav className={`nav-links ${mobileMenu ? "active-nav" : ""}`}>
          <Link to="/" onClick={() => setMobileMenu(false)}>Home</Link>
          <Link to="/browse" onClick={() => setMobileMenu(false)}>Browse</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenu(false)}>How It Works</Link>
          <Link to="/success-stories" onClick={() => setMobileMenu(false)}>Stories</Link>
          <Link to="/support" onClick={() => setMobileMenu(false)}>Support</Link>
        </nav>

        <div className="nav-buttons">
          <button className="login-btn" onClick={() => navigate("/signin")}>Login</button>
          <button className="signup-btn" onClick={() => navigate("/signup-verify")}>Sign Up</button>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <FiX /> : <FiMenu />}
        </button>

      </header>

      {mobileMenu && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenu(false)} />
      )}

      {/* HERO */}
      <section className="browse-hero">
        <div className="browse-hero-content">
          <div className="browse-pill">Browse Community Reports</div>
          <h1>Search Lost & <span>Found Reports</span></h1>
          <p>Explore verified lost and found reports from across Nigeria.</p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="browse-search-section">
        <div className="browse-search-card">

          <div className="browse-search-input">
            <FiSearch />
            <input
              type="text"
              placeholder="Search for item..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="browse-search-input">
            <FiMapPin />
            <input
              type="text"
              placeholder="Location e.g. Lagos"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button
            className="browse-search-btn"
            onClick={() => { setPage(1); fetchReports() }}
          >
            Search
          </button>

        </div>
      </section>

      {/* FILTERS */}
      <section className="browse-filter-section">

        <div className="browse-filter-left">

          {["all", "lost", "found"].map((type) => (
            <button
              key={type}
              className={activeType === type ? "filter-pill active-filter-pill" : "filter-pill"}
              onClick={() => setActiveType(type)}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          {["phone", "wallet", "documents", "laptop", "keys", "bag"].map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? "filter-pill active-filter-pill" : "filter-pill"}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}

          <button
            className="filter-pill"
            onClick={() => { setActiveCategory("all"); setActiveType("all") }}
          >
            Reset
          </button>

        </div>

        <div className="browse-filter-right">
          <div className="view-toggle">
            <button className={gridView ? "active-view" : ""} onClick={() => setGridView(true)}>
              <FiGrid />
            </button>
            <button className={!gridView ? "active-view" : ""} onClick={() => setGridView(false)}>
              <FiList />
            </button>
          </div>
        </div>

      </section>

      {/* RESULTS */}
      <section className="browse-results">

        <div className="results-top">
          <h2>{loading ? "Loading..." : `${total} Reports Found`}</h2>
          <button className="advanced-filter-btn"><FiFilter /> Advanced Filters</button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
            Loading reports...
          </div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
            <h3>No reports found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Reports grid */}
        {!loading && reports.length > 0 && (
          <div className={gridView ? "reports-grid" : "reports-list"}>

            {reports.map((report) => (

              <div className="browse-report-card" key={report._id}>

                <div className="browse-report-image">

                  {/* Show first image or placeholder */}
                  {report.images && report.images.length > 0 ? (
                    <img src={report.images[0]} alt={report.title} />
                  ) : (
                    <div className="report-img-placeholder">No Image</div>
                  )}

                  <span className={report.type === "lost" ? "lost-tag" : "found-tag"}>
                    {report.type}
                  </span>

                  {report.reward && (
                    <span className="reward-tag">{report.reward}</span>
                  )}

                </div>

                <div className="browse-report-content">

                  <div className="report-category">{report.category}</div>

                  <h3>{report.title}</h3>

                  <p className="report-description">{report.description}</p>

                  <div className="report-meta-row">

                    <div className="report-meta">
                      <FiClock />
                      <span>{formatTime(report.createdAt)}</span>
                    </div>

                    <div className="report-meta">
                      <FiMapPin />
                      <span>{report.location}</span>
                    </div>

                  </div>

                  <div className="report-footer">

                    {report.userId?.verified && (
                      <div className="verified-badge">
                        <FiCheckCircle /> Verified
                      </div>
                    )}

                    <button
                      className="details-btn"
                      onClick={() => navigate(`/reports/${report._id}`)}
                    >
                      View Details <FiArrowRight />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "32px" }}>

            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                border: "1px solid #e5e7eb", background: page === 1 ? "#f9fafb" : "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600,
              }}
            >
              Previous
            </button>

            <span style={{ padding: "8px 16px", fontWeight: 600, color: "#374151" }}>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                padding: "8px 20px", borderRadius: "10px",
                border: "1px solid #e5e7eb", background: page === totalPages ? "#f9fafb" : "#fff",
                cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 600,
              }}
            >
              Next
            </button>

          </div>
        )}

      </section>

      {/* CTA */}
      <section className="browse-cta">
        <div className="browse-cta-box">
          <FiHeart className="browse-heart" />
          <h2>Lost Something Important?</h2>
          <p>Create a report and let the community help you recover your item.</p>
          <div className="browse-cta-buttons">
            <button onClick={() => navigate("/create-report")}>Create Report</button>
            <button onClick={() => navigate("/signup-verify")}>Join Community</button>
          </div>
        </div>
      </section>

      <Footer />

    </div>

  )

}

export default BrowseReports