"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import "./UserMenu.css"

function UserMenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [combos, setCombos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart")
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [tableNumber, setTableNumber] = useState("")
  const [error, setError] = useState("")
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const categories = ["All", "Combos", "Appetizer", "Main Course", "Dessert", "Beverage", "Special"]

  useEffect(() => {
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
    fetchCombos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCombos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/combos`)
      setCombos(response.data)
    } catch (err) {
      console.error("Failed to load combos:", err)
    }
  }

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredItems(menuItems)
    } else if (selectedCategory === "Combos") {
      setFilteredItems([])
    } else {
      setFilteredItems(menuItems.filter((item) => item.category === selectedCategory))
    }
  }, [selectedCategory, menuItems])

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

  const placeOrder = async () => {
    if (!tableNumber) {
      toast.error("Please enter a table number")
      return
    }

    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    const toastId = toast.loading("Placing your order...")

    try {
      await axios.post(
        `${API_URL}/api/orders`,
        {
          userName: user.name,
          tableNumber: Number.parseInt(tableNumber),
          items: cart.map((item) => ({
            menuItemId: item._id,
            quantity: item.quantity,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      toast.update(toastId, {
        render: "Order placed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
      setCart([])
      setError("")
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to place order",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const [showCart, setShowCart] = useState(false)

  return (
    <div className="user-menu-container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Restaurant Menu</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="orders-btn" onClick={() => navigate("/my-orders")}>
              My Orders
            </button>
            <button className="reviews-btn" onClick={() => navigate("/my-reviews")}>
              Reviews
            </button>
            <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
              <svg className="cart-icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              Cart
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${showCart ? "show" : ""}`}>
        <div className="cart-sidebar-header">
          <h2>Your Cart</h2>
          <button className="close-cart-btn" onClick={() => setShowCart(false)}>
            ×
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <svg className="empty-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            <p>Your cart is empty</p>
            <span>Add items to get started</span>
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
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                    ×
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Proceed to Checkout
            </button>
          </>
        )}
      </div>

      {/* Overlay */}
      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}></div>}

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <button className="mobile-nav-btn" onClick={() => navigate("/my-orders")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Orders</span>
        </button>
        <button className="mobile-nav-btn" onClick={() => navigate("/my-reviews")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>Reviews</span>
        </button>
        <button className="mobile-nav-btn" onClick={() => setShowCart(!showCart)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          <span>Cart</span>
          {cart.length > 0 && <span className="mobile-cart-badge">{cart.length}</span>}
        </button>
        <button className="mobile-nav-btn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>

      <div className="content">
        <div className="menu-section-full">
          <div className="menu-header">
            <h2>Available Items</h2>
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          
          {selectedCategory === "Combos" ? (
            <div className="menu-grid">
              {combos.map((combo) => (
                <div key={combo._id} className="menu-card combo-card-user">
                  {combo.image && (
                    <img src={combo.image} alt={combo.name} className="menu-item-image" />
                  )}
                  <div className="combo-badge">COMBO OFFER</div>
                  <h3>{combo.name}</h3>
                  <p>{combo.description}</p>
                  <div className="combo-items-preview">
                    <strong>Includes:</strong>
                    <ul>
                      {combo.items.map((item, index) => (
                        <li key={index}>{item.name} x{item.quantity}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="combo-pricing-user">
                    <span className="original-price-user">₹{combo.originalPrice}</span>
                    <span className="combo-price-user">₹{combo.comboPrice}</span>
                    <span className="discount-badge-user">{combo.discount}% OFF</span>
                  </div>
                  <button onClick={() => addToCart({ ...combo, price: combo.comboPrice, isCombo: true })}>Add to Cart</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item) => (
                <div key={item._id} className="menu-card">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="menu-item-image" />
                  )}
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p className="price">₹{item.price}</p>
                  <p className="category">{item.category}</p>
                  <button onClick={() => addToCart(item)}>Add to Cart</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserMenuPage
