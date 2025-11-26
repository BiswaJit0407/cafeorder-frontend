"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Line, Doughnut } from "react-chartjs-2"
import "./Analytics.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

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
                <div className="chart-wrapper">
                  <Doughnut
                    data={{
                      labels: Object.keys(analytics.ordersByStatus).map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
                      datasets: [
                        {
                          label: "Orders",
                          data: Object.values(analytics.ordersByStatus),
                          backgroundColor: [
                            "rgba(255, 152, 0, 0.8)",
                            "rgba(33, 150, 243, 0.8)",
                            "rgba(76, 175, 80, 0.8)",
                            "rgba(156, 39, 176, 0.8)",
                            "rgba(0, 188, 212, 0.8)",
                            "rgba(244, 67, 54, 0.8)",
                          ],
                          borderColor: [
                            "rgba(255, 152, 0, 1)",
                            "rgba(33, 150, 243, 1)",
                            "rgba(76, 175, 80, 1)",
                            "rgba(156, 39, 176, 1)",
                            "rgba(0, 188, 212, 1)",
                            "rgba(244, 67, 54, 1)",
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="chart-card">
                <h3>Top Selling Items</h3>
                <div className="chart-wrapper">
                  {analytics.topItems.length > 0 ? (
                    <Bar
                      data={{
                        labels: analytics.topItems.map((item) => item.name),
                        datasets: [
                          {
                            label: "Quantity Sold",
                            data: analytics.topItems.map((item) => item.quantity),
                            backgroundColor: "rgba(102, 126, 234, 0.8)",
                            borderColor: "rgba(102, 126, 234, 1)",
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className="no-data">No items sold yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="revenue-chart-card">
              <h3>Revenue Trend</h3>
              <div className="chart-wrapper">
                {Object.keys(analytics.revenueByDay).length > 0 ? (
                  <Line
                    data={{
                      labels: Object.keys(analytics.revenueByDay),
                      datasets: [
                        {
                          label: "Revenue (₹)",
                          data: Object.values(analytics.revenueByDay),
                          fill: true,
                          backgroundColor: "rgba(76, 175, 80, 0.2)",
                          borderColor: "rgba(76, 175, 80, 1)",
                          borderWidth: 3,
                          tension: 0.4,
                          pointRadius: 5,
                          pointBackgroundColor: "rgba(76, 175, 80, 1)",
                          pointBorderColor: "#fff",
                          pointBorderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: true,
                          position: "top",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `Revenue: ₹${context.parsed.y.toFixed(2)}`
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return "₹" + value
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="no-data">No revenue data yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Analytics
