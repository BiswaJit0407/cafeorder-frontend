"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import "./ComboManagement.css"

function ComboManagement() {
  const [combos, setCombos] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    items: [],
    originalPrice: "",
    comboPrice: "",
    image: "",
  })
  const [selectedItems, setSelectedItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  useEffect(() => {
    fetchCombos()
    fetchMenuItems()
  }, [])

  const fetchCombos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/combos/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCombos(response.data)
    } catch (error) {
      toast.error("Failed to load combos")
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

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item for the combo")
      return
    }

    const comboData = {
      ...formData,
      items: selectedItems,
      originalPrice: parseFloat(formData.originalPrice),
      comboPrice: parseFloat(formData.comboPrice),
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/combos/${editingId}`, comboData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Combo updated successfully")
      } else {
        await axios.post(`${API_URL}/api/combos`, comboData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Combo created successfully")
      }

      resetForm()
      fetchCombos()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save combo")
    }
  }

  const handleEdit = (combo) => {
    setEditingId(combo._id)
    setFormData({
      name: combo.name,
      description: combo.description,
      originalPrice: combo.originalPrice,
      comboPrice: combo.comboPrice,
      image: combo.image,
    })
    setSelectedItems(combo.items)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this combo?")) return

    try {
      await axios.delete(`${API_URL}/api/combos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Combo deleted successfully")
      fetchCombos()
    } catch (error) {
      toast.error("Failed to delete combo")
    }
  }

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/combos/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Combo status updated")
      fetchCombos()
    } catch (error) {
      toast.error("Failed to update combo status")
    }
  }

  const addItemToCombo = (menuItem) => {
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

  const removeItemFromCombo = (menuItemId) => {
    setSelectedItems(selectedItems.filter((item) => item.menuItemId !== menuItemId))
  }

  const updateItemQuantity = (menuItemId, quantity) => {
    if (quantity === 0) {
      removeItemFromCombo(menuItemId)
    } else {
      setSelectedItems(
        selectedItems.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity } : item))
      )
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      originalPrice: "",
      comboPrice: "",
      image: "",
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
      // Convert file to base64
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

  return (
    <div className="combo-management-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>Combo Management</h1>
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
            <button className="reviews-btn" onClick={() => navigate("/review-management")}>
              Reviews
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="combo-management-content">
        <button className="create-combo-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create New Combo"}
        </button>

        {showForm && (
          <div className="combo-form-section">
            <h2>{editingId ? "Edit Combo" : "Create New Combo"}</h2>
            <form onSubmit={handleSubmit} className="combo-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Combo Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Combo Image</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    id="combo-image-upload"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="combo-image-upload" className="upload-btn">
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
                />
              </div>

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
                  <label>Combo Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comboPrice}
                    onChange={(e) => setFormData({ ...formData, comboPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="combo-items-section">
                <h3>Select Items for Combo</h3>
                <div className="menu-items-grid">
                  {menuItems.map((item) => (
                    <div key={item._id} className="menu-item-select" onClick={() => addItemToCombo(item)}>
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
                        <button type="button" onClick={() => removeItemFromCombo(item.menuItemId)} className="remove-item">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingId ? "Update Combo" : "Create Combo"}
                </button>
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="combos-list">
          <h2>All Combos</h2>
          {combos.length === 0 ? (
            <p className="no-combos">No combos created yet</p>
          ) : (
            <div className="combos-grid">
              {combos.map((combo) => (
                <div key={combo._id} className={`combo-card ${!combo.active ? "inactive" : ""}`}>
                  <img src={combo.image} alt={combo.name} className="combo-image" />
                  <div className="combo-content">
                    <h3>{combo.name}</h3>
                    <p>{combo.description}</p>
                    <div className="combo-items-list">
                      <strong>Items:</strong>
                      <ul>
                        {combo.items.map((item, index) => (
                          <li key={index}>
                            {item.name} x{item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="combo-pricing">
                      <span className="original-price">₹{combo.originalPrice}</span>
                      <span className="combo-price">₹{combo.comboPrice}</span>
                      <span className="discount-badge">{combo.discount}% OFF</span>
                    </div>
                    <div className="combo-actions">
                      <button onClick={() => handleToggle(combo._id)} className={combo.active ? "deactivate-btn" : "activate-btn"}>
                        {combo.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleEdit(combo)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(combo._id)} className="delete-btn">
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

export default ComboManagement
