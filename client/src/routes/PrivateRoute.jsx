import { Navigate, useLocation } from "react-router-dom"

export default function PrivateRoute({ children }) {
  const location = useLocation()
  const token = localStorage.getItem("token")
  const user  = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser")) } catch { return null } })()
  if (!token && !user) return <Navigate to="/signin" replace state={{ from: location }} />
  return children
}
