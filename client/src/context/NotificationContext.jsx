import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useAuth } from "./AuthContext"

const NotificationContext = createContext(null)

export const NOTIF_META = {
  match: { icon: "🔍", color: "#1B3FA0", label: "Match Found" },
  message: { icon: "💬", color: "#16a34a", label: "New Message" },
  report_update: { icon: "📋", color: "#F07C1E", label: "Report Update" },
  fraud_alert: { icon: "⚠️", color: "#dc2626", label: "Fraud Alert" },
  system: { icon: "🔔", color: "#6b7280", label: "System" },
}

export function NotificationProvider({ children }) {

  const { isLoggedIn } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const { getNotifications } = await import("../services/notificationService")
      const data = await getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message, err)
    }
  }, [isLoggedIn])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        String(n._id) === String(id)
          ? { ...n, isRead: true }
          : n
      )
    )
    setUnreadCount((prev) => Math.max(prev - 1, 0))
    try {
      const { markAsRead } = await import("../services/notificationService")
      await markAsRead(id)
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    )
    setUnreadCount(0)
    try {
      const { markAllAsRead } = await import("../services/notificationService")
      await markAllAsRead()
    } catch (err) {
      console.error("Failed to mark all as read:", err.message)
    }
  }, [])

  const removeNotification = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.filter((n) => String(n._id) !== String(id))
    )
    try {
      const { deleteNotification } = await import("../services/notificationService")
      await deleteNotification(id)
    } catch (err) {
      console.error("Failed to delete notification:", err.message)
    }
  }, [])

  // Alias kept for components that call it "clearNotification"
  const clearNotification = removeNotification

  const clearAll = useCallback(async () => {
    const ids = notifications.map((n) => n._id)
    setNotifications([])
    setUnreadCount(0)
    try {
      const { deleteNotification } = await import("../services/notificationService")
      await Promise.all(ids.map((id) => deleteNotification(id)))
    } catch (err) {
      console.error("Failed to clear all notifications:", err.message)
    }
  }, [notifications])

  const addNotification = useCallback((type, title, body) => {
    const notif = {
      _id: Date.now().toString(),
      type,
      title,
      body,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [notif, ...prev].slice(0, 100))
    setUnreadCount((prev) => prev + 1)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
      removeNotification,
      clearNotification,
      clearAll,
      fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider")
  return ctx
}

export default NotificationContext