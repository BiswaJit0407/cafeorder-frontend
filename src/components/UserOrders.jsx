"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import "./UserOrders.css"

function UserOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(response.data)
      setLoading(false)
    } catch (err) {
      setError("Failed to load orders")
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ff9800",
      preparing: "#2196f3",
      ready: "#4caf50",
      served: "#9c27b0",
      paid: "#00bcd4",
      cancelled: "#f44336",
    }
    return colors[status] || "#666"
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>
  }

  return (
    <div className="user-orders-container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>My Orders</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="menu-btn" onClick={() => navigate("/user-menu")}>
              Back to Menu
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="orders-content">
        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate("/user-menu")}>Browse Menu</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order._id.substring(0, 8)}</h3>
                    <p className="order-date">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-details">
                  <p>
                    <strong>Table Number:</strong> {order.tableNumber}
                  </p>
                  {order.couponCode && (
                    <p className="coupon-applied">
                      <strong>Coupon Applied:</strong> {order.couponCode}
                    </p>
                  )}
                  <div className="amount-details">
                    {order.discount > 0 ? (
                      <>
                        <p>
                          <strong>Subtotal:</strong> <span className="original-amount">₹{order.totalAmount}</span>
                        </p>
                        <p className="discount-amount">
                          <strong>Discount:</strong> <span>-₹{order.discount}</span>
                        </p>
                        <p className="final-amount">
                          <strong>Total Paid:</strong> <span>₹{order.finalAmount}</span>
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong>Total Amount:</strong> ₹{order.totalAmount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="order-items">
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <div className="item-row">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">₹{item.price * item.quantity}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.specialInstructions && (
                  <div className="special-instructions">
                    <strong>Special Instructions:</strong> {order.specialInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserOrders
