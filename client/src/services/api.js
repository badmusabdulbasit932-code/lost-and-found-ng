import axios from "axios"

/* ─── Base instance ───────────────────────────────────────────────────────
   In production set VITE_API_URL in your .env file:
     VITE_API_URL=https://api.lostfoundng.com/api
   During local dev it proxies to http://localhost:5000/api
─────────────────────────────────────────────────────────────────────────── */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

/* ─── Request interceptor — attach JWT from localStorage ─────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

/* ─── Response interceptor — handle 401 globally ────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      // Token expired or invalid — clear session and redirect
      localStorage.removeItem("token")
      localStorage.removeItem("loggedInUser")
      window.location.href = "/signin"
    }

    if (status === 403) {
      console.warn("Access denied (403)")
    }

    // Normalise error message so callers can always do err.message
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong. Please try again."

    return Promise.reject(new Error(message))
  }
)

export default api
