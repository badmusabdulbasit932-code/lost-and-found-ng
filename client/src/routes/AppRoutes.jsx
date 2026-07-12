import { Routes, Route, Navigate } from "react-router-dom"

/* ── pages ── */
import Home           from "../pages/Home"
import SignIn         from "../pages/SignIn"
import Register       from "../pages/Register"
import SignupVerify   from "../pages/SignupVerify"
import Login          from "../pages/Login"
import SuccessStories from "../pages/SuccessStories"
import BrowseReports  from "../pages/BrowseReports"
import HowItWorks     from "../pages/HowItWorks"
import SearchResults  from "../pages/SearchResults"
import NotFound       from "../pages/NotFound"

import Dashboard      from "../pages/Dashboard"
import Reports        from "../pages/Reports"
import Matches        from "../pages/Matches"
import Messages       from "../pages/Messages"
import ReportDetails  from "../pages/ReportDetails"
import CreateReport   from "../pages/CreateReport"
import Discover       from "../pages/Discover"
import ReportTracking from "../pages/ReportTracking"
import Profile        from "../pages/Profile"
import Browse         from "../pages/Browse"

import AdminDashboard from "../pages/AdminDashboard"
import Admin          from "../pages/Admin"

/* ── route guards ── */
import PrivateRoute from "./PrivateRoute"
import AdminRoute   from "./AdminRoute"

/* ════════════════════════════════════════════════════════════════════════
   APP ROUTES
   Single source of truth for all routes.
   Import this into App.jsx instead of defining routes inline.
════════════════════════════════════════════════════════════════════════ */
export default function AppRoutes() {
  return (
    <Routes>

      {/* ── PUBLIC ── */}
      <Route path="/"                element={<Home />} />
      <Route path="/signin"          element={<SignIn />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/signup-verify"   element={<SignupVerify />} />
      <Route path="/success-stories" element={<SuccessStories />} />
      <Route path="/browse"          element={<BrowseReports />} />
      <Route path="/how-it-works"    element={<HowItWorks />} />
      <Route path="/search-results"  element={<SearchResults />} />

      {/* ── PROTECTED (logged-in users only) ── */}
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      }/>

      <Route path="/reports" element={
        <PrivateRoute><Reports /></PrivateRoute>
      }/>

      <Route path="/report/:id" element={
        <PrivateRoute><ReportDetails /></PrivateRoute>
      }/>

      <Route path="/reports/:id" element={
        <PrivateRoute><ReportDetails /></PrivateRoute>
      }/>

      <Route path="/create-report" element={
        <PrivateRoute><CreateReport /></PrivateRoute>
      }/>

      <Route path="/matches" element={
        <PrivateRoute><Matches /></PrivateRoute>
      }/>

      <Route path="/messages" element={
        <PrivateRoute><Messages /></PrivateRoute>
      }/>

      <Route path="/messages/:conversationId" element={
        <PrivateRoute><Messages /></PrivateRoute>
      }/>

      <Route path="/discover" element={
        <PrivateRoute><Discover /></PrivateRoute>
      }/>

      <Route path="/settings" element={<Navigate to="/profile" replace />}/>

      <Route path="/report-tracking" element={
        <PrivateRoute><ReportTracking /></PrivateRoute>
      }/>

      <Route path="/report-tracking/:id" element={
        <PrivateRoute><ReportTracking /></PrivateRoute>
      }/>

      <Route path="/profile" element={
        <PrivateRoute><Profile /></PrivateRoute>
      }/>

      <Route path="/browse-reports" element={
        <PrivateRoute><Browse /></PrivateRoute>
      }/>

      {/* ── ADMIN ONLY ── */}
      <Route path="/admin" element={
        <AdminRoute><Admin /></AdminRoute>
      }/>

      <Route path="/admin-dashboard" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      }/>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}
