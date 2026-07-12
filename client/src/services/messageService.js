// Import the base axios instance
import api from "./api"

// ── START CONVERSATION ────────────────────────────────────────────────
// Creates a new conversation from an accepted match
// matchId is required
// Returns: { message, conversation }

export const startConversation = async (matchId) => {

  // Backend route is POST /api/messages/conversations
  const res = await api.post("/messages/conversations", {
    matchId,
  })

  return res.data
}

// ── GET MY CONVERSATIONS ──────────────────────────────────────────────
// Gets all conversations for the logged-in user
// Returns: { total, conversations }

export const getConversations = async () => {

  // Backend route is GET /api/messages/conversations
  const res = await api.get("/messages/conversations")

  return res.data
}

// ── SEND MESSAGE ──────────────────────────────────────────────────────
// Sends a message in a conversation
// body can be text or FormData with attachments
// Returns: { message, data }

export const sendMessage = async (conversationId, body) => {

  // Check if body is FormData (has attachments)
  const isFormData = body instanceof FormData

  const res = await api.post(
    `/messages/conversations/${conversationId}/messages`,
    body,
    {
      // For FormData (attachments), explicitly clear Content-Type so
      // axios drops the JSON default and the browser sets its own
      // multipart boundary. Plain text messages keep the JSON default.
      headers: isFormData
        ? { "Content-Type": undefined }
        : {},
    }
  )

  return res.data
}

// ── GET MESSAGES ──────────────────────────────────────────────────────
// Gets all messages in a conversation
// Returns: { total, page, totalPages, messages }

export const getMessages = async (conversationId, page = 1) => {

  const res = await api.get(
    `/messages/conversations/${conversationId}/messages`,
    { params: { page, limit: 30 } }
  )

  return res.data
}

// ── EDIT MESSAGE ──────────────────────────────────────────────────────
// Edits a message's text
// Returns: { message, data }

export const editMessage = async (messageId, text) => {

  const res = await api.patch(`/messages/messages/${messageId}`, {
    text,
  })

  return res.data
}

// ── DELETE MESSAGE ────────────────────────────────────────────────────
// Soft deletes a message
// Returns: { message }

export const deleteMessage = async (messageId) => {

  const res = await api.delete(`/messages/messages/${messageId}`)

  return res.data
}

// ── REQUEST PRIVACY REVEAL ────────────────────────────────────────────
// Requests to reveal contact info in a conversation
// Returns: { message, conversation }

export const requestPrivacyReveal = async (conversationId) => {

  const res = await api.post(
    `/messages/conversations/${conversationId}/request-reveal`
  )

  return res.data
}

// ── ACCEPT PRIVACY REVEAL ─────────────────────────────────────────────
// Accepts the other user's privacy reveal request
// Returns: { message, conversation }

export const acceptPrivacyReveal = async (conversationId) => {

  const res = await api.post(
    `/messages/conversations/${conversationId}/accept-reveal`
  )

  return res.data
}