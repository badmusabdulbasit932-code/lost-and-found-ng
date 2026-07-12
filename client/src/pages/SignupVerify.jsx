import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { signup, verifyEmail } from "../services/authService"
import Swal from "sweetalert2"
import * as alert from "../utils/alert"
import "../styles/signup.css"

function SignupVerify() {

  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  // ── Step control ─────────────────────────────────────────────────────
  // step 1 = fill the signup form
  // step 2 = enter the verification code sent to email
  const [step, setStep] = useState(1)

  // ── Form fields ──────────────────────────────────────────────────────
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verifyCode, setVerifyCode] = useState("")

  // ── UI state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState("")

  // ── STEP 1 — Handle signup form submit ───────────────────────────────
  const handleSignup = async (e) => {

    e.preventDefault()

    let newErrors = {}

    if (!name.trim()) newErrors.name = "Full name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email))
      newErrors.email = "Enter a valid email"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters"
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    // Show loading spinner
    alert.loading("Creating your account...")

    try {

      // Call backend signup
      await signup({ name, email, phone, password })

      // Close spinner
      Swal.close()

      // Show info popup telling user to check email
      await alert.info(
        `We sent a 6-digit verification code to ${email}. Check your inbox.`,
        "Check Your Email 📧"
      )

      // Move to step 2
      setSuccessMsg(`Verification code sent to ${email}.`)
      setStep(2)

    } catch (err) {

      Swal.close()

      // Show error popup
      alert.error(
        err.message || "Signup failed. Please try again.",
        "Signup Failed"
      )

    } finally {

      setLoading(false)

    }

  }

  // ── STEP 2 — Handle email verification code submit ───────────────────
  const handleVerify = async (e) => {

    e.preventDefault()

    if (!verifyCode.trim()) {
      setErrors({ code: "Please enter the verification code" })
      return
    }

    if (verifyCode.length !== 6) {
      setErrors({ code: "Code must be 6 digits" })
      return
    }

    setErrors({})
    setLoading(true)

    // Show loading spinner
    alert.loading("Verifying your email...")

    try {

      // Call backend verify
      await verifyEmail({ email, code: verifyCode })

      // Auto login after verification
      const { login } = await import("../services/authService")
      const data = await login({ email, password })

      // Close spinner
      Swal.close()

      // Save to AuthContext
      authLogin({ token: data.token, user: data.user })

      // Show success popup
      await alert.success(
        "Your email has been verified. Welcome to Lost & Found NG! 🎉",
        "Account Activated"
      )

      // Redirect to dashboard
      navigate("/dashboard")

    } catch (err) {

      Swal.close()

      alert.error(
        err.message || "Verification failed. Please try again.",
        "Verification Failed"
      )

    } finally {

      setLoading(false)

    }

  }
  // ── RENDER — Step 1: Signup Form ─────────────────────────────────────
  if (step === 1) {
    return (

      <div className="signup-page">

        <div className="signup-container">

          {/* TOP BAR */}
          <div className="signup-top-bar">
            <button className="back-home-btn" onClick={() => navigate("/")}>
              ← Back Home
            </button>
          </div>

          {/* LOGO */}
          <div className="signup-logo-row">
            <div className="signup-logo-box"><FiShield /></div>
            <div className="signup-logo-text">
              <h1>Lost & Found NG</h1>
              <span>Trusted Recovery Platform</span>
            </div>
          </div>

          {/* TEXT */}
          <div className="signup-text">
            <h2>Join the Community</h2>
            <p>Securely report lost items and reconnect with what matters to you.</p>
          </div>

          {/* CARD */}
          <div className="signup-card">

            {/* PROGRESS */}
            <div className="signup-progress-wrap">
              <div className="progress-top"><span>Step 1 of 2</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: "50%" }}></div></div>
            </div>

            {/* GENERAL ERROR */}
            {errors.general && (
              <div className="signin-error">
                <div className="signin-error-icon"><FiAlertCircle /></div>
                <div>
                  <h4>Signup failed</h4>
                  <p>{errors.general}</p>
                </div>
              </div>
            )}

            {/* FORM */}
            <form className="signup-form" onSubmit={handleSignup}>

              {/* NAME */}
              <div className="signup-input-group">
                <label>Full Name</label>
                <div className={`signup-input ${errors.name ? "input-error" : ""}`}>
                  <FiUser />
                  <input
                    type="text"
                    placeholder="e.g. Chukwuma Adeyemi"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrors({ ...errors, name: "" })
                    }}
                  />
                </div>
                {errors.name && <p className="error-text">{errors.name}</p>}
              </div>

              {/* EMAIL */}
              <div className="signup-input-group">
                <label>Email Address</label>
                <div className={`signup-input ${errors.email ? "input-error" : ""}`}>
                  <FiMail />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors({ ...errors, email: "" })
                    }}
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              {/* PHONE */}
              <div className="signup-input-group">
                <div className="signup-label-row">
                  <label>Phone Number</label>
                  <span>Recommended</span>
                </div>
                <div className="signup-input">
                  <FiPhone />
                  <input
                    type="text"
                    placeholder="+234 812 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="signup-input-group">
                <label>Password</label>
                <div className={`signup-input ${errors.password ? "input-error" : ""}`}>
                  <FiLock />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: "" })
                    }}
                  />
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="signup-input-group">
                <label>Confirm Password</label>
                <div className={`signup-input ${errors.confirmPassword ? "input-error" : ""}`}>
                  <FiShield />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors({ ...errors, confirmPassword: "" })
                    }}
                  />
                </div>
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
              </div>

              {/* BUTTON */}
              <button className="signup-btn" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
                <FiArrowRight />
              </button>

            </form>

            {/* FOOT */}
            <div className="signup-foot">
              <p>Already have an account?</p>
              <button onClick={() => navigate("/signin")}>Sign In</button>
            </div>

          </div>

          {/* FEATURES */}
          <div className="signup-features">
            <div className="feature-box"><FiCheckCircle /><span>SECURE DATA</span></div>
            <div className="feature-box"><FiInfo /><span>SAFE COMM</span></div>
          </div>

          <p className="signup-terms">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>

        </div>

      </div>

    )
  }

  // ── RENDER — Step 2: Verify Email ─────────────────────────────────────
  return (

    <div className="signup-page">

      <div className="signup-container">

        {/* LOGO */}
        <div className="signup-logo-row">
          <div className="signup-logo-box"><FiShield /></div>
          <div className="signup-logo-text">
            <h1>Lost & Found NG</h1>
            <span>Trusted Recovery Platform</span>
          </div>
        </div>

        {/* TEXT */}
        <div className="signup-text">
          <h2>Verify Your Email</h2>
          <p>
            We sent a 6-digit code to <strong>{email}</strong>.
            Enter it below to activate your account.
          </p>
        </div>

        {/* CARD */}
        <div className="signup-card">

          {/* PROGRESS */}
          <div className="signup-progress-wrap">
            <div className="progress-top"><span>Step 2 of 2</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: "100%" }}></div></div>
          </div>

          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#15803d",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <FiCheckCircle />
              {successMsg}
            </div>
          )}

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="signin-error">
              <div className="signin-error-icon"><FiAlertCircle /></div>
              <div>
                <h4>Verification failed</h4>
                <p>{errors.general}</p>
              </div>
            </div>
          )}

          {/* FORM */}
          <form className="signup-form" onSubmit={handleVerify}>

            {/* CODE INPUT */}
            <div className="signup-input-group">

              <label>Verification Code</label>

              <div className={`signup-input ${errors.code ? "input-error" : ""}`}>
                <FiMail />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verifyCode}
                  maxLength={6}
                  onChange={(e) => {
                    setVerifyCode(e.target.value)
                    setErrors({ ...errors, code: "" })
                  }}
                />
              </div>

              {errors.code && <p className="error-text">{errors.code}</p>}

            </div>

            {/* BUTTON */}
            <button className="signup-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
              <FiArrowRight />
            </button>

          </form>

          {/* RESEND */}
          <div className="signup-foot">
            <p>Didn't receive the code?</p>
            <button
              onClick={async () => {
                try {

                  alert.loading("Resending code...")

                  await signup({ name, email, phone, password })

                  Swal.close()

                  setSuccessMsg(`A new code has been sent to ${email}.`)
                  alert.toast("A new code has been sent to your email.", "success")

                } catch (err) {

                  Swal.close()

                  alert.error(err.message || "Could not resend code.")

                }
              }}
            >
              Resend Code
            </button>
          </div>

        </div>

      </div>

    </div>

  )

}

export default SignupVerify