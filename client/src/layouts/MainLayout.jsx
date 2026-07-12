/* ════════════════════════════════════════════════════════════════════════
   MAIN LAYOUT — used by public pages only (Home, SignIn, SignUp, etc.)
   Dashboard pages use DashboardLayout which has its own Header + Sidebar.
   If a page uses BOTH MainLayout + DashboardLayout, the Header from
   DashboardLayout is used and MainLayout renders nothing extra.
════════════════════════════════════════════════════════════════════════ */
function MainLayout({ children }) {
  return <>{children}</>
}

export default MainLayout
