// Import the base axios instance from api.js
import api from "./api"

// ── SIGNUP ──────────────────────────────────────────────────────────────
// Sends name, email, phone, password to backend
// Backend saves user to MongoDB and sends verification email
// Returns: { message, token, user }

export const signup = async ({ name, email, phone, password }) => {

  // Make the POST request to backend
  const res = await api.post("/users/signup", {
    name,
    email,
    phone,
    password,
  })

  // If backend returned a token save it to localStorage
  if (res.data.token) {
    localStorage.setItem("token", res.data.token)
  }

  // If backend returned user data save it to localStorage
  if (res.data.user) {
    localStorage.setItem("loggedInUser", JSON.stringify(res.data.user))
  }

  // Return the full response data to the component
  return res.data
}

// ── LOGIN ────────────────────────────────────────────────────────────────
// Sends email and password to backend
// Backend checks credentials and returns a JWT token
// Returns: { message, token, user }

export const login = async ({ email, password }) => {

  // Make the POST request to backend
  const res = await api.post("/users/login", {
    email,
    password,
  })

  // Save token to localStorage so api.js can attach it to future requests
  if (res.data.token) {
    localStorage.setItem("token", res.data.token)
  }

  // Save user data to localStorage
  if (res.data.user) {
    localStorage.setItem("loggedInUser", JSON.stringify(res.data.user))
  }

  // Return the full response data to the component
  return res.data
}

// ── VERIFY EMAIL ─────────────────────────────────────────────────────────
// Sends the 6-digit code the user received by email
// Backend checks the code and marks the user as verified
// Returns: { message }

export const verifyEmail = async ({ email, code }) => {

  // Make the POST request to backend
  const res = await api.post("/users/verify", {
    email,
    verificationCode: code,
  })

  // Return the response
  return res.data
}

// ── FORGOT PASSWORD ──────────────────────────────────────────────────────
// Sends the user's email to backend
// Backend sends a reset code to that email
// Returns: { message }

export const forgotPassword = async (email) => {

  // Make the POST request to backend
  const res = await api.post("/users/forgot-password", {
    email,
  })

  return res.data
}

// ── RESET PASSWORD ───────────────────────────────────────────────────────
// Sends the reset code and new password to backend
// Backend verifies the code and updates the password
// Returns: { message }

export const resetPassword = async ({ email, code, newPassword }) => {

  // Make the POST request to backend
  const res = await api.post("/users/reset-password", {
    email,
    code,
    newPassword,
  })

  return res.data
}

// ── GET ME ───────────────────────────────────────────────────────────────
// Gets the currently logged-in user's data from backend
// Requires token in localStorage (api.js attaches it automatically)
// Returns: { user }

export const getMe = async () => {

  // Make the GET request to backend
  const res = await api.get("/users/me")

  // Update localStorage with fresh data from server
  if (res.data.user) {
    localStorage.setItem("loggedInUser", JSON.stringify(res.data.user))
  }

  return res.data.user
}

// ── LOGOUT ───────────────────────────────────────────────────────────────
// Clears all auth data from localStorage
// No backend call needed — JWT is stateless

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("loggedInUser")
}

// ── UPDATE PROFILE ────────────────────────────────────────────────────────
// Sends updated profile data to backend
// Returns: { message, user }

export const updateProfile = async (data) => {

  const res = await api.put("/users/me", data)

  // Update localStorage with new user data
  if (res.data.user) {
    localStorage.setItem("loggedInUser", JSON.stringify(res.data.user))
  }

  return res.data
}

// ── UPLOAD AVATAR ─────────────────────────────────────────────────────────
// Sends image file to backend as form-data
// Returns: { message, avatar, user }

export const uploadAvatar = async (file) => {

  // Create FormData — required for file uploads
  const formData = new FormData()

  // Add the file with the field name "avatar"
  // This must match what your backend multer expects
  formData.append("avatar", file)

  // Explicitly clear Content-Type so axios drops the instance's JSON
  // default and the browser sets its own multipart boundary
  const res = await api.post("/users/avatar", formData, {
    headers: { "Content-Type": undefined },
  })

  return res.data
}