import { Navigate, useLocation } from "react-router-dom"

export default function AdminRoute({ children }) {
  const location = useLocation()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("loggedInUser")) } catch { return null }
  })()
  const token = localStorage.getItem("token")
  if (!user && !token) return <Navigate to="/signin" replace state={{ from: location }} />
  if (user?.role !== "admin" && user?.role !== "moderator") return <Navigate to="/dashboard" replace />
  return children
}
