const Razorpay = require("razorpay")

const isRazorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

const getRazorpayClient = () => {
  if (!isRazorpayConfigured()) {
    const error = new Error("Razorpay is not configured")
    error.statusCode = 503
    throw error
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

module.exports = {
  getRazorpayClient,
  isRazorpayConfigured,
}