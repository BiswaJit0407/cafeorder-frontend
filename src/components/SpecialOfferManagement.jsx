"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import "./SpecialOfferManagement.css"

function SpecialOfferManagement() {
  const [offers, setOffers] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    offerType: "combo",
    items: [],
    originalPrice: "",
    offerPrice: "",
    image: "",
    validDays: [],
    bogoType: "",
    percentageOff: "",
    customRules: "",
    badgeText: "",
  })
  const [selectedItems, setSelectedItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const offerTypes = [
    { value: "combo", label: "Combo Deal", description: "Multiple items bundled together" },
    { value: "weekend", label: "Weekend Special", description: "Available on specific days" },
    { value: "bogo", label: "Buy One Get One", description: "BOGO offers" },
    { value: "percentage", label: "Percentage Off", description: "Discount by percentage" },
    { value: "custom", label: "Custom Offer", description: "Create your own offer" },
  ]

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const bogoTypes = [
    { value: "buy1get1free", label: "Buy 1 Get 1 Free" },
    { value: "buy1get1", label: "Buy 1 Get 1 (50% off)" },
    { value: "buy2get1", label: "Buy 2 Get 1 Free" },
  ]

  useEffect(() => {
    fetchOffers()
    fetchMenuItems()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/special-offers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOffers(response.data)
    } catch (error) {
      toast.error("Failed to load special offers")
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMenuItems(response.data)
    } catch (error) {
      toast.error("Failed to load menu items")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation based on offer type
    if ((formData.offerType === "combo" || formData.offerType === "bogo") && selectedItems.length === 0) {
      toast.error("Please select at least one item")
      return
    }

    if (formData.offerType === "weekend" && formData.validDays.length === 0) {
      toast.error("Please select at least one day for weekend offer")
      return
    }

    const offerData = {
      ...formData,
      items: selectedItems,
      originalPrice: parseFloat(formData.originalPrice),
      offerPrice: parseFloat(formData.offerPrice),
      percentageOff: formData.percentageOff ? parseFloat(formData.percentageOff) : null,
      bogoType: formData.bogoType || null,
      customRules: formData.customRules || null,
      badgeText: formData.badgeText || null,
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/special-offers/${editingId}`, offerData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Special offer updated successfully")
      } else {
        await axios.post(`${API_URL}/api/special-offers`, offerData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Special offer created successfully")
      }

      resetForm()
      fetchOffers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save special offer")
    }
  }

  const handleEdit = (offer) => {
    setEditingId(offer._id)
    setFormData({
      name: offer.name,
      description: offer.description,
      offerType: offer.offerType,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      image: offer.image,
      validDays: offer.validDays || [],
      bogoType: offer.bogoType || "",
      percentageOff: offer.percentageOff || "",
      customRules: offer.customRules || "",
      badgeText: offer.badgeText || "",
    })
    setSelectedItems(offer.items || [])
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this special offer?")) return

    try {
      await axios.delete(`${API_URL}/api/special-offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Special offer deleted successfully")
      fetchOffers()
    } catch (error) {
      toast.error("Failed to delete special offer")
    }
  }

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/special-offers/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Special offer status updated")
      fetchOffers()
    } catch (error) {
      toast.error("Failed to update special offer status")
    }
  }

  const addItemToOffer = (menuItem) => {
    const exists = selectedItems.find((item) => item.menuItemId === menuItem._id)
    if (exists) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.menuItemId === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: 1,
        },
      ])
    }
  }

  const removeItemFromOffer = (menuItemId) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId))
  }

  const updateItemQuantity = (menuItemId, quantity) => {
    if (quantity === 0) {
      removeItemFromOffer(menuItemId)
    } else {
      setSelectedItems(
        selectedItems.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity } : item))
      )
    }
  }

  const toggleDay = (day) => {
    if (formData.validDays.includes(day)) {
      setFormData({ ...formData, validDays: formData.validDays.filter((d) => d !== day) })
    } else {
      setFormData({ ...formData, validDays: [...formData.validDays, day] })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      offerType: "combo",
      originalPrice: "",
      offerPrice: "",
      image: "",
      validDays: [],
      bogoType: "",
      percentageOff: "",
      customRules: "",
      badgeText: "",
    })
    setSelectedItems([])
    setEditingId(null)
    setShowForm(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        try {
          const response = await axios.post(
            `${API_URL}/api/upload`,
            { image: reader.result },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )

          setFormData({ ...formData, image: response.data.url })
          toast.success("Image uploaded successfully!")
        } catch (error) {
          toast.error("Failed to upload image")
        } finally {
          setUploading(false)
        }
      }
      reader.onerror = () => {
        toast.error("Failed to read image file")
        setUploading(false)
      }
    } catch (error) {
      toast.error("Failed to upload image")
      setUploading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const getOfferTypeLabel = (type) => {
    const offerType = offerTypes.find((t) => t.value === type)
    return offerType ? offerType.label : type
  }

  return (
    <div className="special-offer-management-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Special Offers Management</h1>
          <div className="header-buttons">
            <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
              Dashboard
            </button>
            <button className="menu-btn" onClick={() => navigate("/menu-management")}>
              Menu
            </button>
            <button className="coupons-btn" onClick={() => navigate("/offer-management")}>
              Coupons
            </button>
            <button className="reviews-btn" onClick={() => navigate("/review-management")}>
              Reviews
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="special-offer-management-content">
        <button className="create-offer-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create New Special Offer"}
        </button>

        {showForm && (
          <div className="offer-form-section">
            <h2>{editingId ? "Edit Special Offer" : "Create New Special Offer"}</h2>
            <form onSubmit={handleSubmit} className="offer-form">
              {/* Offer Type Selection */}
              <div className="form-group">
                <label>Offer Type *</label>
                <div className="offer-type-grid">
                  {offerTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`offer-type-card ${formData.offerType === type.value ? "selected" : ""}`}
                      onClick={() => setFormData({ ...formData, offerType: type.value })}
                    >
                      <h4>{type.label}</h4>
                      <p>{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label>Offer Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Weekend Burger Special"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Offer Image</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="offer-image-upload"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="offer-image-upload" className="upload-btn">
                    {uploading ? "Uploading..." : "📷 Upload Image"}
                  </label>
                  <span className="upload-hint">or</span>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL"
                    className="image-url-input"
                  />
                </div>
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  required
                  placeholder="Describe your special offer..."
                />
              </div>

              {/* Pricing */}
              <div className="form-row">
                <div className="form-group">
                  <label>Original Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Offer Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Conditional Fields Based on Offer Type */}
              
              {/* Weekend Offer - Day Selection */}
              {formData.offerType === "weekend" && (
                <div className="form-group">
                  <label>Valid Days *</label>
                  <div className="days-selection">
                    {weekDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${formData.validDays.includes(day) ? "selected" : ""}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BOGO Type Selection */}
              {formData.offerType === "bogo" && (
                <div className="form-group">
                  <label>BOGO Type *</label>
                  <select
                    value={formData.bogoType}
                    onChange={(e) => setFormData({ ...formData, bogoType: e.target.value })}
                    required
                  >
                    <option value="">Select BOGO Type</option>
                    {bogoTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Percentage Off */}
              {formData.offerType === "percentage" && (
                <div className="form-group">
                  <label>Percentage Off (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentageOff}
                    onChange={(e) => setFormData({ ...formData, percentageOff: e.target.value })}
                    required
                    placeholder="e.g., 20"
                  />
                </div>
              )}

              {/* Custom Rules */}
              {formData.offerType === "custom" && (
                <div className="form-group">
                  <label>Custom Rules</label>
                  <textarea
                    value={formData.customRules}
                    onChange={(e) => setFormData({ ...formData, customRules: e.target.value })}
                    rows="3"
                    placeholder="Describe the custom offer rules..."
                  />
                </div>
              )}

              {/* Badge Text */}
              <div className="form-group">
                <label>Badge Text (Optional)</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  placeholder="Leave empty for auto-generated badge"
                />
              </div>

              {/* Item Selection for Combo and BOGO */}
              {(formData.offerType === "combo" || formData.offerType === "bogo") && (
                <div className="offer-items-section">
                  <h3>Select Items for Offer</h3>
                  <div className="menu-items-grid">
                    {menuItems.map((item) => (
                      <div key={item._id} className="menu-item-select" onClick={() => addItemToOffer(item)}>
                        <img src={item.image} alt={item.name} />
                        <p>{item.name}</p>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="selected-items">
                      <h4>Selected Items:</h4>
                      {selectedItems.map((item) => (
                        <div key={item.menuItemId} className="selected-item">
                          <span>{item.name}</span>
                          <div className="quantity-controls">
                            <button type="button" onClick={() => updateItemQuantity(item.menuItemId, item.quantity - 1)}>
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => updateItemQuantity(item.menuItemId, item.quantity + 1)}>
                              +
                            </button>
                          </div>
                          <button type="button" onClick={() => removeItemFromOffer(item.menuItemId)} className="remove-item">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingId ? "Update Offer" : "Create Offer"}
                </button>
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="offers-list">
          <h2>All Special Offers</h2>
          {offers.length === 0 ? (
            <p className="no-offers">No special offers created yet</p>
          ) : (
            <div className="offers-grid">
              {offers.map((offer) => (
                <div key={offer._id} className={`offer-card ${!offer.active ? "inactive" : ""}`}>
                  <div className="offer-badge-display">{offer.badgeText}</div>
                  <img src={offer.image} alt={offer.name} className="offer-image" />
                  <div className="offer-content">
                    <div className="offer-type-label">{getOfferTypeLabel(offer.offerType)}</div>
                    <h3>{offer.name}</h3>
                    <p>{offer.description}</p>
                    
                    {offer.items && offer.items.length > 0 && (
                      <div className="offer-items-list">
                        <strong>Items:</strong>
                        <ul>
                          {offer.items.map((item, index) => (
                            <li key={index}>
                              {item.name} x{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {offer.validDays && offer.validDays.length > 0 && (
                      <div className="offer-valid-days">
                        <strong>Valid on:</strong> {offer.validDays.join(", ")}
                      </div>
                    )}

                    <div className="offer-pricing">
                      <span className="original-price">₹{offer.originalPrice}</span>
                      <span className="offer-price">₹{offer.offerPrice}</span>
                      <span className="discount-badge">{offer.discount}% OFF</span>
                    </div>

                    <div className="offer-actions">
                      <button onClick={() => handleToggle(offer._id)} className={offer.active ? "deactivate-btn" : "activate-btn"}>
                        {offer.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleEdit(offer)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(offer._id)} className="delete-btn">
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

export default SpecialOfferManagement
