"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../config/api"
import "./Auth.css"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      })

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      if (response.data.user.role === "admin") {
        navigate("/admin-dashboard")
      } else {
        navigate("/user-menu")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Restaurant Order System</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
