"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import "./UserReviews.css"

function UserReviews() {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyReviews()
  }, [])

  const fetchMyReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reviews/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setReviews(response.data)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!comment.trim()) {
      toast.error("Please write a comment")
      return
    }

    setLoading(true)

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/reviews/${editingId}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success("Review updated successfully!")
        setEditingId(null)
      } else {
        await axios.post(
          `${API_URL}/api/reviews`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success("Review added successfully!")
      }

      setRating(0)
      setComment("")
      fetchMyReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (review) => {
    setEditingId(review._id)
    setRating(review.rating)
    setComment(review.comment)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    try {
      await axios.delete(`${API_URL}/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Review deleted successfully")
      fetchMyReviews()
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="user-reviews-container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>My Reviews</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="menu-btn" onClick={() => navigate("/user-menu")}>
              Menu
            </button>
            <button className="orders-btn" onClick={() => navigate("/my-orders")}>
              My Orders
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-content">
        <div className="review-form-section">
          <h2>{editingId ? "Edit Your Review" : "Write a Review"}</h2>
          <form onSubmit={handleSubmit} className="review-form">
            <div className="rating-input">
              <label>Your Rating:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? "active" : ""}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="comment-input">
              <label>Your Review:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with us..."
                rows="5"
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Submitting..." : editingId ? "Update Review" : "Submit Review"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setRating(0)
                    setComment("")
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="my-reviews-section">
          <h2>Your Previous Reviews</h2>
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>You haven't written any reviews yet.</p>
              <span>Share your experience with us!</span>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`star ${star <= review.rating ? "filled" : ""}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-footer">
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    <div className="review-actions">
                      <button onClick={() => handleEdit(review)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(review._id)} className="delete-btn">
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
    </div>
  )
}

export default UserReviews
