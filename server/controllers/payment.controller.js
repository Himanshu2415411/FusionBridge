const paymentService = require("../services/payment.service")
const { ApiResponse } = require("../utils/apiResponse")

const getStatusCode = (error) => error.statusCode || 500

const createOrder = async (req, res) => {
  try {
    const result = await paymentService.createOrder({
      userId: req.user._id,
      itemType: req.body.itemType,
      itemId: req.body.itemId,
      amount: req.body.amount,
      currency: req.body.currency,
      description: req.body.description,
      metadata: req.body.metadata,
      receipt: req.body.receipt,
    })

    res.status(201).json(
      new ApiResponse(201, result, "Payment order created successfully").toJSON()
    )
        } catch (error) {
        console.error("========== CREATE ORDER ERROR ==========");
        console.error(error);
        console.error("========================================");

        const message =
            error.message ||
            error.error?.description ||
            "Payment failed";

        res.status(getStatusCode(error)).json(
            new ApiResponse(
            getStatusCode(error),
            null,
            message
            ).toJSON()
        );
    }
}

const verifyPayment = async (req, res) => {
  try {
    const result = await paymentService.verifyPayment({
      userId: req.user._id,
      orderId: req.body.orderId,
      paymentId: req.body.paymentId,
      signature: req.body.signature,
      itemType: req.body.itemType,
      itemId: req.body.itemId,
    })

    res.status(200).json(
      new ApiResponse(200, result, "Payment verified successfully").toJSON()
    )
  } catch (error) {
    res.status(getStatusCode(error)).json(
      new ApiResponse(getStatusCode(error), null, error.message).toJSON()
    )
  }
}

const handleWebhook = async (req, res) => {
  try {
    const result = await paymentService.handleWebhook({
      event: req.body?.event,
      payload: req.body,
      signature: req.headers["x-razorpay-signature"],
      rawBody: req.rawBody,
    })

    res.status(200).json(
      new ApiResponse(200, result, "Webhook processed successfully").toJSON()
    )
  } catch (error) {
    res.status(getStatusCode(error)).json(
      new ApiResponse(getStatusCode(error), null, error.message).toJSON()
    )
  }
}

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentHistory(req.user._id)

    res.status(200).json(
      new ApiResponse(200, { payments }, "Payment history retrieved successfully").toJSON()
    )
  } catch (error) {
    res.status(getStatusCode(error)).json(
      new ApiResponse(getStatusCode(error), null, error.message).toJSON()
    )
  }
}

const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById({
      paymentId: req.params.id,
      userId: req.user._id,
    })

    res.status(200).json(
      new ApiResponse(200, { payment }, "Payment retrieved successfully").toJSON()
    )
  } catch (error) {
    res.status(getStatusCode(error)).json(
      new ApiResponse(getStatusCode(error), null, error.message).toJSON()
    )
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentById,
}