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
  const [cart, setCart] = useState([])
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

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        ),
      )
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map((item) => (item._id === itemId ? { ...item, quantity } : item)))
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
          <h2>Your Order</h2>
          <div className="table-input">
            <label>Table Number:</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
            />
          </div>

          {cart.length === 0 ? (
            <p className="empty-cart">Cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-info">
                      <p>{item.name}</p>
                      <p>₹{item.price}</p>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item._id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <h3>Total: ₹{calculateTotal()}</h3>
              </div>
              <button className="order-btn" onClick={placeOrder}>
                Place Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserMenuPage
