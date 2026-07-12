// Import the base axios instance
import api from "./api"

// ── GET MY MATCHES ────────────────────────────────────────────────────
// Gets all matches where the logged-in user owns either report
// Returns: { total, matches }

export const getMyMatches = async () => {

  // Correct backend route is /api/matches
  const res = await api.get("/matches")

  return res.data
}

// ── GET SINGLE MATCH ──────────────────────────────────────────────────
// Gets one match by ID with full report details
// Returns: { match }

export const getMatchById = async (matchId) => {

  const res = await api.get(`/matches/${matchId}`)

  return res.data
}

// ── ACCEPT MATCH ──────────────────────────────────────────────────────
// Accepts a match — sets both reports to "matched"
// Returns: { message, match }

export const acceptMatch = async (matchId) => {

  const res = await api.patch(`/matches/${matchId}/accept`)

  return res.data
}

// ── REJECT MATCH ──────────────────────────────────────────────────────
// Rejects a match — reports stay "open"
// Returns: { message, match }

export const rejectMatch = async (matchId) => {

  const res = await api.patch(`/matches/${matchId}/reject`)

  return res.data
}