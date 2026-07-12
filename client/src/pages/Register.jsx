// Redirect legacy /register → /signup-verify
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const navigate = useNavigate()
  useEffect(() => { navigate("/signup-verify", { replace: true }) }, [])
  return null
}
