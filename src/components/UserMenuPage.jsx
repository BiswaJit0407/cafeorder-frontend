"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./UserMenu.css"

function UserMenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [tableNumber, setTableNumber] = useState("")
  const [error, setError] = useState("")
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/menu", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMenuItems(response.data)
      } catch (err) {
        setError("Failed to load menu")
      }
    }

    if (user?.tableNumber) {
      setTableNumber(user.tableNumber)
    }

    fetchMenu()
  }, [token, user])

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
      setError("Please enter a table number")
      return
    }

    if (cart.length === 0) {
      setError("Cart is empty")
      return
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders",
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

      alert("Order placed successfully!")
      setCart([])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order")
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
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="content">
        <div className="menu-section">
          <h2>Available Items</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="menu-grid">
            {menuItems.map((item) => (
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
