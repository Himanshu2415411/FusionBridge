const express = require("express")
const {
  verifyCertificate,
  getCertificateById,
  getUserCertificatesList,
  getCertificateStatistics,
  downloadCertificate,
} = require("../controllers/certificate.controller")
const { auth } = require("../middleware/auth")
const { ApiResponse } = require("../utils/apiResponse")

const router = express.Router()

// Public Routes

// GET /api/certificates/verify/:hash - Public certificate verification by hash or ID
router.get("/verify/:hash", verifyCertificate)

// GET /api/certificates/:certificateId - Public certificate lookup by ID
router.get("/:certificateId", getCertificateById)

// Private Routes

// GET /api/certificates (after public routes to avoid conflicts)
// Get user's certificates
router.get("/", auth, getUserCertificatesList)

// GET /api/certificates/stats/overview - Get certificate statistics
router.get("/stats/overview", auth, getCertificateStatistics)

// GET /api/certificates/:certificateId/download - Download certificate
router.get("/:certificateId/download", auth, downloadCertificate)

module.exports = router