import { Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"

import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SignupVerify from "./pages/SignupVerify"
import SuccessStories from "./pages/SuccessStories"
import Support from "./pages/Support"
import ForgotPassword from "./pages/ForgotPassword"
import BrowseReports from "./pages/BrowseReports"
import HowItWorks from "./pages/HowItWorks"
import NotFound from "./pages/NotFound"

import Dashboard from "./pages/Dashboard"
import Reports from "./pages/Reports"
import Matches from "./pages/Matches"
import Messages from "./pages/Messages"
import ReportDetails from "./pages/ReportDetails"
import CreateReport from "./pages/CreateReport"
import Discover from "./pages/Discover"
import ReportTracking from "./pages/ReportTracking"
import Profile from "./pages/Profile"
import AdminDashboard from "./pages/AdminDashboard"

import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup-verify" element={<SignupVerify />} />
          <Route path="/browse" element={<BrowseReports />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/stories" element={<SuccessStories />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/support" element={<Support />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/help" element={<Navigate to="/support" replace />} />
          <Route path="/contact" element={<Navigate to="/support" replace />} />

          {/* PROTECTED */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute><Reports /></ProtectedRoute>
          } />
          <Route path="/reports/:id" element={
            <ProtectedRoute><ReportDetails /></ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute><Matches /></ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute><Messages /></ProtectedRoute>
          } />
          <Route path="/create-report" element={
            <ProtectedRoute><CreateReport /></ProtectedRoute>
          } />
          <Route path="/discover" element={
            <ProtectedRoute><Discover /></ProtectedRoute>
          } />
          <Route path="/settings" element={<Navigate to="/profile" replace />} />
          <Route path="/report-tracking" element={
            <ProtectedRoute><ReportTracking /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App