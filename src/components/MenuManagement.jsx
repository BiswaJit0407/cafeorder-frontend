"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import "./MenuManagement.css"

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    image: "",
    available: true,
  })
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()

  const categories = ["Appetizer", "Main Course", "Dessert", "Beverage", "Special"]

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMenuItems(response.data)
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
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
    setError("")

    if (!formData.name || !formData.description || !formData.price) {
      setError("Please fill in all required fields")
      return
    }

    try {
      if (editingItem) {
        await axios.put(
          `${API_URL}/api/menu/${editingItem._id}`,
          {
            ...formData,
            price: Number(formData.price),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        alert("Menu item updated successfully!")
      } else {
        await axios.post(
          `${API_URL}/api/menu`,
          {
            ...formData,
            price: Number(formData.price),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        alert("Menu item added successfully!")
      }

      resetForm()
      fetchMenuItems()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save menu item")
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || "",
      available: item.available,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      await axios.delete(`${API_URL}/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Menu item deleted successfully!")
      fetchMenuItems()
    } catch (error) {
      alert("Failed to delete menu item")
    }
  }

  const toggleAvailability = async (item) => {
    try {
      await axios.put(
        `${API_URL}/api/menu/${item._id}`,
        {
          ...item,
          available: !item.available,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      fetchMenuItems()
    } catch (error) {
      alert("Failed to update availability")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Main Course",
      image: "",
      available: true,
    })
    setEditingItem(null)
    setShowAddForm(false)
    setError("")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="menu-management-container">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>Menu Management</h1>
            <p>Welcome, {user?.name}</p>
          </div>
          <div className="header-buttons">
            <button className="dashboard-btn" onClick={() => navigate("/admin-dashboard")}>
              Orders
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

      <div className="menu-management-content">
        <div className="actions-bar">
          <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "+ Add New Item"}
          </button>
        </div>

        {showAddForm && (
          <div className="form-card">
            <h2>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                  />
                  Available for customers
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="menu-items-list">
          <h2>Menu Items ({menuItems.length})</h2>
          <div className="items-grid">
            {menuItems.map((item) => (
              <div key={item._id} className={`item-card ${!item.available ? "unavailable" : ""}`}>
                {item.image && <img src={item.image} alt={item.name} className="item-image" />}
                <div className="item-content">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="item-price">₹{item.price}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <span className="item-category">{item.category}</span>
                  <div className="item-status">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={() => toggleAvailability(item)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span>{item.available ? "Available" : "Unavailable"}</span>
                  </div>
                  <div className="item-actions">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuManagement
