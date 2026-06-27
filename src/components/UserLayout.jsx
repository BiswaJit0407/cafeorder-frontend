import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import NotificationBell from "./NotificationBell"
import "./UserLayout.css"

function UserLayout({ children, title, subtitle, showCart = true, cartCount, onCartClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user"))
  
  const [localCartCount, setLocalCartCount] = useState(0)

  useEffect(() => {
    if (cartCount === undefined) {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setLocalCartCount(JSON.parse(savedCart).length)
      }
    }
  }, [cartCount])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick()
    } else {
      navigate("/user-menu")
    }
  }
  
  const displayCartCount = cartCount !== undefined ? cartCount : localCartCount

  return (
    <div className="user-layout-container">
      {/* Header */}
      <header className="user-header">
        <div className="user-header-content">
          <div className="user-header-info">
            <h1>{title || "Little Cup Cafe"}</h1>
            <p>{subtitle || `Welcome back, ${user?.name || "Guest"}`}</p>
          </div>
          <div className="user-header-buttons">
            {location.pathname !== "/user-menu" && (
              <button className="user-nav-pill-btn" onClick={() => navigate("/user-menu")}>
                Menu
              </button>
            )}
            {location.pathname !== "/my-orders" && (
              <button className="user-nav-pill-btn" onClick={() => navigate("/my-orders")}>
                Orders
              </button>
            )}
            {location.pathname !== "/my-reviews" && (
              <button className="user-nav-pill-btn" onClick={() => navigate("/my-reviews")}>
                Reviews
              </button>
            )}
            <NotificationBell />
            {showCart && (
              <button className="user-nav-pill-btn user-cart-btn" onClick={handleCartClick}>
                <svg className="user-cart-icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Cart
                {displayCartCount > 0 && <span className="user-cart-badge">{displayCartCount}</span>}
              </button>
            )}
            <button className="user-nav-pill-btn user-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="user-layout-main">
        {children}
      </main>

      {/* Mobile Bottom Navigation Component */}
      <div className="user-mobile-bottom-nav">
        {location.pathname !== "/user-menu" && (
           <button className="user-mobile-nav-btn" onClick={() => navigate("/user-menu")}>
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
               <polyline points="9 22 9 12 15 12 15 22"></polyline>
             </svg>
             <span>Menu</span>
           </button>
        )}
        {location.pathname !== "/my-orders" && (
          <button className="user-mobile-nav-btn" onClick={() => navigate("/my-orders")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
            <span>Orders</span>
          </button>
        )}
        {location.pathname !== "/my-reviews" && (
          <button className="user-mobile-nav-btn" onClick={() => navigate("/my-reviews")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <span>Reviews</span>
          </button>
        )}
        <NotificationBell isMobile={true} />
        {showCart && (
          <button className="user-mobile-nav-btn" onClick={handleCartClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Cart</span>
            {displayCartCount > 0 && <span className="user-mobile-cart-badge">{displayCartCount}</span>}
          </button>
        )}
      </div>
    </div>
  )
}

export default UserLayout
