// Import the base axios instance
import api from "./api"

// ── GET NOTIFICATIONS ─────────────────────────────────────────────────
// Gets all notifications for the logged-in user
// Returns: { total, unreadCount, page, totalPages, notifications }

export const getNotifications = async (page = 1) => {

    const res = await api.get("/notifications", {
        params: { page, limit: 20 },
    })

    return res.data
}

// ── MARK ONE AS READ ──────────────────────────────────────────────────
// Marks a single notification as read
// Returns: { message, notification }

export const markAsRead = async (notificationId) => {

    const res = await api.patch(`/notifications/${notificationId}`)

    return res.data
}

// ── MARK ALL AS READ ──────────────────────────────────────────────────
// Marks all notifications as read at once
// Returns: { message }

export const markAllAsRead = async () => {

    const res = await api.patch("/notifications/mark-all-read")

    return res.data
}

// ── DELETE NOTIFICATION ───────────────────────────────────────────────
// Permanently deletes one notification
// Returns: { message }

export const deleteNotification = async (notificationId) => {

    const res = await api.delete(`/notifications/${notificationId}`)

    return res.data
}