import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
  FiShield,
  FiHash,
  FiCheckCircle,
} from "react-icons/fi"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import * as alert from "../utils/alert"
import "../styles/signin.css"

function ForgotPassword() {

  const navigate = useNavigate()

  // step 1 = enter email, step 2 = enter code + new password, step 3 = done
  const [step, setStep] = useState(1)

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // ── STEP 1: request the reset code ──────────────────────────────────
  const handleRequestCode = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!email) {
      setErrors({ email: "Email is required." })
      return
    }

    setLoading(true)
    alert.loading("Sending reset code...")

    try {
      const { forgotPassword } = await import("../services/authService")
      await forgotPassword(email)

      Swal.close()
      alert.toast("If that email exists, a reset code has been sent.", "success")
      setStep(2)

    } catch (err) {
      Swal.close()
      alert.error(err.message || "Something went wrong. Please try again.", "Request Failed")
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 2: verify code + set new password ──────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!code || code.trim().length !== 6) {
      setErrors({ code: "Enter the 6-digit code sent to your email." })
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters." })
      return
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." })
      return
    }

    setLoading(true)
    alert.loading("Resetting your password...")

    try {
      const { resetPassword } = await import("../services/authService")
      await resetPassword({ email, code: code.trim(), newPassword })

      Swal.close()
      setStep(3)

    } catch (err) {
      Swal.close()
      alert.error(err.message || "Invalid or expired code. Please try again.", "Reset Failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    alert.loading("Resending code...")
    try {
      const { forgotPassword } = await import("../services/authService")
      await forgotPassword(email)
      Swal.close()
      alert.toast("A new code has been sent to your email.", "success")
    } catch (err) {
      Swal.close()
      alert.error(err.message || "Failed to resend code.", "Error")
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
            onClick={() => (step === 1 ? navigate("/signin") : setStep(1))}
          >
            ← {step === 1 ? "Back to Sign In" : "Back"}
          </button>
        </div>

        {/* LOGO */}
        <div className="signin-logo-wrap">
          <div className="signin-logo-box"><FiShield /></div>
          <div className="signin-logo-text">
            <h1>Lost & Found NG</h1>
            <span>Trusted Recovery Platform</span>
          </div>
        </div>

        {/* TEXT */}
        <div className="signin-text">
          {step === 1 && (
            <>
              <h1>Reset Your Password</h1>
              <p>Enter your email and we'll send you a 6-digit reset code.</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1>Enter Reset Code</h1>
              <p>Check {email} for your 6-digit code — it expires in 15 minutes.</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1>Password Reset</h1>
              <p>Your password has been changed successfully.</p>
            </>
          )}
        </div>

        {/* CARD */}
        <div className="signin-card">

          {errors.general && (
            <div className="signin-error">
              <div className="signin-error-icon"><FiAlertCircle /></div>
              <div>
                <h4>Something went wrong</h4>
                <p>{errors.general}</p>
              </div>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form className="signin-form" onSubmit={handleRequestCode}>
              <div className="signin-input-group">
                <label>Email Address</label>
                <div className={`signin-input ${errors.email ? "error-input" : ""}`}>
                  <FiMail />
                  <input
                    type="email"
                    placeholder="user@lostfoundng.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
                  />
                </div>
                {errors.email && <p className="input-error-text">{errors.email}</p>}
              </div>

              <button className="signin-btn" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
                <FiArrowRight />
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form className="signin-form" onSubmit={handleResetPassword}>
              <div className="signin-input-group">
                <label>6-Digit Code</label>
                <div className={`signin-input ${errors.code ? "error-input" : ""}`}>
                  <FiHash />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setErrors({}) }}
                  />
                </div>
                {errors.code && <p className="input-error-text">{errors.code}</p>}
              </div>

              <div className="signin-input-group">
                <label>New Password</label>
                <div className={`signin-input ${errors.newPassword ? "error-input" : ""}`}>
                  <FiLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrors({}) }}
                  />
                  {showPassword ? (
                    <FiEyeOff className="eye-icon" onClick={() => setShowPassword(false)} />
                  ) : (
                    <FiEye className="eye-icon" onClick={() => setShowPassword(true)} />
                  )}
                </div>
                {errors.newPassword && <p className="input-error-text">{errors.newPassword}</p>}
              </div>

              <div className="signin-input-group">
                <label>Confirm New Password</label>
                <div className={`signin-input ${errors.confirmPassword ? "error-input" : ""}`}>
                  <FiLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}) }}
                  />
                </div>
                {errors.confirmPassword && <p className="input-error-text">{errors.confirmPassword}</p>}
              </div>

              <button className="signin-btn" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
                <FiArrowRight />
              </button>

              <div className="signin-footer-text">
                <p>Didn't get a code?</p>
                <button type="button" onClick={handleResendCode} disabled={loading}>
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <FiCheckCircle style={{ fontSize: "48px", color: "#16a34a", marginBottom: "16px" }} />
              <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "14px" }}>
                You can now sign in with your new password.
              </p>
              <button className="signin-btn" onClick={() => navigate("/signin")}>
                Go to Sign In <FiArrowRight />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default ForgotPassword