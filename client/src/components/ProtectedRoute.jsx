import { Navigate, useLocation } from "react-router-dom"

/* ════════════════════════════════════════════════════════════════════════
   PROTECTED ROUTE
   Checks localStorage directly so it works whether the user logged in
   via AuthContext or via the legacy localStorage-only SignIn/SignupVerify.
   When backend JWT is live, swap the check to use useAuth().isLoggedIn.
════════════════════════════════════════════════════════════════════════ */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation()

  // Accept EITHER a token (future JWT) OR a loggedInUser (current localStorage auth)
  const token = localStorage.getItem("token")
  const user  = (() => {
    try { return JSON.parse(localStorage.getItem("loggedInUser")) } catch { return null }
  })()

  const isLoggedIn = !!(token || user)

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
