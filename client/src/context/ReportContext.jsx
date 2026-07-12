import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"

/* ─── context ──────────────────────────────────────────────────────────── */
const ReportContext = createContext(null)

/* ─── localStorage helpers ─────────────────────────────────────────────── */
const LS = {
  get: (k, fb = []) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } },
}

/* ════════════════════════════════════════════════════════════════════════
   REPORT PROVIDER

   Manages the in-memory + localStorage copy of reports while your
   backend API is being built. Every method is already shaped to be
   swapped for a real Axios call — just replace the localStorage logic
   with `await reportService.xyz()` and update state from the response.
════════════════════════════════════════════════════════════════════════ */
export function ReportProvider({ children }) {
  const { user, isLoggedIn } = useAuth()

  const [reports,  setReports]  = useState(() => LS.get("reports", []))
  const [loading]  = useState(false)
  const [error]    = useState(null)

  /* persist every time reports change */
  useEffect(() => { LS.set("reports", reports) }, [reports])

  /* ── derived: only the logged-in user's reports ── */
  const myReports = isLoggedIn
    ? reports.filter(r => r.userId === (user?.id || user?.email) || r.userEmail === user?.email)
    : []

  /* ── CREATE ─────────────────────────────────────────────────────────────
     data: { type, title, category, description, brand?, model?, color?,
             location, state, dateOccurred, reward?, images?[] }
     Swap body for: const res = await reportService.createReport(formData)
                    addReport(res.report)
  ─────────────────────────────────────────────────────────────────────── */
  const createReport = useCallback((data) => {
    const newReport = {
      ...data,
      id:         Date.now().toString(),
      userId:     user?.id    || user?.email,
      userEmail:  user?.email || "",
      userName:   user?.name  || user?.fullName || "",
      status:     "active",
      verified:   false,
      flagCount:  0,
      viewCount:  0,
      isFeatured: false,
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
    }
    setReports(prev => [newReport, ...prev])
    return newReport
  }, [user])

  /* ── READ ONE ── */
  const getReportById = useCallback((id) => {
    return reports.find(r => r.id === id || r._id === id) || null
  }, [reports])

  /* ── UPDATE ─────────────────────────────────────────────────────────────
     Swap for: await reportService.updateReport(id, data)
  ─────────────────────────────────────────────────────────────────────── */
  const updateReport = useCallback((id, data) => {
    setReports(prev =>
      prev.map(r =>
        (r.id === id || r._id === id)
          ? { ...r, ...data, updatedAt: new Date().toISOString() }
          : r
      )
    )
  }, [])

  /* ── DELETE ─────────────────────────────────────────────────────────────
     Swap for: await reportService.deleteReport(id)
  ─────────────────────────────────────────────────────────────────────── */
  const deleteReport = useCallback((id) => {
    setReports(prev => prev.filter(r => r.id !== id && r._id !== id))
  }, [])

  /* ── RESOLVE ── mark item as recovered ─────────────────────────────────
     Swap for: await reportService.resolveReport(id)
  ─────────────────────────────────────────────────────────────────────── */
  const resolveReport = useCallback((id) => {
    updateReport(id, { status: "closed" })
  }, [updateReport])

  /* ── FLAG ───────────────────────────────────────────────────────────────
     Swap for: await reportService.flagReport(id, { reason, description })
  ─────────────────────────────────────────────────────────────────────── */
  const flagReport = useCallback((id, reason) => {
    setReports(prev =>
      prev.map(r =>
        (r.id === id || r._id === id)
          ? { ...r, flagCount: (r.flagCount || 0) + 1, flagReason: reason, status: r.flagCount >= 2 ? "flagged" : r.status }
          : r
      )
    )
  }, [])

  /* ── SAVED ITEMS ── per-user bookmarks ──────────────────────────────── */
  const savedKey = () => `user_${user?.id || user?.email || "guest"}_saved_items`

  const getSavedIds = useCallback(() => {
    try { return new Set(JSON.parse(localStorage.getItem(savedKey())) || []) } catch { return new Set() }
  }, [user])

  const toggleSave = useCallback((reportId) => {
    const ids = getSavedIds()
    if (ids.has(reportId)) ids.delete(reportId)
    else                   ids.add(reportId)
    localStorage.setItem(savedKey(), JSON.stringify([...ids]))
    return ids.has(reportId)
  }, [getSavedIds])

  const isSaved = useCallback((reportId) => {
    return getSavedIds().has(reportId)
  }, [getSavedIds])

  /* ── SEARCH (local, swap for API) ────────────────────────────────────── */
  const searchReports = useCallback(({
    q = "", type, category, state, city,
    rewardMin = 0, rewardMax = 500000,
    verifiedOnly = false, sort = "newest",
  } = {}) => {
    let result = [...reports]

    if (q)            result = result.filter(r =>
      r.title?.toLowerCase().includes(q.toLowerCase()) ||
      r.description?.toLowerCase().includes(q.toLowerCase()) ||
      r.location?.toLowerCase().includes(q.toLowerCase())
    )
    if (type)         result = result.filter(r => r.type === type)
    if (category)     result = result.filter(r => r.category === category)
    if (state)        result = result.filter(r => r.state?.toLowerCase() === state.toLowerCase())
    if (city)         result = result.filter(r => r.location?.toLowerCase().includes(city.toLowerCase()))
    if (verifiedOnly) result = result.filter(r => r.verified)
    result = result.filter(r => (r.reward || 0) >= rewardMin && (r.reward || 0) <= rewardMax)

    if (sort === "newest")       result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sort === "oldest")  result.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
    else if (sort === "reward")  result.sort((a,b) => (b.reward||0) - (a.reward||0))

    return result
  }, [reports])

  /* ── INCREMENT VIEW COUNT ───────────────────────────────────────────── */
  const incrementView = useCallback((id) => {
    setReports(prev =>
      prev.map(r =>
        (r.id === id || r._id === id) ? { ...r, viewCount: (r.viewCount||0) + 1 } : r
      )
    )
  }, [])

  /* ── LOAD FROM API (call on app init once backend is ready) ─────────── */
  const loadReports = useCallback(async () => {
    /* Uncomment when backend is ready:
    setLoading(true)
    setError(null)
    try {
      const data = await reportService.getReports({ limit: 100 })
      setReports(data.reports)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
    */
  }, [])

  return (
    <ReportContext.Provider value={{
      reports,
      myReports,
      loading,
      error,
      createReport,
      getReportById,
      updateReport,
      deleteReport,
      resolveReport,
      flagReport,
      toggleSave,
      isSaved,
      getSavedIds,
      searchReports,
      incrementView,
      loadReports,
    }}>
      {children}
    </ReportContext.Provider>
  )
}

/* ── hook ──────────────────────────────────────────────────────────────── */
export const useReports = () => {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error("useReports must be used inside <ReportProvider>")
  return ctx
}
