import {
  FiSearch, FiMapPin, FiCalendar, FiEdit2, FiShare2,
  FiXCircle, FiSliders, FiPlus, FiDownload, FiClock,
  FiCheckCircle, FiTrendingUp, FiBox, FiEye, FiCopy,
  FiX, FiLock,
} from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import MainLayout from "../layouts/MainLayout"
import {
  getMyReports,
  updateReport,
  deleteReport,
  updateReportStatus,
} from "../services/reportService"
import * as alert from "../utils/alert"
import Swal from "sweetalert2"
import "../styles/reports.css"

function Reports() {

  const navigate = useNavigate()
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"))

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [selectedReport, setSelectedReport] = useState(null)
  const [editingReport, setEditingReport] = useState(null)

  useEffect(() => {
    if (!loggedInUser) { navigate("/signin"); return }
    const fetchReports = async () => {
      try {
        const data = await getMyReports({ limit: 50 })
        setReports(data.reports || [])
      } catch (err) {
        alert.error(err.message || "Failed to load reports.", "Error")
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "ALL" || r.type === typeFilter
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })

  const handleDelete = async (report) => {
    const confirmed = await alert.confirm(
      "Delete this report permanently? This cannot be undone.",
      "Delete Report"
    )
    if (!confirmed) return
    alert.loading("Deleting report...")
    try {
      await deleteReport(report._id)
      Swal.close()
      setReports((prev) => prev.filter((r) => String(r._id) !== String(report._id)))
      if (String(selectedReport?._id) === String(report._id)) setSelectedReport(null)
      alert.toast("Report deleted.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to delete report.", "Error")
    }
  }

  const handleShare = async (report) => {
    const text = `${report.title}\n${report.location}\nReward: ${report.reward}`
    try {
      if (navigator.share) await navigator.share({ title: report.title, text })
      else { await navigator.clipboard.writeText(text); alert.toast("Copied to clipboard", "success") }
    } catch (err) {
      console.log(err)
    }
  }

  const handleEdit = (report) => {
    setEditingReport({ ...report })
  }

  const handleSaveEdit = async () => {
    if (!editingReport.title?.trim()) {
      alert.error("Title cannot be empty.", "Validation Error")
      return
    }
    alert.loading("Saving changes...")
    try {
      const formData = new FormData()
      formData.append("title", editingReport.title)
      formData.append("description", editingReport.description || "")
      formData.append("location", editingReport.location || "")
      formData.append("reward", editingReport.reward || "")
      formData.append("category", editingReport.category || "")

      const data = await updateReport(editingReport._id, formData)
      Swal.close()
      setReports((prev) =>
        prev.map((r) =>
          String(r._id) === String(editingReport._id) ? data.report : r
        )
      )
      setEditingReport(null)
      alert.toast("Report updated.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to update report.", "Error")
    }
  }

  const handleStatusChange = async (report, newStatus) => {
    alert.loading("Updating status...")
    try {
      const data = await updateReportStatus(report._id, newStatus)
      Swal.close()
      setReports((prev) =>
        prev.map((r) =>
          String(r._id) === String(report._id) ? data.report : r
        )
      )
      alert.toast(`Status updated to ${newStatus}.`, "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to update status.", "Error")
    }
  }

  const handleExportCSV = () => {
    const headers = ["Title", "Category", "Location", "Type", "Status", "Reward", "Date"]
    const rows = reports.map((r) => [
      `"${r.title}"`, r.category, `"${r.location}"`,
      r.type, r.status, r.reward || "₦0",
      new Date(r.createdAt).toLocaleDateString("en-NG"),
    ])
    const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csv))
    link.setAttribute("download", "my-reports.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = {
    total: reports.length,
    matched: reports.filter((r) => r.status === "matched").length,
    lost: reports.filter((r) => r.type === "lost").length,
    found: reports.filter((r) => r.type === "found").length,
  }

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="reports-page">

          {/* TOP */}
          <div className="reports-top">
            <div>
              <h1>My Reports</h1>
              <p>Manage and track all your lost &amp; found activities.</p>
            </div>
            <div className="top-buttons">
              <button className="export-btn" onClick={handleExportCSV}>
                <FiDownload /> Export CSV
              </button>
              <button className="new-report-btn" onClick={() => navigate("/create-report")}>
                <FiPlus /> New Report
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="reports-stats">
            <div className="stat-card">
              <div className="stat-icon blue"><FiClock /></div>
              <div><span>Total Reports</span><h2>{stats.total}</h2></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FiCheckCircle /></div>
              <div><span>Matched</span><h2>{stats.matched}</h2></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><FiTrendingUp /></div>
              <div><span>Lost Reports</span><h2>{stats.lost}</h2></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><FiBox /></div>
              <div><span>Found Reports</span><h2>{stats.found}</h2></div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="reports-filter-bar">
            <div className="reports-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="phone">Phone</option>
              <option value="wallet">Wallet</option>
              <option value="laptop">Laptop</option>
              <option value="documents">Documents</option>
              <option value="keys">Keys</option>
              <option value="bag">Bag</option>
              <option value="other">Other</option>
            </select>
            <button className="filter-icon-btn"><FiSliders /></button>
          </div>

          {/* LOADING */}
          {loading && (
            <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
              Loading your reports...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredReports.length === 0 && (
            <div className="reports-empty">
              <div className="empty-icon-box"><FiBox size={40} /></div>
              <h3>{reports.length === 0 ? "No reports yet" : "No reports match your filters"}</h3>
              <p>
                {reports.length === 0
                  ? "Create your first report to get started."
                  : "Try adjusting your search or filters."}
              </p>
              {reports.length === 0 && (
                <button className="new-report-btn" onClick={() => navigate("/create-report")}>
                  <FiPlus /> Create Report
                </button>
              )}
            </div>
          )}

          {/* GRID */}
          {!loading && (
            <div className="reports-grid">
              {filteredReports.map((report) => (
                <div className="report-card" key={report._id}>

                  <div className="report-image">
                    {report.images?.[0]
                      ? <img src={report.images[0]} alt={report.title} className="report-preview-image" />
                      : <div className="report-img-placeholder"><FiBox size={32} /></div>
                    }
                    <span className={report.type === "lost" ? "lost-badge" : "found-badge"}>
                      {report.type === "lost" ? "LOST" : "FOUND"}
                    </span>
                    {report.status === "matched" && (
                      <span className="matched-badge">✓ MATCHED</span>
                    )}
                  </div>

                  <div className="report-content">

                    <span className="category-pill">{report.category}</span>
                    <h3>{report.title}</h3>
                    <div className="report-meta"><FiMapPin /><span>{report.location}</span></div>
                    <div className="report-meta">
                      <FiCalendar />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString("en-NG", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* STATUS */}
                    <div style={{ marginTop: "10px" }}>
                      <small style={{ color: "#9ca3af", fontSize: "11px" }}>STATUS</small>
                      <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className={`status-pill status-pill--${report.status}`}>
                          {report.status === "open" && "Open"}
                          {report.status === "matched" && "Matched"}
                          {report.status === "resolved" && "Resolved"}
                        </span>
                        {report.status === "matched" && (
                          <button
                            className="mark-resolved-btn"
                            onClick={() => handleStatusChange(report, "resolved")}
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="card-bottom">
                      <div>
                        <small>REWARD</small>
                        <h4>{report.reward || "₦0"}</h4>
                      </div>
                      <div className="card-actions">
                        <button title="View" onClick={() => setSelectedReport(report)}>
                          <FiEye />
                        </button>
                        <button title="Edit" onClick={() => handleEdit(report)}>
                          <FiEdit2 />
                        </button>
                        <button title="Share" onClick={() => handleShare(report)}>
                          <FiShare2 />
                        </button>
                        <button
                          title="Copy title"
                          onClick={() => { navigator.clipboard.writeText(report.title); alert.toast("Copied!", "success") }}
                        >
                          <FiCopy />
                        </button>
                        <button title="Delete" onClick={() => handleDelete(report)}>
                          <FiXCircle />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* VIEW MODAL */}
        {selectedReport && (
          <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>

              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>
                <FiX />
              </button>

              {selectedReport.images?.[0] && (
                <img src={selectedReport.images[0]} alt={selectedReport.title} className="modal-image" />
              )}

              <div className="modal-body">
                <div className="modal-badges">
                  <span className={selectedReport.type === "lost" ? "lost-badge" : "found-badge"}>
                    {selectedReport.type?.toUpperCase()}
                  </span>
                  <span className="category-pill">{selectedReport.category}</span>
                  {selectedReport.status === "matched" && (
                    <span className="matched-badge">✓ MATCHED</span>
                  )}
                </div>
                <h2>{selectedReport.title}</h2>
                <p className="modal-description">{selectedReport.description}</p>
                <div className="modal-rows">
                  <div className="modal-row">
                    <FiMapPin />
                    <div><small>Location</small><p>{selectedReport.location}</p></div>
                  </div>
                  <div className="modal-row">
                    <FiCalendar />
                    <div>
                      <small>Date</small>
                      <p>
                        {new Date(selectedReport.createdAt).toLocaleDateString("en-NG", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-reward">
                  <small>REWARD</small>
                  <h3>{selectedReport.reward || "₦0"}</h3>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingReport && (
          <div className="report-modal-overlay" onClick={() => setEditingReport(null)}>
            <div className="report-modal edit-modal" onClick={(e) => e.stopPropagation()}>

              <button className="modal-close-btn" onClick={() => setEditingReport(null)}>
                <FiX />
              </button>

              <h2 className="edit-modal-title">Edit Report</h2>

              <div className="edit-modal-form">

                {[
                  { label: "Title", key: "title", type: "input" },
                  { label: "Location", key: "location", type: "input" },
                  { label: "Reward", key: "reward", type: "input" },
                  { label: "Description", key: "description", type: "textarea" },
                ].map((field) => (
                  <div key={field.key} className="report-form-group">
                    <label>{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={editingReport[field.key] || ""}
                        onChange={(e) => setEditingReport({ ...editingReport, [field.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        type="text"
                        value={editingReport[field.key] || ""}
                        onChange={(e) => setEditingReport({ ...editingReport, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}

                <div className="report-form-group">
                  <label>Category</label>
                  <select
                    value={editingReport.category}
                    onChange={(e) => setEditingReport({ ...editingReport, category: e.target.value })}
                  >
                    {["phone", "wallet", "laptop", "documents", "keys", "bag", "other"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="edit-modal-actions">
                <button className="back-step-btn" onClick={() => setEditingReport(null)}>Cancel</button>
                <button className="continue-btn" onClick={handleSaveEdit}>Save Changes</button>
              </div>

            </div>
          </div>
        )}

      </DashboardLayout>
    </MainLayout>
  )
}

export default Reports