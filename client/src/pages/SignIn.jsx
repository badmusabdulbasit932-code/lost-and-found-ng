import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { login } from "../services/authService"
import Swal from "sweetalert2"
import * as alert from "../utils/alert"
import "../styles/signin.css"

function SignIn() {

  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {

    // Prevent page refresh
    e.preventDefault()

    // Validate fields
    let newErrors = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    // Show loading spinner while waiting for backend
    alert.loading("Signing you in...")

    try {

      // Call backend login
      const data = await login({ email, password })

      // Close the loading spinner
      Swal.close()

      // Save to AuthContext
      authLogin({ token: data.token, user: data.user })

      // Show success toast in the corner
      alert.toast("Welcome back! 👋", "success")

      // Small delay so user sees the toast before redirect
      setTimeout(() => {
        navigate(data.user?.role === "admin" ? "/admin-dashboard" : "/dashboard")
      }, 1000)

    } catch (err) {

      // Close the loading spinner
      Swal.close()

      // Show error popup with the backend message
      alert.error(
        err.message || "Login failed. Please try again.",
        "Login Failed"
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="signin-page">

      <div className="signin-container">

        {/* TOP BAR */}

        <div className="signin-top-bar">

          <button
            className="signin-back-btn"
            onClick={() => navigate("/")}
          >
            ← Back Home
          </button>

        </div>

        {/* LOGO */}

        <div className="signin-logo-wrap">

          <div className="signin-logo-box">
            <FiShield />
          </div>

          <div className="signin-logo-text">
            <h1>Lost & Found NG</h1>
            <span>Trusted Recovery Platform</span>
          </div>

        </div>

        {/* TEXT */}

        <div className="signin-text">
          <h1>Sign In to Your Account</h1>
          <p>Helping you recover what matters most across Nigeria.</p>
        </div>

        {/* CARD */}

        <div className="signin-card">

          {/* GENERAL ERROR */}

          {errors.general && (
            <div className="signin-error">
              <div className="signin-error-icon">
                <FiAlertCircle />
              </div>
              <div>
                <h4>Login failed</h4>
                <p>{errors.general}</p>
              </div>
            </div>
          )}

          {/* FORM */}

          <form className="signin-form" onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="signin-input-group">

              <label>Email Address</label>

              <div className={`signin-input ${errors.email ? "error-input" : ""}`}>

                <FiMail />

                <input
                  type="email"
                  placeholder="user@lostfoundng.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: "", general: "" })
                  }}
                />

              </div>

              {errors.email && (
                <p className="input-error-text">{errors.email}</p>
              )}

            </div>

            {/* PASSWORD */}

            <div className="signin-input-group">

              <div className="signin-label-row">
                <label>Password</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>

              <div className={`signin-input ${errors.password ? "error-input" : ""}`}>

                <FiLock />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors({ ...errors, password: "", general: "" })
                  }}
                />

                {showPassword ? (
                  <FiEyeOff
                    className="eye-icon"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FiEye
                    className="eye-icon"
                    onClick={() => setShowPassword(true)}
                  />
                )}

              </div>

              {errors.password && (
                <p className="input-error-text">{errors.password}</p>
              )}

            </div>

            {/* BUTTON */}

            <button
              className="signin-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
              <FiArrowRight />
            </button>

          </form>

          {/* FOOT */}

          <div className="signin-footer-text">
            <p>New to Lost & Found?</p>
            <button onClick={() => navigate("/signup-verify")}>
              Create an Account
            </button>
          </div>

        </div>

        {/* LINKS */}

        <div className="signin-links">
          <button>Privacy Policy</button>
          <button>Terms of Service</button>
          <button>Help Center</button>
        </div>

        <p className="signin-secure-text">Secure Verification</p>

      </div>

    </div>

  )

}

export default SignIn