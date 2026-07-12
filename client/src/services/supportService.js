import api from "./api"

// ── SEND SUPPORT MESSAGE ────────────────────────────────────────────────
// Public endpoint — no auth required
export const sendSupportMessage = async ({ name, email, subject, message }) => {
  const res = await api.post("/support/contact", { name, email, subject, message })
  return res.data
}
