// Redirect legacy /login → /signin
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  useEffect(() => { navigate("/signin", { replace: true }) }, [])
  return null
}
