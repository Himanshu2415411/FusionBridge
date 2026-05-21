const express = require("express")
const { verifyCertificate, getCertificateById } = require("../controllers/certificate.controller")
const { ApiResponse } = require("../utils/apiResponse")

const router = express.Router()

// GET /api/certificates/verify/:hash - Public certificate verification by hash (secure)
router.get("/verify/:hash", verifyCertificate)

// GET /api/certificates/:certificateId - Public certificate lookup by ID (readable)
router.get("/:certificateId", getCertificateById)

module.exports = router