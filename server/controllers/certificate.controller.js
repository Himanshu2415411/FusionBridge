const Certificate = require("../models/Certificate")

/**
 * Verify a certificate by its verification hash
 * @route GET /api/certificates/verify/:hash
 * @access Public
 */
const verifyCertificate = async (req, res) => {
  try {
    const { hash } = req.params

    // Find certificate by verification hash
    const certificate = await Certificate.findOne({ verificationHash: hash })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or invalid",
      })
    }

    // Return certificate details (excluding sensitive fields)
    res.json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        userName: certificate.userName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        completedAt: certificate.completedAt,
      },
    })
  } catch (error) {
    console.error("Certificate verification error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

/**
 * Get certificate by readable certificate ID
 * @route GET /api/certificates/:certificateId
 * @access Public
 */
const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params

    // Find certificate by certificateId (e.g., CERT-8F4K2P)
    const certificate = await Certificate.findOne({ certificateId })

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      })
    }

    // Return certificate details
    res.json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        userName: certificate.userName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        completedAt: certificate.completedAt,
      },
    })
  } catch (error) {
    console.error("Certificate lookup error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  verifyCertificate,
  getCertificateById,
}
