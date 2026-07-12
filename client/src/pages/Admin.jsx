// Redirect /admin → /admin-dashboard
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Admin() {
  const navigate = useNavigate()
  useEffect(() => { navigate("/admin-dashboard", { replace: true }) }, [])
  return null
}
