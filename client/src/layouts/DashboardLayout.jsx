import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import "../styles/dashboardLayout.css"

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard-layout">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="dashboard-right">
        <Header
          setOpen={setSidebarOpen}
        />

        <main className="dashboard-content">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default DashboardLayout