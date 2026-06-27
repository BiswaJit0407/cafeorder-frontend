"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import UserLayout from "./UserLayout"
import "./UserMenu.css"

function UserMenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [specialOffers, setSpecialOffers] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart")
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [tableNumber, setTableNumber] = useState("")
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const categories = ["All", "Special Offers", "Appetizer", "Main Course", "Dessert", "Beverage", "Special"]

  useEffect(() => {
    document.body.classList.add('user-menu-active')

    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMenuItems(response.data)
        setFilteredItems(response.data)
      } catch (err) {
        toast.error("Failed to load menu")
      }
    }

    if (user?.tableNumber) {
      setTableNumber(user.tableNumber)
    }

    fetchMenu()
    fetchSpecialOffers()
    
    return () => {
      document.body.classList.remove('user-menu-active')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSpecialOffers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/special-offers`)
      setSpecialOffers(response.data)
    } catch (err) {
      console.error("Failed to load special offers:", err)
    }
  }

  useEffect(() => {
    let filtered = menuItems;

    if (selectedCategory !== "All" && selectedCategory !== "Special Offers") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    } else if (selectedCategory === "Special Offers") {
      filtered = [];
    }

    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, menuItems, searchQuery])

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id)

    let newCart
    if (existingItem) {
      newCart = cart.map((cartItem) =>
        cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      )
    } else {
      newCart = [...cart, { ...item, quantity: 1 }]
    }
    
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    toast.success(`${item.name} added to cart!`)
  }

  const removeFromCart = (itemId) => {
    const newCart = cart.filter((item) => item._id !== itemId)
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(itemId)
    } else {
      const newCart = cart.map((item) => (item._id === itemId ? { ...item, quantity } : item))
      setCart(newCart)
      localStorage.setItem("cart", JSON.stringify(newCart))
    }
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const [showCart, setShowCart] = useState(false)

  return (
    <UserLayout onCartClick={() => setShowCart(!showCart)} cartCount={cart.length}>
      {/* Main Split Layout */}
      <div className="main-wrapper">
        
        {/* Left Sidebar: Categories */}
        <aside className="category-sidebar">
          <h3 className="sidebar-title">Categories</h3>
          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill ${category === "Special Offers" ? "special-offer-pill" : ""} ${selectedCategory === category ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                <span>{category}</span>
                {category === "Special Offers" && <span>✨</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content: Menu Grid */}
        <section className="menu-display">
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search for delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="menu-search-input"
              />
            </div>
          </div>

          <div className="menu-display-header">
            <h2>{selectedCategory}</h2>
            <span className="menu-badge-count">
              {selectedCategory === "Special Offers" 
                ? specialOffers.filter(offer => offer.name.toLowerCase().includes(searchQuery.toLowerCase()) || (offer.description && offer.description.toLowerCase().includes(searchQuery.toLowerCase()))).length 
                : filteredItems.length} items
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}

          {selectedCategory === "Special Offers" ? (
            <div className="menu-grid">
              {specialOffers
                .filter(offer => offer.name.toLowerCase().includes(searchQuery.toLowerCase()) || (offer.description && offer.description.toLowerCase().includes(searchQuery.toLowerCase())))
                .map((offer) => (
                <div key={offer._id} className="menu-card special-offer-card-user">
                  <div className="special-offer-badge">{offer.badgeText || "PROMO"}</div>
                  {offer.image && (
                    <img src={offer.image} alt={offer.name} className="menu-item-image" />
                  )}
                  <div className="card-content">
                    <div className="card-top">
                      <h3>{offer.name}</h3>
                    </div>
                    <p className="description">{offer.description}</p>
                    {offer.items && offer.items.length > 0 && (
                      <div className="offer-items-preview">
                        <strong>Includes:</strong>
                        <ul>
                          {offer.items.map((item, index) => (
                            <li key={index}>{item.name} ×{item.quantity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="offer-pricing-user">
                      <span className="original-price-user">₹{offer.originalPrice}</span>
                      <span className="offer-price-user">₹{offer.offerPrice}</span>
                      <span className="discount-badge-user">{offer.discount}% OFF</span>
                    </div>
                    <button 
                      className="add-cart-btn"
                      onClick={() => addToCart({ _id: offer.menuItemId, name: offer.name, price: offer.offerPrice, image: offer.image, isSpecialOffer: true, allowCoupons: false })}
                    >
                      <span>Add Offer</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <div key={item._id} className="menu-card">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="menu-item-image" loading="lazy" />
                  )}
                  <div className="card-content">
                    <div className="card-top">
                      <h3>{item.name}</h3>
                      <span className="price">₹{item.price}</span>
                    </div>
                    <p className="description">{item.description}</p>
                    <button className="add-cart-btn" onClick={() => addToCart(item)}>
                      <span>Add to Cart</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Cart Sidebar Drawer */}
      <div className={`cart-sidebar ${showCart ? "show" : ""}`}>
        <div className="cart-sidebar-header">
          <h2>Your Cart</h2>
          <button className="close-cart-btn" onClick={() => setShowCart(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <svg className="empty-cart-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Your cart is empty</p>
            <span>Add some delicious items to get started</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-price">₹{item.price}</p>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
            
            <button className="checkout-btn" onClick={() => navigate("/checkout", { state: { cart } })}>
              <span>Proceed to Checkout</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>

      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}></div>}
    </UserLayout>
  )
}

export default UserMenuPage
