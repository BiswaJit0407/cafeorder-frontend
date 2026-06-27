import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import AdminLayout from "./AdminLayout"
import "./AdminSettings.css"

function AdminSettings() {
  const [settings, setSettings] = useState({
    loyaltyEnabled: false,
    spendPerPoint: 100,
    pointValue: 1,
    minPointsToRedeem: 50,
    maxRedemptionPercentage: 50
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data && response.data._id) {
        setSettings(response.data)
      }
    } catch (error) {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : Number(value)
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put(`${API_URL}/api/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="System Settings">
        <div className="loading-state">Loading settings...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="System Settings">
      <div className="settings-container">
        
        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-section">
            <div className="section-header">
              <h2>Loyalty & Rewards Program</h2>
              <label className="toggle-switch large">
                <input
                  type="checkbox"
                  name="loyaltyEnabled"
                  checked={settings.loyaltyEnabled}
                  onChange={handleInputChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <p className="section-description">
              Enable the digital wallet for customers to earn points on every order.
            </p>

            <div className={`settings-grid ${!settings.loyaltyEnabled ? 'disabled' : ''}`}>
              
              <div className="form-group">
                <label>Earning Rule (Spend ₹ to get 1 point)</label>
                <div className="input-with-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    name="spendPerPoint"
                    value={settings.spendPerPoint}
                    onChange={handleInputChange}
                    min="1"
                    disabled={!settings.loyaltyEnabled}
                  />
                </div>
                <small>
                  E.g. If set to {settings.spendPerPoint || 0}, a ₹500 order earns {Math.floor(500 / (settings.spendPerPoint || 1))} points.
                </small>
              </div>

              <div className="form-group">
                <label>Redemption Value (1 point = ₹)</label>
                <div className="input-with-prefix">
                  <span>₹</span>
                  <input
                    type="number"
                    name="pointValue"
                    value={settings.pointValue}
                    onChange={handleInputChange}
                    min="0.1"
                    step="0.1"
                    disabled={!settings.loyaltyEnabled}
                  />
                </div>
                <small>
                  E.g. If set to {settings.pointValue || 0}, then 50 points gives a ₹{((settings.pointValue || 0) * 50).toFixed(2).replace(/\.00$/, '')} discount.
                </small>
              </div>

              <div className="form-group">
                <label>Minimum Points to Redeem</label>
                <input
                  type="number"
                  name="minPointsToRedeem"
                  value={settings.minPointsToRedeem}
                  onChange={handleInputChange}
                  min="1"
                  disabled={!settings.loyaltyEnabled}
                />
                <small>Users cannot use points until they reach this balance.</small>
              </div>

              <div className="form-group">
                <label>Max Redemption Cap (%)</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    name="maxRedemptionPercentage"
                    value={settings.maxRedemptionPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    disabled={!settings.loyaltyEnabled}
                  />
                  <span>%</span>
                </div>
                <small>Max % of a bill that can be paid using points (100% = full meal).</small>
              </div>

            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-settings-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

      </div>
    </AdminLayout>
  )
}

export default AdminSettings
