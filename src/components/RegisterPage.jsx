"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import "./Auth.css"

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    tableNumber: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        tableNumber: formData.tableNumber ? Number.parseInt(formData.tableNumber) : null,
        role: "user",
      })

      console.log("Registration successful:", response.data)

      // Show success message and redirect to login
      alert("Registration successful! Please login to continue.")
      
      // Navigate to login page
      navigate("/login")
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Restaurant Order System</h1>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="tableNumber"
            placeholder="Table Number (Optional)"
            value={formData.tableNumber}
            onChange={handleChange}
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
