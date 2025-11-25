import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import UserMenuPage from "./components/UserMenuPage"
import AdminDashboard from "./components/AdminDashboard"

function ProtectedRoute({ component, role }) {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))

  if (!token) {
    return <Navigate to="/login" />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/login" />
  }

  return component
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/user-menu" element={<ProtectedRoute component={<UserMenuPage />} role="user" />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute component={<AdminDashboard />} role="admin" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
