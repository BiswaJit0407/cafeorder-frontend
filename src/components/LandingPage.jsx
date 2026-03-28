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
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  // Authentication redirect logic
  useEffect(() => {
    document.body.classList.add('landing-active')
    
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
    
    return () => {
      document.body.classList.remove('landing-active')
    }
  }, [navigate])

  // Fetch featured menu items
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/menu`)
        setFeaturedItems(response.data.slice(0, 3)) // Show top 3 for cleaner layout
      } catch (error) {
        console.error("Failed to load featured items:", error)
        setFeaturedItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedItems()
  }, [])

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reviews`)
        setReviews(response.data.slice(0, 3)) // 3 reviews max for UI balance
      } catch (error) {
        console.error("Failed to load reviews:", error)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
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
          <div className="logo" onClick={() => handleNavClick("home")}>
            <span className="logo-text">Little Cup</span>
            <span className="logo-highlight">Cafe</span>
          </div>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            ☰
          </button>
          <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <a onClick={() => handleNavClick("home")}>Home</a>
            <a onClick={() => handleNavClick("menu")}>Menu</a>
            <a onClick={() => handleNavClick("about")}>About</a>
            <a onClick={() => handleNavClick("reviews")}>Reviews</a>
          </div>
          <div className="nav-buttons">
            <button className="login-btn" onClick={() => navigate("/login")}>
              Sign In
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
            <div className="hero-badge">
             ✨ Premium Coffee & Bites
            </div>
            <h1>
              Taste The Magic
              <br />
              In Every <span className="highlight">Cup</span>
            </h1>
            <p className="hero-description">
              Experience the perfect blend of artisanal coffee, delicious cuisine, and seamless ordering. Order from your table, track your food, and enjoy every moment.
            </p>
            <div className="hero-buttons">
              <button className="cta-primary" onClick={() => navigate("/register")}>
                Order Now 
                <span style={{marginLeft: '0.5rem'}}>→</span>
              </button>
              <button className="cta-secondary" onClick={() => navigate("/menu")}>
                View Menu
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5k+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Menu Items</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-backdrop"></div>
            <div className="food-circle">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"
                alt="Delicious Coffee and Food"
              />
            </div>
            <div className="floating-badge">
              <div className="icon">🥇</div>
              <div className="text">
                Best Cafe
                <span>Award 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-menu-section" id="menu">
        <div className="section-header">
          <span className="section-subtitle">Our Menu</span>
          <h2 className="section-title">Featured Delights</h2>
        </div>

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
                  <span className="menu-item-category">{item.category}</span>
                  <div className="menu-item-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="menu-item-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="menu-item-content">
                    <div className="menu-item-header">
                      <h3 className="menu-item-name">{item.name}</h3>
                      <span className="menu-item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="menu-item-description">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-menu-cta">
              <button className="cta-large" onClick={() => navigate("/register")}>
                Explore Full Menu
              </button>
            </div>
          </>
        ) : (
          <div className="fallback-message">
            <p>Menu preview unavailable at the moment. Register to explore our full menu!</p>
            <button className="cta-large" onClick={() => navigate("/register")}>
              Create an Account
            </button>
          </div>
        )}
      </section>

      <section className="categories-section">
        <div className="section-header">
          <span className="section-subtitle">Tastes</span>
          <h2 className="section-title">Browse By Category</h2>
        </div>
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate("/register")}>
            <div className="category-icon">☕</div>
            <h3>Beverages</h3>
            <p>Premium rich coffee & tea</p>
          </div>
          <div className="category-card" onClick={() => navigate("/register")}>
            <div className="category-icon">🥐</div>
            <h3>Pastries</h3>
            <p>Fresh baked every dawn</p>
          </div>
          <div className="category-card" onClick={() => navigate("/register")}>
            <div className="category-icon">🥗</div>
            <h3>Healthy bowls</h3>
            <p>Light, fresh and satisfying</p>
          </div>
          <div className="category-card" onClick={() => navigate("/register")}>
            <div className="category-icon">🍰</div>
            <h3>Desserts</h3>
            <p>A sweet slice of heaven</p>
          </div>
        </div>
      </section>

      <section className="features-section" id="about">
        <div className="section-header">
          <span className="section-subtitle">Why Us</span>
          <h2 className="section-title">The Little Cup Guarantee</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="material-icon">📱</span>
            </div>
            <h3>Seamless Ordering</h3>
            <p>Skip the line. Order from your table, customize your meal, and pay directly from your phone.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="material-icon">⚡</span>
            </div>
            <h3>Lightning Fast</h3>
            <p>Track your order status in real-time. Hot food arrives piping hot, exactly when you expect it.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="material-icon">🎁</span>
            </div>
            <h3>Loyalty Rewards</h3>
            <p>Earn points on every bite and sip. Unlock exclusive deals, secret menus, and birthday treats.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <span className="material-icon">⭐</span>
            </div>
            <h3>Artisanal Quality</h3>
            <p>Locally sourced ingredients, master baristas, and chefs who treat every plate as a masterpiece.</p>
          </div>
        </div>
      </section>

      <section className="reviews-section" id="reviews">
        <div className="section-header">
          <span className="section-subtitle">Testimonials</span>
          <h2 className="section-title">Word on the Street</h2>
        </div>
        {reviewsLoading ? (
          <div className="reviews-loading">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review._id} className="review-card-landing">
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`star ${star <= review.rating ? "filled" : ""}`}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="review-text">{review.comment}</p>
                <div className="review-author">
                  <div className="author-avatar">{review.userName.charAt(0).toUpperCase()}</div>
                  <div className="author-info">
                    <p className="author-name">{review.userName}</p>
                    <p className="review-date">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews-yet" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-light)'}}>
            <p>Our customers love us, but we haven't loaded the feedback yet!</p>
          </div>
        )}
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Craving Something Delicious?</h2>
          <p>Join our community today and get 20% off your first online order.</p>
          <button className="cta-large" onClick={() => navigate("/register")}>
            Sign Up For Free
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="footer-logo">Little Cup <span className="logo-highlight">Cafe</span></div>
            <p>Brewing happiness one cup at a time. Your neighborhood spot for fresh food, warm service, and perfect coffee.</p>
            <div className="social-links">
              <a href="#" className="social-icon">f</a>
              <a href="#" className="social-icon">in</a>
              <a href="#" className="social-icon">ig</a>
              <a href="#" className="social-icon">x</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a onClick={() => handleNavClick("home")}>Home</a>
            <a onClick={() => handleNavClick("menu")}>Our Menu</a>
            <a onClick={() => handleNavClick("about")}>About Us</a>
            <a onClick={() => navigate("/login")}>Sign In</a>
            <a onClick={() => navigate("/register")}>Register</a>
          </div>
          <div className="footer-section">
            <h4>Visit Us</h4>
            <p style={{marginBottom: '0.2rem'}}>📍 123 Artisan Ave, Coffee District</p>
            <p style={{marginBottom: '0.2rem'}}>📧 hello@littlecupcafe.com</p>
            <p style={{marginBottom: '1rem'}}>📞 (555) 123-4567</p>
            <h4 style={{marginTop: '1.5rem', marginBottom: '0.5rem', fontSize:'1.1rem'}}>Hours</h4>
            <p>Mon - Fri: 7:00 AM - 8:00 PM<br/>Weekends: 8:00 AM - 9:00 PM</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Little Cup Cafe. All rights reserved.</p>
          <div style={{display: 'flex', gap: '1.5rem'}}>
            <a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Privacy Policy</a>
            <a href="#" style={{color: 'inherit', textDecoration: 'none'}}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
