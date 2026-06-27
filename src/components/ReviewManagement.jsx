"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import NotificationBell from "./NotificationBell"
import "./ReviewManagement.css"

function ReviewManagement() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, approved, pending
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setReviews(response.data)
    } catch (error) {
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, approved) => {
    try {
      await axios.put(
        `${API_URL}/api/reviews/${id}/approve`,
        { approved },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Review ${approved ? "approved" : "rejected"} successfully`)
      fetchReviews()
    } catch (error) {
      toast.error("Failed to update review")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    try {
      await axios.delete(`${API_URL}/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Review deleted successfully")
      fetchReviews()
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const filteredReviews = reviews.filter((review) => {
    if (filter === "approved") return review.approved
    if (filter === "pending") return !review.approved
    return true
  })

  return (
    <div className="review-management-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Review Management</h1>
          <div className="header-buttons">
            <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
              Dashboard
            </button>
            <button className="menu-btn" onClick={() => navigate("/menu-management")}>
              Menu
            </button>
            <button className="offers-btn" onClick={() => navigate("/offer-management")}>
              Offers
            </button>
            <button className="analytics-btn" onClick={() => navigate("/analytics")}>
              Analytics
            </button>
            <NotificationBell />
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="review-management-content">
        <div className="filter-section">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All Reviews ({reviews.length})
          </button>
          <button className={filter === "approved" ? "active" : ""} onClick={() => setFilter("approved")}>
            Approved ({reviews.filter((r) => r.approved).length})
          </button>
          <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>
            Pending ({reviews.filter((r) => !r.approved).length})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews found</p>
          </div>
        ) : (
          <div className="reviews-grid-admin">
            {filteredReviews.map((review) => (
              <div key={review._id} className={`review-card-admin ${review.approved ? "approved" : "pending"}`}>
                <div className="review-header-admin">
                  <div className="review-user">
                    <div className="user-avatar">{review.userName.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="user-name">{review.userName}</p>
                      <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="review-rating-admin">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`star ${star <= review.rating ? "filled" : ""}`}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className="review-comment-admin">{review.comment}</p>

                <div className="review-actions-admin">
                  <div className="status-badge-admin">
                    {review.approved ? (
                      <span className="approved-badge">✓ Approved</span>
                    ) : (
                      <span className="pending-badge">⏳ Pending</span>
                    )}
                  </div>
                  <div className="action-buttons">
                    {!review.approved && (
                      <button className="approve-btn" onClick={() => handleApprove(review._id, true)}>
                        Approve
                      </button>
                    )}
                    {review.approved && (
                      <button className="reject-btn" onClick={() => handleApprove(review._id, false)}>
                        Reject
                      </button>
                    )}
                    <button className="delete-btn-admin" onClick={() => handleDelete(review._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewManagement
