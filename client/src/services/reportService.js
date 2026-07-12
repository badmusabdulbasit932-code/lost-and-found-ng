// Import the base axios instance
import api from "./api"

// ── GET ALL REPORTS ───────────────────────────────────────────────────────
// Fetches all open reports with optional filters
// Used on the Browse page
// Returns: { total, page, totalPages, reports }

export const getAllReports = async (filters = {}) => {

  // Build query string from filters object
  // Example: { type: "lost", category: "phone" }
  // Becomes: ?type=lost&category=phone
  const params = new URLSearchParams(filters).toString()

  const res = await api.get(`/reports?${params}`)

  return res.data
}

// ── GET SINGLE REPORT ─────────────────────────────────────────────────────
// Fetches one report by its ID
// Used on the Report Details page
// Returns: { report }

export const getReport = async (id) => {

  const res = await api.get(`/reports/${id}`)

  return res.data
}

// ── GET MY REPORTS ────────────────────────────────────────────────────────
// Fetches only the logged-in user's reports
// Used on the Dashboard and My Reports page
// Returns: { total, page, totalPages, reports }

export const getMyReports = async (filters = {}) => {

  // Build query string from filters
  const params = new URLSearchParams(filters).toString()

  const res = await api.get(`/reports/my-reports?${params}`)

  return res.data
}

// ── CREATE REPORT ─────────────────────────────────────────────────────────
// Creates a new lost or found report with images
// Used on the Create Report page
// formData must be a FormData object because it contains images
// Returns: { message, report }

export const createReport = async (formData) => {

  // The axios instance default is "Content-Type: application/json".
  // For a FormData body we must remove that so the browser can set its
  // own "multipart/form-data; boundary=..." header. Explicitly setting
  // Content-Type to undefined here forces axios to drop the instance
  // default instead of silently sending the request as JSON.
  const res = await api.post("/reports", formData, {
    headers: { "Content-Type": undefined },
  })

  return res.data
}

// ── UPDATE REPORT ─────────────────────────────────────────────────────────
// Updates an existing report's details
// Used on the Edit Report page
// Returns: { message, report }

export const updateReport = async (id, formData) => {

  // See note in createReport — explicitly clear Content-Type
  const res = await api.put(`/reports/${id}`, formData, {
    headers: { "Content-Type": undefined },
  })

  return res.data
}

// ── UPDATE REPORT STATUS ──────────────────────────────────────────────────
// Changes the status of a report
// status can be: "open", "matched", "resolved"
// Used when user marks their item as recovered
// Returns: { message, report }

export const updateReportStatus = async (id, status) => {

  const res = await api.patch(`/reports/${id}/update-status`, {
    status,
  })

  return res.data
}

// ── DELETE REPORT ─────────────────────────────────────────────────────────
// Soft deletes a report
// Used on My Reports page
// Returns: { message }

export const deleteReport = async (id) => {

  const res = await api.delete(`/reports/${id}`)

  return res.data
}