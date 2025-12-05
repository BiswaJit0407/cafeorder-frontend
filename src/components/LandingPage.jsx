"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import "./LandingPage.css"

function LandingPage() {
  const navigate = useNavigate()
  const [featuredItems, setFeaturedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Authentication redirect logic
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === "admin") {
          navigate("/admin-dashboard")
        } else if (user.role === "user") {
          navigate("/user-menu")
        }
      } catch (error) {
        console.error("Invalid token or user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [navigate])

  // Fetch featured menu items
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/menu`)
        setFeaturedItems(response.data.slice(0, 6))
      } catch (error) {
        console.error("Failed to load featured items:", error)
        setFeaturedItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-text">Cafe</span>
            <span className="logo-highlight">Order</span>
          </div>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            ☰
          </button>
          <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <a onClick={() => handleNavClick("home")}>Home</a>
            <a onClick={() => handleNavClick("menu")}>Menu</a>
            <a onClick={() => handleNavClick("about")}>About</a>
            <a onClick={() => handleNavClick("contact")}>Contact</a>
          </div>
          <div className="nav-buttons">
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="register-btn" onClick={() => navigate("/register")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Fresh Flavors,
              <br />
              Warm <span className="highlight">Hospitality</span>
            </h1>
            <p className="hero-description">
              Experience the perfect blend of delicious cuisine and seamless ordering. 
              Order from your table, track your food, and enjoy every moment.
            </p>
            <div className="hero-buttons">
              <button className="cta-primary" onClick={() => navigate("/register")}>
                Order Now
              </button>
              <button className="cta-secondary" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Menu Items</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="food-circle">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"
                alt="Delicious Food"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="featured-menu-section" id="menu">
        <h2>
          Featured <span className="highlight">Menu</span>
        </h2>
        {loading ? (
          <div className="featured-menu-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="loading-skeleton skeleton-card"></div>
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <>
            <div className="featured-menu-grid">
              {featuredItems.map((item) => (
                <div key={item._id} className="menu-item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="menu-item-image"
                    loading="lazy"
                  />
                  <div className="menu-item-content">
                    <div className="menu-item-header">
                      <h3 className="menu-item-name">{item.name}</h3>
                      <span className="menu-item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="menu-item-description">{item.description}</p>
                    <span className="menu-item-category">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-menu-cta">
              <button className="cta-large" onClick={() => navigate("/register")}>
                View Full Menu - Register Now
              </button>
            </div>
          </>
        ) : (
          <div className="fallback-message">
            <p>Menu preview unavailable. Register to explore our full menu!</p>
            <button className="cta-large" onClick={() => navigate("/register")} style={{ marginTop: "1rem" }}>
              Register Now
            </button>
          </div>
        )}
      </section>

      <section className="categories-section">
        <h2>Explore Our <span className="highlight">Categories</span></h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">🍔</div>
            <h3>Main Dishes</h3>
            <p>Hearty meals that satisfy</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🥗</div>
            <h3>Appetizers</h3>
            <p>Perfect starters</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🍰</div>
            <h3>Desserts</h3>
            <p>Sweet endings</p>
          </div>
          <div className="category-card">
            <div className="category-icon">☕</div>
            <h3>Beverages</h3>
            <p>Refreshing drinks</p>
          </div>
        </div>
      </section>

      <section className="features-section" id="about">
        <h2>Why Choose <span className="highlight">Us</span></h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy Ordering</h3>
            <p>Order from your table with just a few taps</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Service</h3>
            <p>Track your order in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Special Offers</h3>
            <p>Exclusive deals and discounts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Quality Food</h3>
            <p>Fresh ingredients, amazing taste</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>Join hundreds of satisfied customers enjoying our delicious food</p>
          <button className="cta-large" onClick={() => navigate("/register")}>
            Get Started Now
          </button>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CafeOrder</h3>
            <p>Fresh food, warm service</p>
            <p style={{ marginTop: "1rem" }}>Follow us:</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <a href="#" style={{ fontSize: "1.5rem" }}>📘</a>
              <a href="#" style={{ fontSize: "1.5rem" }}>📷</a>
              <a href="#" style={{ fontSize: "1.5rem" }}>🐦</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📍 123 Restaurant Street, Food City, FC 12345</p>
            <p>📧 info@cafeorder.com</p>
            <p>📞 +1 (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h4>Operating Hours</h4>
            <p>Monday - Friday: 9:00 AM - 10:00 PM</p>
            <p>Saturday: 10:00 AM - 11:00 PM</p>
            <p>Sunday: 10:00 AM - 9:00 PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CafeOrder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
