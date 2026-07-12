import {
  FiSearch, FiMapPin, FiClock, FiGrid, FiList,
  FiArrowLeft, FiArrowRight, FiHeart, FiShare2,
  FiSliders, FiShield, FiX, FiAlertCircle, FiRefreshCw,
} from "react-icons/fi"
import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import { getAllReports } from "../services/reportService"
import * as alert from "../utils/alert"
import "../styles/search-results.css"

export default function SearchResults() {

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── State ─────────────────────────────────────────────────────────────
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [viewType, setViewType] = useState("grid")
  const [savedItems, setSavedItems] = useState([])
  const [page, setPage] = useState(1)

  // ── Filters from URL params ────────────────────────────────────────────
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [type, setType] = useState(searchParams.get("type") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")

  // ── Fetch results ──────────────────────────────────────────────────────
  const fetchResults = useCallback(async () => {

    if (!query.trim() && !type && !category && !location) {
      setResults([])
      setTotal(0)
      return
    }

    setLoading(true)
    setError("")

    try {
      const filters = { page, limit: 12 }
      if (query.trim()) filters.search = query.trim()
      if (type) filters.type = type
      if (category) filters.category = category
      if (location.trim()) filters.location = location.trim()

      const data = await getAllReports(filters)
      setResults(data.reports || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message || "Failed to fetch results.")
    } finally {
      setLoading(false)
    }

  }, [query, type, category, location, page])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  // ── Update URL params when filters change ──────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    const params = {}
    if (query.trim()) params.q = query.trim()
    if (type) params.type = type
    if (category) params.category = category
    if (location.trim()) params.location = location.trim()
    setSearchParams(params)
  }

  const clearFilter = (key) => {
    setPage(1)
    if (key === "query") { setQuery(""); searchParams.delete("q") }
    if (key === "type") { setType(""); searchParams.delete("type") }
    if (key === "category") { setCategory(""); searchParams.delete("category") }
    if (key === "location") { setLocation(""); searchParams.delete("location") }
    setSearchParams(searchParams)
  }

  const toggleSave = (id) => {
    setSavedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleShare = async (report) => {
    const url = `${window.location.origin}/reports/${report._id}`
    try {
      if (navigator.share) await navigator.share({ title: report.title, url })
      else {
        await navigator.clipboard.writeText(url)
        alert.toast("Link copied to clipboard!", "success")
      }
    } catch (_) { }
  }

  const formatTime = (iso) => {
    if (!iso) return ""
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    return `${d}d ago`
  }

  const hasActiveFilters = query || type || category || location

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="sr-page">

          {/* ── HEADER ────────────────────────────────────────────────── */}
          <div className="sr-header">
            <div className="sr-header-left">
              <button className="sr-back-btn" onClick={() => navigate(-1)}>
                <FiArrowLeft size={16} /> Back
              </button>
              <div>
                <h1 className="sr-title">Search Results</h1>
                {!loading && (
                  <p className="sr-subtitle">
                    {total > 0
                      ? `${total} result${total !== 1 ? "s" : ""} found${query ? ` for "${query}"` : ""}`
                      : hasActiveFilters
                        ? "No results found"
                        : "Enter a search term to find reports"}
                  </p>
                )}
              </div>
            </div>
            <div className="sr-view-toggle">
              <button
                className={viewType === "grid" ? "active-view" : ""}
                onClick={() => setViewType("grid")}
              >
                <FiGrid />
              </button>
              <button
                className={viewType === "list" ? "active-view" : ""}
                onClick={() => setViewType("list")}
              >
                <FiList />
              </button>
            </div>
          </div>

          {/* ── SEARCH BAR ───────────────────────────────────────────── */}
          <form className="sr-search-bar" onSubmit={handleSearch}>

            <div className="sr-search-input">
              <FiSearch />
              <input
                type="text"
                placeholder="Search for item, category, location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" onClick={() => clearFilter("query")}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            <div className="sr-filters">

              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1) }}
              >
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>

              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              >
                <option value="">All Categories</option>
                <option value="phone">Phone</option>
                <option value="wallet">Wallet</option>
                <option value="laptop">Laptop</option>
                <option value="documents">Documents</option>
                <option value="keys">Keys</option>
                <option value="bag">Bag</option>
                <option value="jewelry">Jewelry</option>
                <option value="clothing">Clothing</option>
                <option value="pet">Pet</option>
                <option value="vehicle">Vehicle</option>
                <option value="other">Other</option>
              </select>

              <div className="sr-location-input">
                <FiMapPin size={14} />
                <input
                  type="text"
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button type="submit" className="sr-search-btn">
                <FiSearch /> Search
              </button>

            </div>

          </form>

          {/* ── ACTIVE FILTERS ───────────────────────────────────────── */}
          {hasActiveFilters && (
            <div className="sr-active-filters">
              {query && (
                <span className="sr-filter-chip">
                  Search: "{query}"
                  <button onClick={() => clearFilter("query")}><FiX size={11} /></button>
                </span>
              )}
              {type && (
                <span className="sr-filter-chip">
                  Type: {type}
                  <button onClick={() => clearFilter("type")}><FiX size={11} /></button>
                </span>
              )}
              {category && (
                <span className="sr-filter-chip">
                  Category: {category}
                  <button onClick={() => clearFilter("category")}><FiX size={11} /></button>
                </span>
              )}
              {location && (
                <span className="sr-filter-chip">
                  Location: {location}
                  <button onClick={() => clearFilter("location")}><FiX size={11} /></button>
                </span>
              )}
              <button
                className="sr-clear-all"
                onClick={() => {
                  setQuery(""); setType(""); setCategory(""); setLocation("")
                  setSearchParams({})
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* ── LOADING ──────────────────────────────────────────────── */}
          {loading && (
            <div className="sr-loading">
              <FiRefreshCw size={28} className="sr-spin" />
              <p>Searching reports...</p>
            </div>
          )}

          {/* ── ERROR ────────────────────────────────────────────────── */}
          {error && !loading && (
            <div className="sr-error">
              <FiAlertCircle size={20} />
              <p>{error}</p>
              <button onClick={fetchResults}>Try again</button>
            </div>
          )}

          {/* ── EMPTY STATE ──────────────────────────────────────────── */}
          {!loading && !error && hasActiveFilters && results.length === 0 && (
            <div className="sr-empty">
              <FiSearch size={48} />
              <h3>No results found</h3>
              <p>
                Try different keywords, remove some filters,
                or browse all reports below.
              </p>
              <button
                className="sr-browse-btn"
                onClick={() => navigate("/browse")}
              >
                Browse All Reports
              </button>
            </div>
          )}

          {/* ── NO SEARCH YET ────────────────────────────────────────── */}
          {!loading && !error && !hasActiveFilters && (
            <div className="sr-empty">
              <FiSearch size={48} />
              <h3>Start searching</h3>
              <p>
                Type a keyword above to search through all lost and found
                reports across Nigeria.
              </p>
            </div>
          )}

          {/* ── RESULTS ──────────────────────────────────────────────── */}
          {!loading && !error && results.length > 0 && (
            <>

              <div className="sr-results-top">
                <p>{total} result{total !== 1 ? "s" : ""}</p>
                <span>Sorted by: Most Recent</span>
              </div>

              <div className={viewType === "grid" ? "sr-grid" : "sr-list"}>
                {results.map((report) => (
                  <div key={report._id} className="sr-card">

                    <div className="sr-card-image">
                      {report.images?.[0]
                        ? <img src={report.images[0]} alt={report.title} />
                        : <div className="sr-img-placeholder"><FiShield size={28} /></div>
                      }
                      <span className={report.type === "lost" ? "sr-lost-tag" : "sr-found-tag"}>
                        {report.type?.toUpperCase()}
                      </span>
                      {report.reward && (
                        <span className="sr-reward-tag">{report.reward}</span>
                      )}
                      <button
                        className={`sr-save-btn ${savedItems.includes(report._id) ? "saved" : ""}`}
                        onClick={() => toggleSave(report._id)}
                      >
                        <FiHeart />
                      </button>
                    </div>

                    <div className="sr-card-body">

                      <span className="sr-category">{report.category}</span>
                      <h3>{report.title}</h3>
                      <p className="sr-description">
                        {report.description?.slice(0, 80)}
                        {report.description?.length > 80 ? "..." : ""}
                      </p>

                      <div className="sr-meta">
                        <span><FiMapPin size={12} /> {report.location}</span>
                        <span><FiClock size={12} /> {formatTime(report.createdAt)}</span>
                      </div>

                      <div className="sr-card-footer">
                        <button
                          className="sr-share-btn"
                          onClick={() => handleShare(report)}
                        >
                          <FiShare2 size={14} />
                        </button>
                        <button
                          className="sr-details-btn"
                          onClick={() => navigate(`/reports/${report._id}`)}
                        >
                          View Details <FiArrowRight size={14} />
                        </button>
                      </div>

                    </div>

                  </div>
                ))}
              </div>

              {/* ── PAGINATION ─────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="sr-pagination">
                  <button
                    className="sr-page-btn"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <FiArrowLeft size={14} /> Previous
                  </button>
                  <span className="sr-page-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="sr-page-btn"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next <FiArrowRight size={14} />
                  </button>
                </div>
              )}

            </>
          )}

        </div>
      </DashboardLayout>
    </MainLayout>
  )
}