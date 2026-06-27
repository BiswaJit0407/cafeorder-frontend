import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import LandingPage from "./components/LandingPage"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import UserMenuPage from "./components/UserMenuPage"
import UserOrders from "./components/UserOrders"
import UserReviews from "./components/UserReviews"
import Checkout from "./components/Checkout"
import AdminDashboard from "./components/AdminDashboard"
import Analytics from "./components/Analytics"
import MenuManagement from "./components/MenuManagement"
import OfferManagement from "./components/OfferManagement"
import ReviewManagement from "./components/ReviewManagement"
import SpecialOfferManagement from "./components/SpecialOfferManagement"
import ComboManagement from "./components/ComboManagement"
import TableManagement from "./components/TableManagement"
import AdminSettings from "./components/AdminSettings"
import UserProfile from "./components/UserProfile"
import { SocketProvider } from "./context/SocketContext"

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
      <SocketProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user-menu" element={<ProtectedRoute component={<UserMenuPage />} role="user" />} />
          <Route path="/checkout" element={<ProtectedRoute component={<Checkout />} role="user" />} />
          <Route path="/my-profile" element={<ProtectedRoute component={<UserProfile />} role="user" />} />
          <Route path="/my-orders" element={<ProtectedRoute component={<UserOrders />} role="user" />} />
          <Route path="/my-reviews" element={<ProtectedRoute component={<UserReviews />} role="user" />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute component={<AdminDashboard />} role="admin" />} />
          <Route path="/analytics" element={<ProtectedRoute component={<Analytics />} role="admin" />} />
          <Route path="/menu-management" element={<ProtectedRoute component={<MenuManagement />} role="admin" />} />
          <Route path="/offer-management" element={<ProtectedRoute component={<OfferManagement />} role="admin" />} />
          <Route path="/review-management" element={<ProtectedRoute component={<ReviewManagement />} role="admin" />} />
          <Route path="/special-offers" element={<ProtectedRoute component={<SpecialOfferManagement />} role="admin" />} />
          <Route path="/combo-management" element={<ProtectedRoute component={<ComboManagement />} role="admin" />} />
          <Route path="/table-management" element={<ProtectedRoute component={<TableManagement />} role="admin" />} />
          <Route path="/admin-settings" element={<ProtectedRoute component={<AdminSettings />} role="admin" />} />
        </Routes>
      </SocketProvider>
    </Router>
  )
}

export default App
