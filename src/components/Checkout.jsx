"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { API_URL } from "../config/api"
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
  
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty")
      navigate("/user-menu")
    }

    if (user?.tableNumber) {
      setTableNumber(user.tableNumber)
    }

    fetchAvailableCoupons()
  }, [cart, navigate, user])

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

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() - discount
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
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate("/user-menu")}>
          ← Back to Menu
        </button>
        <h1>Checkout</h1>
      </div>

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
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter your table number"
                required
              />
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
                    placeholder="Enter coupon code"
                  />
                  <button onClick={applyCoupon} disabled={validatingCoupon}>
                    {validatingCoupon ? "Validating..." : "Apply"}
                  </button>
                </div>
                
                {availableCoupons.length > 0 && (
                  <div className="available-coupons">
                    <button className="view-coupons-btn" onClick={() => setShowCoupons(!showCoupons)}>
                      {showCoupons ? "Hide" : "View"} Available Coupons ({availableCoupons.length})
                    </button>
                    
                    {showCoupons && (
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

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <button className="place-order-btn" onClick={placeOrder} disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
