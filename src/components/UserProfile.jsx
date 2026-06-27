import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../config/api"
import UserLayout from "./UserLayout"
import "./UserProfile.css"

function UserProfile() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")
  
  const [loyaltyData, setLoyaltyData] = useState({ points: 0, transactions: [] })
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false)
  const [pointValue, setPointValue] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await axios.get(`${API_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (settingsRes.data?.loyaltyEnabled) {
          setLoyaltyEnabled(true)
          setPointValue(settingsRes.data.pointValue || 1)
          
          const loyaltyRes = await axios.get(`${API_URL}/api/loyalty/my-loyalty`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setLoyaltyData({
            points: loyaltyRes.data.loyaltyPoints || 0,
            transactions: loyaltyRes.data.transactions || []
          })
        }
      } catch (err) {
        console.error("Failed to load profile data", err)
      }
    }
    
    if (token) {
      fetchData()
    }
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <UserLayout title="My Profile" showCart={false}>
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-header-accent"></div>
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email-sub">{user?.email}</p>
          
          <div className="profile-details-grid">
            <div className="detail-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <div>
                <label>Account Role</label>
                <p className="role-badge">{user?.role?.toUpperCase()}</p>
              </div>
            </div>

            {user?.tableNumber && (
              <div className="detail-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <div>
                  <label>Default Table</label>
                  <p>Table #{user?.tableNumber}</p>
                </div>
              </div>
            )}
          </div>

          {loyaltyEnabled && (
            <div className="loyalty-wallet">
              <div className="loyalty-header">
                <h3>My Rewards Wallet</h3>
                <div className="loyalty-balance">
                  <span className="points">{loyaltyData.points} pts</span>
                  <span className="value">≈ ₹{(loyaltyData.points * pointValue).toFixed(2).replace(/\.00$/, '')}</span>
                </div>
              </div>
              
              {loyaltyData.transactions.length > 0 && (
                <div className="loyalty-transactions">
                  <h4>Recent Activity</h4>
                  <ul>
                    {loyaltyData.transactions.slice(0, 5).map(tx => (
                      <li key={tx._id} className={tx.points > 0 ? "earned" : "redeemed"}>
                        <div className="tx-info">
                          <span className="tx-desc">{tx.description}</span>
                          <span className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="tx-points">{tx.points > 0 ? "+" : ""}{tx.points}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button className="profile-logout-btn-large" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </UserLayout>
  )
}

export default UserProfile
