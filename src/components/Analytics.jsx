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
  Filler,
} from "chart.js"
import { Bar, Line, Doughnut } from "react-chartjs-2"
import { API_URL } from "../config/api"
import AdminLayout from "./AdminLayout"
import "./Analytics.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

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
      const response = await axios.get(`${API_URL}/api/analytics?period=${period}`, {
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
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="loading">Loading analytics data...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Analytics Dashboard">
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
                <div className="stat-icon-wrapper" style={{ color: "#FF9800", background: "rgba(255, 152, 0, 0.1)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <h3>Total Orders</h3>
                <p className="stat-value">{analytics.totalOrders}</p>
                <span className="stat-label">Orders placed</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ color: "#4CAF50", background: "rgba(76, 175, 80, 0.1)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatCurrency(analytics.totalRevenue)}</p>
                <span className="stat-label">Total earnings</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ color: "#2196F3", background: "rgba(33, 150, 243, 0.1)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 20h20"></path>
                    <path d="M5 20V4"></path>
                    <path d="M11 20v-8"></path>
                    <path d="M17 20V8"></path>
                  </svg>
                </div>
                <h3>Average Order Value</h3>
                <p className="stat-value">{formatCurrency(analytics.averageOrderValue)}</p>
                <span className="stat-label">Per order</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ color: "#9C27B0", background: "rgba(156, 39, 176, 0.1)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3>Completed Orders</h3>
                <p className="stat-value">{analytics.ordersByStatus.paid || 0}</p>
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
                            "rgba(255, 107, 53, 0.8)", // Primary
                            "rgba(42, 27, 20, 0.8)",   // Secondary
                            "rgba(76, 175, 80, 0.8)",  // Green
                            "rgba(156, 39, 176, 0.8)",
                            "rgba(0, 188, 212, 0.8)",
                            "rgba(244, 67, 54, 0.8)",
                          ],
                          borderColor: "transparent",
                          borderWidth: 0,
                          hoverOffset: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              family: "'Inter', sans-serif",
                              size: 13,
                              weight: '500'
                            }
                          }
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
                        labels: analytics.topItems.map((item) => item.name.substring(0, 15) + (item.name.length > 15 ? '...' : '')),
                        datasets: [
                          {
                            label: "Quantity Sold",
                            data: analytics.topItems.map((item) => item.quantity),
                            backgroundColor: "rgba(255, 107, 53, 0.85)", // Primary color
                            borderRadius: 6,
                            barPercentage: 0.6,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          x: {
                            grid: { display: false },
                            ticks: { font: { family: "'Inter', sans-serif" } }
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: "rgba(42, 27, 20, 0.05)",
                            },
                            ticks: {
                              stepSize: 1,
                              font: { family: "'Inter', sans-serif" }
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
                          backgroundColor: "rgba(76, 175, 80, 0.15)", // Greenish tint
                          borderColor: "rgba(76, 175, 80, 1)",
                          borderWidth: 3,
                          tension: 0.4, // Smooth curves
                          pointRadius: 4,
                          pointBackgroundColor: "#fff",
                          pointBorderColor: "rgba(76, 175, 80, 1)",
                          pointBorderWidth: 2,
                          pointHoverRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "rgba(42, 27, 20, 0.9)",
                          titleFont: { family: "'Inter', sans-serif", size: 13 },
                          bodyFont: { family: "'Inter', sans-serif", size: 14, weight: 'bold' },
                          padding: 12,
                          callbacks: {
                            label: function (context) {
                              return ` Revenue: ₹${context.parsed.y.toFixed(2)}`
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { family: "'Inter', sans-serif" } }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: "rgba(42, 27, 20, 0.05)",
                          },
                          ticks: {
                            font: { family: "'Inter', sans-serif" },
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
    </AdminLayout>
  )
}

export default Analytics
