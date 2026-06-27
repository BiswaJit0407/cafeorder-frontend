"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import AdminLayout from "./AdminLayout"
import "./AdminDashboard.css"

const STATUSES = ["pending", "preparing", "ready", "served", "paid"]
const STATUS_LABELS = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  paid: "Paid"
}

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [printingOrderId, setPrintingOrderId] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let timer;
    if (printingOrderId) {
      timer = setTimeout(() => {
        window.print();
        setPrintingOrderId(null);
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [printingOrderId]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(response.data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      // fetchOrders() can be omitted if optimistic is fine, but good to sync
      fetchOrders()
    } catch (error) {
      console.error("Failed to update order:", error)
      fetchOrders() // Revert on failure
    }
  }

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData("orderId", orderId)
    e.dataTransfer.effectAllowed = "move"
    // Optional: make it slightly transparent while dragging
    setTimeout(() => {
      e.target.style.opacity = "0.4"
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1"
    setDragOverStatus(null)
  }

  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverStatus !== status) {
      setDragOverStatus(status)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOverStatus(null)
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    setDragOverStatus(null)
    const orderId = e.dataTransfer.getData("orderId")
    if (orderId) {
      const order = orders.find(o => o._id === orderId)
      if (order && order.status !== status) {
        updateOrderStatus(orderId, status)
      }
    }
  }

  const generateBill = (order) => {
    return (
      <div className="bill">
        <h3>BILL</h3>
        <hr />
        <p><strong>Customer Name:</strong> {order.userName}</p>
        <p><strong>Table Number:</strong> {order.tableNumber}</p>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
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
        {order.couponCode && (
          <>
            <p><strong>Coupon Applied:</strong> {order.couponCode}</p>
            <p><strong>Subtotal:</strong> ₹{order.totalAmount}</p>
            <p style={{ color: "#4caf50" }}><strong>Discount:</strong> -₹{order.discount}</p>
            <hr />
          </>
        )}
        <h3 className="bill-total">
          Total Amount: ₹{order.discount > 0 ? order.finalAmount : order.totalAmount}
        </h3>
        <hr />
      </div>
    )
  }

  const renderOrderCard = (order) => (
    <div 
      key={order._id} 
      className={`order-card kanban-card ${printingOrderId === order._id ? "printing" : ""}`}
      draggable
      onDragStart={(e) => handleDragStart(e, order._id)}
      onDragEnd={handleDragEnd}
    >
      <div className="order-header">
        <h3>#{order._id.substring(0, 6)}</h3>
        <span className={`status-badge status-${order.status}`}>{order.status}</span>
      </div>

      <div className="order-details">
        <p><strong>Customer:</strong> {order.userName}</p>
        <p><strong>Table:</strong> {order.tableNumber}</p>
        {order.discount > 0 ? (
          <>
            <p><strong>Subtotal:</strong> <span style={{ textDecoration: "line-through", color: "#999" }}>₹{order.totalAmount}</span></p>
            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#667eea" }}>
              <strong>Total:</strong> ₹{order.finalAmount}
            </p>
          </>
        ) : (
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>
        )}
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

      <button className="print-btn" onClick={() => setPrintingOrderId(order._id)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print Bill
      </button>
    </div>
  )

  return (
    <AdminLayout title="Orders Kanban Board">
      <div className="admin-dashboard-content">
        <div className="kanban-instruction-banner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p>
            <strong>How to manage orders:</strong> Click and hold an order card, then drag and drop it into a new column to instantly update its status.
          </p>
        </div>
        <div className="kanban-board">
          {STATUSES.map(status => {
            const columnOrders = orders.filter(o => o.status === status)
            return (
              <div 
                key={status} 
                className={`kanban-column ${dragOverStatus === status ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="column-header">
                  <h2>{STATUS_LABELS[status]}</h2>
                  <span className="column-count">{columnOrders.length}</span>
                </div>
                <div className="column-content">
                  {columnOrders.map(order => renderOrderCard(order))}
                  {columnOrders.length === 0 && (
                    <div className="empty-column-placeholder">Drop orders here</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
