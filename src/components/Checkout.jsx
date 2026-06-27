"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
import UserLayout from "./UserLayout"
import "./Checkout.css"

function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cart: initialCart } = location.state || { cart: [] }
  
  const [cart, setCart] = useState(initialCart)
  const [tableNumber, setTableNumber] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [loading, setLoading] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCoupons, setShowCoupons] = useState(false)
  const [availableTables, setAvailableTables] = useState([])
  const [myTable, setMyTable] = useState(null)
  
  // Loyalty State
  const [loyaltySettings, setLoyaltySettings] = useState(null)
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(0)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)
  
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty")
      navigate("/user-menu")
      return
    }

    if (user?.tableNumber) {
      setTableNumber(user.tableNumber)
    }

    fetchTables()
    fetchAvailableCoupons()
    fetchLoyaltyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTables = async () => {
    try {
      const myRes = await axios.get(`${API_URL}/api/tables/my-table`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (myRes.data.table) {
        setMyTable(myRes.data.table)
        setTableNumber(myRes.data.table.tableNumber)
      } else {
        const availRes = await axios.get(`${API_URL}/api/tables/available`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAvailableTables(availRes.data)
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error)
    }
  }

  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/coupons/active`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAvailableCoupons(response.data)
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
    }
  }

  const fetchLoyaltyData = async () => {
    try {
      const settingsRes = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (settingsRes.data?.loyaltyEnabled) {
        setLoyaltySettings(settingsRes.data)
        const loyaltyRes = await axios.get(`${API_URL}/api/loyalty/my-loyalty`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUserLoyaltyPoints(loyaltyRes.data.loyaltyPoints || 0)
      }
    } catch (err) {
      console.error("Failed to fetch loyalty data", err)
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() - discount - loyaltyDiscount
  }

  const handlePointsChange = (e) => {
    const points = Number(e.target.value)
    setPointsToRedeem(points)
    
    if (loyaltySettings) {
      setLoyaltyDiscount(Math.round((points * loyaltySettings.pointValue) * 100) / 100)
    }
  }

  const updateQuantity = (itemId, quantity) => {
    let newCart
    if (quantity === 0) {
      newCart = cart.filter((item) => item._id !== itemId)
    } else {
      newCart = cart.map((item) => (item._id === itemId ? { ...item, quantity } : item))
    }
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    
    // Reset coupon if cart changes
    if (appliedCoupon) {
      setAppliedCoupon(null)
      setDiscount(0)
      setCouponCode("")
    }
  }

  const removeItem = (itemId) => {
    const newCart = cart.filter((item) => item._id !== itemId)
    setCart(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    
    if (appliedCoupon) {
      setAppliedCoupon(null)
      setDiscount(0)
      setCouponCode("")
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setValidatingCoupon(true)

    try {
      const response = await axios.post(
        `${API_URL}/api/coupons/validate`,
        {
          code: couponCode,
          orderAmount: calculateSubtotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setAppliedCoupon(response.data.coupon)
      setDiscount(response.data.discount)
      toast.success(`Coupon applied! You saved ₹${response.data.discount}`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode("")
    toast.info("Coupon removed")
  }

  const selectCoupon = (coupon) => {
    setCouponCode(coupon.code)
    setShowCoupons(false)
    applyCoupon()
  }

  const placeOrder = async () => {
    if (!tableNumber) {
      toast.error("Please enter a table number")
      return
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setLoading(true)

    try {
      await axios.post(
        `${API_URL}/api/orders`,
        {
          tableNumber: Number.parseInt(tableNumber),
          items: cart.map((item) => ({
            menuItemId: item._id,
            quantity: item.quantity,
          })),
          specialInstructions,
          couponCode: appliedCoupon?.code || null,
          discount: discount,
          redeemPoints: pointsToRedeem > 0 ? pointsToRedeem : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Clear cart from localStorage after successful order
      localStorage.removeItem("cart")
      
      toast.success("Order placed successfully!")
      setTimeout(() => {
        navigate("/my-orders")
      }, 1500)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order")
      setLoading(false)
    }
  }

  if (!cart || cart.length === 0) {
    return null
  }

  return (
    <UserLayout title="Checkout" showCart={false}>
      <div className="checkout-content">
        <div className="checkout-main">
          <div className="cart-items-section">
            <h2>Order Items ({cart.length})</h2>
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item._id} className="checkout-item">
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">₹{item.price}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="item-total">₹{item.price * item.quantity}</div>
                  <button className="remove-item-btn" onClick={() => removeItem(item._id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="order-details-section">
            <h2>Order Details</h2>
            <div className="form-group">
              <label>Table Number *</label>
              {myTable ? (
                <div className="locked-table-message">
                  <p style={{ color: "var(--primary-color)", fontWeight: "600", marginBottom: "0.5rem" }}>
                    You are currently seated at {myTable.name} (Table {myTable.tableNumber}).
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-gray)" }}>
                    You must settle your current bill before you can switch tables.
                  </p>
                </div>
              ) : (
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                >
                  <option value="">Select an available table...</option>
                  {availableTables.map(table => (
                    <option key={table._id} value={table.tableNumber}>
                      {table.name} (Table {table.tableNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Special Instructions (Optional)</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (e.g., no onions, extra spicy)"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="coupon-section">
            <h3>Have a Coupon?</h3>
            {!appliedCoupon ? (
              <>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER COUPON CODE"
                  />
                  <button className="apply-btn" onClick={applyCoupon} disabled={validatingCoupon}>
                    {validatingCoupon ? "Validating..." : "Apply"}
                  </button>
                </div>
                
                {availableCoupons.length > 0 && (
                  <button className="check-available-btn" onClick={() => setShowCoupons(!showCoupons)}>
                    {showCoupons ? "Hide Available Offers" : "Check Available Offers"}
                  </button>
                )}
                
                {showCoupons && availableCoupons.length > 0 && (
                  <div className="coupons-list">
                    {availableCoupons.map((coupon) => (
                      <div key={coupon._id} className="coupon-item" onClick={() => selectCoupon(coupon)}>
                        <div className="coupon-item-header">
                          <span className="coupon-item-code">{coupon.code}</span>
                          <span className="coupon-item-discount">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                        </div>
                        <p className="coupon-item-desc">{coupon.description}</p>
                        <p className="coupon-item-min">Min order: ₹{coupon.minOrderAmount}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="applied-coupon">
                <div className="coupon-info">
                  <span className="coupon-code">{appliedCoupon.code}</span>
                  <span className="coupon-desc">{appliedCoupon.description}</span>
                </div>
                <button className="remove-coupon-btn" onClick={removeCoupon}>
                  Remove
                </button>
              </div>
            )}
          </div>

          {loyaltySettings && (
            <div className="loyalty-checkout-section" style={{ background: "var(--bg-card)", padding: "1.5rem", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", border: "1px solid rgba(42, 27, 20, 0.05)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontFamily: "var(--font-heading)", fontSize: "1.1rem" }}>Redeem Rewards</h3>
              
              {userLoyaltyPoints >= loyaltySettings.minPointsToRedeem ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    <span>Available Points: <strong>{userLoyaltyPoints}</strong></span>
                    <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>₹{loyaltyDiscount} OFF</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={Math.min(userLoyaltyPoints, Math.floor((calculateSubtotal() * (loyaltySettings.maxRedemptionPercentage / 100)) / loyaltySettings.pointValue))}
                    step="1"
                    value={pointsToRedeem}
                    onChange={handlePointsChange}
                    style={{ width: "100%", accentColor: "var(--primary-color)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-light)", marginTop: "0.5rem" }}>
                    <span>0</span>
                    <span>Using {pointsToRedeem} pts</span>
                    <span>Max</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem", background: "rgba(42, 27, 20, 0.02)", borderRadius: "var(--radius-md)", color: "var(--text-light)", fontSize: "0.9rem" }}>
                  <span style={{ fontSize: "1.2rem", display: "block", marginBottom: "0.5rem" }}>🔒</span>
                  You have <strong>{userLoyaltyPoints}</strong> points. <br/>
                  Reach <strong>{loyaltySettings.minPointsToRedeem}</strong> points to unlock redemption!
                </div>
              )}
            </div>
          )}

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Coupon Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            {loyaltyDiscount > 0 && (
              <div className="summary-row discount-row" style={{ color: "var(--primary-color)", fontWeight: "600" }}>
                <span>Points Redeemed</span>
                <span>-₹{loyaltyDiscount}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{Math.round(calculateTotal() * 100) / 100}</span>
            </div>
            <div className="pay-at-counter-msg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Please pay at the counter after placing your order.</span>
            </div>
            <button className="place-order-btn" onClick={placeOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default Checkout
