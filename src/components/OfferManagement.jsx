"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import "./OfferManagement.css"

function OfferManagement() {
  const [coupons, setCoupons] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    active: true,
  })
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCoupons(response.data)
    } catch (error) {
      toast.error("Failed to load coupons")
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      }

      if (editingCoupon) {
        await axios.put(`${API_URL}/api/coupons/${editingCoupon._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Coupon updated successfully!")
      } else {
        await axios.post(`${API_URL}/api/coupons`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Coupon created successfully!")
      }

      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save coupon")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || "",
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit || "",
      active: coupon.active,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return
    }

    const toastId = toast.loading("Deleting coupon...")

    try {
      await axios.delete(`${API_URL}/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.update(toastId, {
        render: "Coupon deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      })
      fetchCoupons()
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to delete coupon",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const toggleActive = async (coupon) => {
    const toastId = toast.loading("Updating coupon status...")

    try {
      await axios.put(
        `${API_URL}/api/coupons/${coupon._id}`,
        { ...coupon, active: !coupon.active },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.update(toastId, {
        render: "Coupon status updated!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      })
      fetchCoupons()
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to update status",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscount: "",
      validFrom: "",
      validUntil: "",
      usageLimit: "",
      active: true,
    })
    setEditingCoupon(null)
    setShowAddForm(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const isExpired = (date) => new Date(date) < new Date()
  const isActive = (coupon) => {
    const now = new Date()
    return coupon.active && new Date(coupon.validFrom) <= now && new Date(coupon.validUntil) >= now
  }

  return (
    <div className="offer-management-container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Offer Management</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
              Orders
            </button>
            <button className="menu-btn" onClick={() => navigate("/menu-management")}>
              Menu
            </button>
            <button className="analytics-btn" onClick={() => navigate("/analytics")}>
              Analytics
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="offer-management-content">
        <div className="actions-bar">
          <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "+ Create New Offer"}
          </button>
        </div>

        {showAddForm && (
          <div className="form-card">
            <h2>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SAVE20"
                    required
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Type *</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Get 20% off on orders above ₹500"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Min Order Amount (₹)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.discountType === "percentage" && (
                <div className="form-group">
                  <label>Max Discount (₹) - Optional</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="No limit"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From *</label>
                  <input
                    type="datetime-local"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Valid Until *</label>
                  <input
                    type="datetime-local"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Usage Limit (Optional)</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Unlimited"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="coupons-list">
          <h2>All Coupons ({coupons.length})</h2>
          <div className="coupons-grid">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className={`coupon-card ${!isActive(coupon) ? "inactive" : ""} ${
                  isExpired(coupon.validUntil) ? "expired" : ""
                }`}
              >
                <div className="coupon-header">
                  <div className="coupon-code-badge">{coupon.code}</div>
                  <div className="coupon-status">
                    {isExpired(coupon.validUntil) ? (
                      <span className="status-expired">Expired</span>
                    ) : isActive(coupon) ? (
                      <span className="status-active">Active</span>
                    ) : (
                      <span className="status-inactive">Inactive</span>
                    )}
                  </div>
                </div>

                <p className="coupon-description">{coupon.description}</p>

                <div className="coupon-details">
                  <div className="detail-item">
                    <span className="detail-label">Discount:</span>
                    <span className="detail-value">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      {coupon.maxDiscount && ` (Max: ₹${coupon.maxDiscount})`}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Min Order:</span>
                    <span className="detail-value">₹{coupon.minOrderAmount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Valid:</span>
                    <span className="detail-value">
                      {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Usage:</span>
                    <span className="detail-value">
                      {coupon.usedCount} / {coupon.usageLimit || "∞"}
                    </span>
                  </div>
                </div>

                <div className="coupon-toggle">
                  <label className="toggle-switch">
                    <input type="checkbox" checked={coupon.active} onChange={() => toggleActive(coupon)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span>{coupon.active ? "Active" : "Inactive"}</span>
                </div>

                <div className="coupon-actions">
                  <button className="edit-btn" onClick={() => handleEdit(coupon)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(coupon._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfferManagement
