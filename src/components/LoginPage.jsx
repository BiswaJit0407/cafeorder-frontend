"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import "./Auth.css"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    if (!password) {
      toast.error("Password is required")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      })

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      toast.success(`Welcome back, ${response.data.user.name}!`)

      setTimeout(() => {
        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard")
        } else {
          navigate("/user-menu")
        }
      }, 500)
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo-container">
          <div className="auth-logo">☕</div>
        </div>
        <h1>Login your account</h1>
        <h2>Log in to manage your orders</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <a href="/register">Sign Up</a>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
