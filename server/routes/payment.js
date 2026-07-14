const express = require("express")
const { auth } = require("../middleware/auth")
const paymentController = require("../controllers/payment.controller")

const router = express.Router()

router.post("/create-order", auth, paymentController.createOrder)
router.post("/verify", auth, paymentController.verifyPayment)
router.post("/webhook", paymentController.handleWebhook)
router.get("/history", auth, paymentController.getPaymentHistory)
router.get("/:id", auth, paymentController.getPaymentById)

module.exports = router