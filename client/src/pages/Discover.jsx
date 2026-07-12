import { useState, useEffect, useCallback } from "react"
import {
  FiSearch, FiMapPin, FiClock, FiChevronRight,
  FiFilter, FiGrid, FiList, FiHeart, FiBookmark, FiBox,
} from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import MainLayout from "../layouts/MainLayout"
import { getAllReports } from "../services/reportService"
import * as alert from "../utils/alert"
import "../styles/discover.css"

function Discover() {

  const navigate = useNavigate()

  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Items")
  const [viewType, setViewType] = useState("grid")
  const [savedItems, setSavedItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const filters = { page, limit: 12 }
      if (searchTerm.trim()) filters.search = searchTerm.trim()
      if (location.trim()) filters.location = location.trim()
      if (activeFilter === "Lost") filters.type = "lost"
      if (activeFilter === "Found") filters.type = "found"
      if (activeFilter === "Electronics") filters.category = "electronics"

      const data = await getAllReports(filters)
      setReports(data.reports || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      alert.error(err.message || "Failed to load reports.", "Error")
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, location, activeFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useEffect(() => {
    setPage(1)
  }, [activeFilter])

  const formatTime = (dateStr) => {
    if (!dateStr) return ""
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const toggleSave = (id) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const smartMatches = reports.filter((r) => (r.confidenceScore || 0) >= 80).slice(0, 3)

  const FILTERS = ["All Items", "Nearby", "High Reward", "Verified Only", "Electronics", "Lost", "Found"]

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="discover-body">

          <main className="discover-main">

            {/* HERO */}
            <div className="discover-hero">
              <div>
                <h1>Discover Reports</h1>
                <p>Find what matters. Browse verified lost and found listings across Nigeria.</p>
              </div>
              <button className="view-btn" onClick={() => setViewType(viewType === "grid" ? "list" : "grid")}>
                {viewType === "grid" ? <><FiList /> List View</> : <><FiGrid /> Grid View</>}
              </button>
            </div>

            {/* SEARCH */}
            <div className="big-search-box">
              <div className="search-input-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="search-input-box">
                <FiMapPin />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button className="big-search-btn" onClick={() => { setPage(1); fetchReports() }}>
                <FiSearch /> Search
              </button>
            </div>

            {/* RESULTS */}
            <div className="results-row">
              <p>Showing <strong>{total}</strong> result{total !== 1 ? "s" : ""} in Nigeria</p>
              <span>Sort by: Latest</span>
            </div>

            {/* FILTERS */}
            <div className="filter-row">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  className={`filter-pill ${activeFilter === filter ? "active-pill" : ""}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === "All Items" && <FiFilter />}
                  {filter}
                </button>
              ))}
            </div>

            {/* LOADING */}
            {loading && (
              <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                Loading reports...
              </div>
            )}

            {/* EMPTY */}
            {!loading && reports.length === 0 && (
              <div className="discover-empty">
                <FiBox size={42} />
                <h3>No reports found</h3>
                <p>Try adjusting your search terms or filters.</p>
              </div>
            )}

            {/* GRID */}
            {!loading && reports.length > 0 && (
              <div className={`discover-grid ${viewType === "list" ? "list-view" : ""}`}>
                {reports.map((report) => (
                  <div key={report._id} className="discover-card">

                    <div className="discover-image">
                      {report.images?.[0]
                        ? <img src={report.images[0]} alt={report.title} />
                        : <div className="discover-img-placeholder"><FiBox size={32} /></div>
                      }
                      <div className="card-badges">
                        <span className={report.type === "lost" ? "lost-badge" : "found-badge"}>
                          {report.type?.toUpperCase()}
                        </span>
                        {report.reward && report.reward !== "₦0" && (
                          <span className="reward-badge">{report.reward} Reward</span>
                        )}
                      </div>
                      {report.confidenceScore > 0 && (
                        <div className="match-badge">{report.confidenceScore}% Match</div>
                      )}
                      <button
                        className={`save-btn ${savedItems.includes(report._id) ? "saved" : ""}`}
                        onClick={() => toggleSave(report._id)}
                      >
                        {savedItems.includes(report._id) ? <FiHeart /> : <FiBookmark />}
                      </button>
                    </div>

                    <div className="discover-card-content">
                      <div className="card-title-row">
                        <h3>{report.title}</h3>
                        <span className="card-category">{report.category}</span>
                      </div>
                      <div className="discover-meta">
                        <FiMapPin /><span>{report.location}</span>
                      </div>
                      <div className="discover-meta">
                        <FiClock /><span>{formatTime(report.createdAt)}</span>
                      </div>
                      <div className="card-footer">
                        <div className="mini-avatars">
                          {report.userId?.verified && (
                            <span className="verified-dot">✓ Verified</span>
                          )}
                        </div>
                        <button
                          className="card-link-btn"
                          onClick={() => navigate(`/reports/${report._id}`)}
                        >
                          Details <FiChevronRight />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "32px" }}>
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  style={{ padding: "8px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", background: page === 1 ? "#f9fafb" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600 }}
                >
                  Previous
                </button>
                <span style={{ padding: "8px 16px", fontWeight: 600, color: "#374151" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  style={{ padding: "8px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", background: page === totalPages ? "#f9fafb" : "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 600 }}
                >
                  Next
                </button>
              </div>
            )}

          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="discover-right">

            <div className="smart-card">
              <h3>Smart Matches</h3>
              {smartMatches.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9ca3af" }}>
                  No high-confidence matches yet. Create more reports.
                </p>
              ) : (
                smartMatches.map((item) => (
                  <div key={item._id} className="match-item">
                    <h4>{item.title}</h4>
                    <p>{item.location}</p>
                    <button onClick={() => navigate(`/reports/${item._id}`)}>
                      Check Match
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="report-another">
              <div className="plus-circle">+</div>
              <h3>Report another item</h3>
              <p>Our AI works better with more reports.</p>
              <button onClick={() => navigate("/create-report")}>Report Now</button>
            </div>

          </aside>

        </div>
      </DashboardLayout>
    </MainLayout>
  )
}

export default Discover