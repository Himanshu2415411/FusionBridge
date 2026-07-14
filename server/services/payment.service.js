const crypto = require("crypto")
const Payment = require("../models/Payment")
const Course = require("../models/Course")
const courseService = require("./course.service")
const { getRazorpayClient, isRazorpayConfigured } = require("./razorpay.service")

const GENERIC_ITEM_TYPES = new Set([
  "course",
  "subscription",
  "certificate",
  "resume_review",
  "marketplace",
  "freelance_contract",
  "ai_credit",
])

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const normalizeAmount = (amount) => {
  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw createServiceError("Payment amount must be greater than zero")
  }

  return Math.round(numericAmount)
}

const toMinorUnitAmount = (amount) => {
  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw createServiceError("Payment amount must be greater than zero")
  }

  return Math.round(numericAmount * 100)
}

const resolvePaymentContext = async ({ itemType, itemId, amount, currency, description, metadata = {} }) => {
  if (!itemType || !GENERIC_ITEM_TYPES.has(itemType)) {
    throw createServiceError("Unsupported payment item type")
  }

  const normalizedMetadata = { ...metadata }

  if (itemType === "course") {
    const course = await Course.findById(itemId)

    if (!course) {
      throw createServiceError("Course not found", 404)
    }

    if (Number(course.price) <= 0) {
      throw createServiceError("Free courses do not require payment")
    }

    return {
      amount: toMinorUnitAmount(course.price),
      currency: (course.currency || "INR").toUpperCase(),
      description: description || course.title || "Course purchase",
      receiptPrefix: `course_${course._id}`,
      metadata: {
        courseTitle: course.title,
        coursePrice: course.price,
        courseCurrency: course.currency || "INR",
        ...normalizedMetadata,
      },
      itemSnapshot: course,
    }
  }

  if (!amount) {
    throw createServiceError(`Payment amount is required for ${itemType}`)
  }

  return {
    amount: normalizeAmount(amount),
    currency: (currency || "INR").toUpperCase(),
    description: description || `${itemType} payment`,
    receiptPrefix: `${itemType}_${itemId || Date.now()}`,
    metadata: normalizedMetadata,
    itemSnapshot: null,
  }
}

const createOrder = async ({ userId, itemType, itemId, amount, currency, description, metadata = {}, receipt }) => {
  if (!userId) {
    throw createServiceError("Authentication required", 401)
  }

  if (!isRazorpayConfigured()) {
    throw createServiceError("Razorpay is not configured", 503)
  }

  if (!itemType) {
    throw createServiceError("itemType is required")
  }

  if (!itemId) {
    throw createServiceError("itemId is required")
  }

  const paymentContext = await resolvePaymentContext({
    itemType,
    itemId,
    amount,
    currency,
    description,
    metadata,
  })

  const razorpay = getRazorpayClient()
  const receiptValue = receipt || `FB_${crypto.randomBytes(6).toString("hex")}`;
  const order = await razorpay.orders.create({
    amount: paymentContext.amount,
    currency: paymentContext.currency,
    receipt: receiptValue,
    notes: {
      itemType,
      itemId: itemId.toString(),
      userId: userId.toString(),
    },
  })

  const payment = await Payment.create({
    user: userId,
    provider: "razorpay",
    orderId: order.id,
    amount: paymentContext.amount,
    currency: paymentContext.currency,
    status: "created",
    itemType,
    itemId,
    receipt: receiptValue,
    metadata: {
      ...paymentContext.metadata,
      description: paymentContext.description,
      razorpayOrderId: order.id,
    },
  })

  return {
    payment,
    order,
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: paymentContext.amount,
    currency: paymentContext.currency,
    description: paymentContext.description,
  }
}

const finalizePayment = async ({ paymentRecord, paymentId, signature, skipDispatch = false }) => {
  const existingMetadata = {
    ...(paymentRecord.metadata || {}),
  }
  const existingDispatchStatus = paymentRecord.metadata?.dispatchStatus

  paymentRecord.paymentId = paymentId || paymentRecord.paymentId
  paymentRecord.signature = signature || paymentRecord.signature
  paymentRecord.status = "paid"
  paymentRecord.metadata = {
    ...existingMetadata,
    verifiedAt: new Date().toISOString(),
  }

  await paymentRecord.save()

  if (skipDispatch || existingDispatchStatus === "completed") {
    return {
      payment: paymentRecord,
      dispatchResult: paymentRecord.metadata?.dispatchResult || {
        itemType: paymentRecord.itemType,
        executed: false,
        alreadyCompleted: true,
      },
    }
  }

  const dispatchResult = await dispatchPaymentBusinessLogic(paymentRecord)

  paymentRecord.metadata = {
    ...existingMetadata,
    verifiedAt: paymentRecord.metadata.verifiedAt,
    dispatchStatus: "completed",
    dispatchResult,
  }

  await paymentRecord.save()

  return {
    payment: paymentRecord,
    dispatchResult,
  }
}

const verifyOrderSignature = ({ orderId, paymentId, signature }) => {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  return expectedSignature === signature
}

const dispatchPaymentBusinessLogic = async (payment) => {
  switch (payment.itemType) {
    case "course": {
      try {
        const enrolledCourse = await courseService.enrollUser(payment.itemId.toString(), payment.user.toString())

        return {
          itemType: "course",
          executed: true,
          action: "enroll_student",
          data: {
            course: enrolledCourse,
          },
        }
      } catch (error) {
        if (error.message === "User already enrolled in this course") {
          return {
            itemType: "course",
            executed: true,
            alreadyCompleted: true,
            action: "enroll_student",
          }
        }

        throw error
      }
    }
    case "subscription":
    case "certificate":
    case "resume_review":
    case "marketplace":
    case "freelance_contract":
    case "ai_credit":
      return {
        itemType: payment.itemType,
        executed: false,
        action: "pending_dispatch",
        message: `Dispatcher not implemented for ${payment.itemType}`,
      }
    default:
      throw createServiceError("Unsupported payment item type", 400)
  }
}

const verifyPayment = async ({ userId, orderId, paymentId, signature, itemType, itemId }) => {
  if (!userId) {
    throw createServiceError("Authentication required", 401)
  }

  if (!orderId || !paymentId || !signature) {
    throw createServiceError("orderId, paymentId, and signature are required")
  }

  if (!isRazorpayConfigured()) {
    throw createServiceError("Razorpay is not configured", 503)
  }

  const paymentRecord = await Payment.findOne({
    orderId,
    user: userId,
    ...(itemType ? { itemType } : {}),
    ...(itemId ? { itemId } : {}),
  })

  if (!paymentRecord) {
    throw createServiceError("Payment record not found", 404)
  }

  if (!verifyOrderSignature({ orderId, paymentId, signature })) {
    paymentRecord.status = "failed"
    paymentRecord.paymentId = paymentId
    paymentRecord.signature = signature
    paymentRecord.metadata = {
      ...(paymentRecord.metadata || {}),
      dispatchStatus: "failed",
      failureReason: "Signature mismatch",
    }

    await paymentRecord.save()
    throw createServiceError("Signature mismatch", 400)
  }

  if (paymentRecord.status === "paid" && paymentRecord.metadata?.dispatchStatus === "completed") {
    return {
      payment: paymentRecord,
      dispatchResult: paymentRecord.metadata.dispatchResult || {
        itemType: paymentRecord.itemType,
        executed: false,
        alreadyCompleted: true,
      },
    }
  }

  return finalizePayment({
    paymentRecord,
    paymentId,
    signature,
  })
}

const handleWebhook = async ({ event, payload, signature, rawBody }) => {
  if (!isRazorpayConfigured()) {
    throw createServiceError("Razorpay is not configured", 503)
  }

  if (!rawBody) {
    throw createServiceError("Webhook body is required")
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
    .update(rawBody)
    .digest("hex")

  if (expectedSignature !== signature) {
    throw createServiceError("Webhook signature mismatch", 400)
  }

  const paymentEntity = payload?.payment?.entity || {}
  const orderId = paymentEntity.order_id
  const paymentId = paymentEntity.id

  if (!orderId) {
    throw createServiceError("Webhook payload missing order ID", 400)
  }

  const paymentRecord = await Payment.findOne({ orderId })

  if (!paymentRecord) {
    throw createServiceError("Payment record not found", 404)
  }

  if (event === "payment.failed") {
    paymentRecord.status = "failed"
    paymentRecord.paymentId = paymentId || paymentRecord.paymentId
    paymentRecord.signature = signature || paymentRecord.signature
    paymentRecord.metadata = {
      ...(paymentRecord.metadata || {}),
      dispatchStatus: "failed",
      webhookEvent: event,
      failureReason: paymentEntity.error_description || paymentEntity.error_reason || "Payment failed",
    }

    await paymentRecord.save()

    return {
      payment: paymentRecord,
      dispatchResult: {
        itemType: paymentRecord.itemType,
        executed: false,
        event,
      },
    }
  }

  return finalizePayment({
    paymentRecord,
    paymentId,
    signature,
    skipDispatch: false,
  })
}

const getPaymentHistory = async (userId) => {
  if (!userId) {
    throw createServiceError("Authentication required", 401)
  }

  return Payment.find({ user: userId }).sort({ createdAt: -1 })
}

const getPaymentById = async ({ paymentId, userId }) => {
  if (!paymentId) {
    throw createServiceError("Payment ID is required")
  }

  if (!userId) {
    throw createServiceError("Authentication required", 401)
  }

  const payment = await Payment.findOne({ _id: paymentId, user: userId })

  if (!payment) {
    throw createServiceError("Payment not found", 404)
  }

  return payment
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentById,
  dispatchPaymentBusinessLogic,
  finalizePayment,
  verifyOrderSignature,
}