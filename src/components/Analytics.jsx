"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./Analytics.css"

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [period, setPeriod] = useState("daily")
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:5000/api/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnalytics(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  if (loading) {
    return <div className="loading">Loading analytics...</div>
  }

  return (
    <div className="analytics-container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
              Orders
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="period-selector">
          <button className={period === "daily" ? "active" : ""} onClick={() => setPeriod("daily")}>
            Daily
          </button>
          <button className={period === "weekly" ? "active" : ""} onClick={() => setPeriod("weekly")}>
            Weekly
          </button>
          <button className={period === "monthly" ? "active" : ""} onClick={() => setPeriod("monthly")}>
            Monthly
          </button>
          <button className={period === "yearly" ? "active" : ""} onClick={() => setPeriod("yearly")}>
            Yearly
          </button>
        </div>

        {analytics && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-value">{analytics.totalOrders}</p>
                <span className="stat-label">Orders placed</span>
              </div>

              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatCurrency(analytics.totalRevenue)}</p>
                <span className="stat-label">Total earnings</span>
              </div>

              <div className="stat-card">
                <h3>Average Order Value</h3>
                <p className="stat-value">{formatCurrency(analytics.averageOrderValue)}</p>
                <span className="stat-label">Per order</span>
              </div>

              <div className="stat-card">
                <h3>Completed Orders</h3>
                <p className="stat-value">{analytics.ordersByStatus.paid}</p>
                <span className="stat-label">Paid orders</span>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Orders by Status</h3>
                <div className="status-bars">
                  {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="status-bar-item">
                      <div className="status-bar-label">
                        <span>{status}</span>
                        <span>{count}</span>
                      </div>
                      <div className="status-bar-bg">
                        <div
                          className="status-bar-fill"
                          style={{
                            width: `${analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Top Selling Items</h3>
                <div className="top-items-list">
                  {analytics.topItems.map((item, index) => (
                    <div key={index} className="top-item">
                      <div className="item-rank">{index + 1}</div>
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-stats">
                          {item.quantity} sold • {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.topItems.length === 0 && <p className="no-data">No items sold yet</p>}
                </div>
              </div>
            </div>

            <div className="revenue-chart-card">
              <h3>Revenue by Day</h3>
              <div className="revenue-chart">
                {Object.entries(analytics.revenueByDay).map(([date, revenue]) => (
                  <div key={date} className="revenue-bar-item">
                    <div className="revenue-bar-label">{date}</div>
                    <div className="revenue-bar-bg">
                      <div
                        className="revenue-bar-fill"
                        style={{
                          width: `${(revenue / Math.max(...Object.values(analytics.revenueByDay))) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="revenue-bar-value">{formatCurrency(revenue)}</div>
                  </div>
                ))}
                {Object.keys(analytics.revenueByDay).length === 0 && <p className="no-data">No revenue data yet</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics
