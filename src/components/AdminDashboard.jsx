"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./AdminDashboard.css"

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState("pending")
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      let url = "http://localhost:5000/api/orders"
      if (filter !== "all") {
        url += `/status/${filter}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(response.data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      fetchOrders()
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const generateBill = (order) => {
    return (
      <div className="bill">
        <h3>BILL</h3>
        <hr />
        <p>
          <strong>Customer Name:</strong> {order.userName}
        </p>
        <p>
          <strong>Table Number:</strong> {order.tableNumber}
        </p>
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
        </p>
        <hr />
        <h4>Items:</h4>
        <table className="bill-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>₹{item.price}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <h3 className="bill-total">Total Amount: ₹{order.totalAmount}</h3>
        <hr />
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="analytics-btn" onClick={() => navigate("/analytics")}>
              Analytics
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          All Orders
        </button>
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>
          Pending
        </button>
        <button className={filter === "preparing" ? "active" : ""} onClick={() => setFilter("preparing")}>
          Preparing
        </button>
        <button className={filter === "ready" ? "active" : ""} onClick={() => setFilter("ready")}>
          Ready
        </button>
        <button className={filter === "served" ? "active" : ""} onClick={() => setFilter("served")}>
          Served
        </button>
        <button className={filter === "paid" ? "active" : ""} onClick={() => setFilter("paid")}>
          Paid
        </button>
      </div>

      <div className="orders-section">
        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order._id.substring(0, 8)}</h3>
                  <span className="status-badge">{order.status}</span>
                </div>

                <div className="order-details">
                  <p>
                    <strong>Customer:</strong> {order.userName}
                  </p>
                  <p>
                    <strong>Table:</strong> {order.tableNumber}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{order.totalAmount}
                  </p>
                </div>

                <div className="order-items">
                  <strong>Items:</strong>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bill-preview">{generateBill(order)}</div>

                <div className="status-controls">
                  <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <button className="print-btn" onClick={() => window.print()}>
                  Print Bill
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
