import { useNavigate, useLocation } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import "./AdminLayout.css"

function AdminLayout({ children, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const navItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Tables", path: "/table-management" },
    { name: "Menu", path: "/menu-management" },
    { name: "Specials", path: "/special-offers" },
    { name: "Combos", path: "/combo-management" },
    { name: "Coupons", path: "/offer-management" },
    { name: "Reviews", path: "/review-management" },
    { name: "Analytics", path: "/analytics" },
  ]

  return (
    <div className="admin-layout-container">
      <div className="unified-admin-header">
        <div className="header-content">
          <div className="header-branding">
            <h1>{title || "Admin Portal"}</h1>
            <p>Welcome, {user?.name || "Admin"}</p>
          </div>
          <div className="header-navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`nav-btn ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </button>
            ))}
            <div className="header-actions">
              <NotificationBell />
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="admin-layout-content">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
