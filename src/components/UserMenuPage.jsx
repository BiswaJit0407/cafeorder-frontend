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

  const categories = ["All", "Appetizer", "Main Course", "Dessert", "Beverage", "Special"]

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredItems(menuItems)
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
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="menu-section">
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
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L7.17 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1h-4.17L15 2H9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <h2>Your Cart</h2>
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
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
      </div>
    </div>
  )
}

export default UserMenuPage
