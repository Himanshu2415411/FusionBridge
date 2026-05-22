const Certificate = require("../models/Certificate")
const User = require("../models/User")
const Course = require("../models/Course")
const { ApiResponse } = require("../utils/apiResponse")
const {
  createCertificate,
  verifyCertificate: verifySignedCert,
  getUserCertificates,
  formatCertificate,
  getCertificateStats,
} = require("../utils/certificateGenerator")
const { logActivity, ACTIVITY_TYPES } = require("../services/activityLogger")
const { auth } = require("../middleware/auth")

/**
 * Verify a certificate by its verification hash or certificate ID
 * @route GET /api/certificates/verify/:hash
 * @access Public
 */
const verifyCertificate = async (req, res) => {
  try {
    const { hash } = req.params

    // Find certificate by verification hash or certificate ID
    const certificate = await Certificate.findOne({
      $or: [
        { verificationHash: hash },
        { certificateId: hash },
      ],
    })
      .populate('user', 'firstName lastName email avatar')
      .populate('course', 'title description')

    if (!certificate) {
      return res.status(404).json(
        new ApiResponse(404, null, "Certificate not found or invalid").toJSON()
      )
    }

    // Return certificate details
    return res.json(
      new ApiResponse(
        200,
        {
          certificateId: certificate.certificateId,
          userName: certificate.userName,
          courseTitle: certificate.courseTitle,
          instructorName: certificate.instructorName,
          completedAt: certificate.completedAt,
          issuedAt: certificate.createdAt,
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate/verify/${certificate.certificateId}`,
        },
        "Certificate verified successfully"
      ).toJSON()
    )
  } catch (error) {
    console.error("Certificate verification error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
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

    // Find certificate by certificateId
    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'firstName lastName avatar')
      .populate('course', 'title')

    if (!certificate) {
      return res.status(404).json(
        new ApiResponse(404, null, "Certificate not found").toJSON()
      )
    }

    // Return certificate details
    return res.json(
      new ApiResponse(
        200,
        formatCertificate(certificate),
        "Certificate found"
      ).toJSON()
    )
  } catch (error) {
    console.error("Certificate lookup error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Get user's certificates
 * @route GET /api/certificates
 * @access Private
 */
const getUserCertificatesList = async (req, res) => {
  try {
    const userId = req.user._id

    const certificates = await getUserCertificates(userId)

    const formattedCerts = certificates.map((cert) => ({
      id: cert._id,
      certificateId: cert.certificateId,
      courseTitle: cert.courseTitle,
      completedAt: cert.completedAt,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate/verify/${cert.certificateId}`,
    }))

    return res.json(
      new ApiResponse(
        200,
        {
          certificates: formattedCerts,
          total: formattedCerts.length,
        },
        "User certificates retrieved"
      ).toJSON()
    )
  } catch (error) {
    console.error("Get user certificates error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Get certificate statistics for user
 * @route GET /api/certificates/stats/overview
 * @access Private
 */
const getCertificateStatistics = async (req, res) => {
  try {
    const userId = req.user._id

    const stats = await getCertificateStats(userId)

    return res.json(
      new ApiResponse(
        200,
        {
          totalCertificates: stats.total,
          recentCertificates: stats.recent.map(cert => ({
            courseTitle: cert.courseTitle,
            completedAt: cert.completedAt,
          })),
        },
        "Certificate statistics retrieved"
      ).toJSON()
    )
  } catch (error) {
    console.error("Get certificate stats error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

/**
 * Generate certificate on course completion
 * @internal Called from course completion endpoint
 */
const generateCertificateForCompletion = async (userId, courseId) => {
  try {
    const user = await User.findById(userId)
    const course = await Course.findById(courseId)

    if (!user || !course) {
      console.error("User or course not found for certificate generation")
      return null
    }

    // Create certificate
    const certificate = await createCertificate({
      userId,
      courseId,
      userName: `${user.firstName} ${user.lastName}`,
      courseTitle: course.title,
      instructorName: course.instructor || "FusionBridge Team",
      completedAt: new Date(),
    })

    // Log activity
    await logActivity(userId, ACTIVITY_TYPES.CERTIFICATE_EARNED, {
      courseId,
      courseName: course.title,
      certificateId: certificate.certificateId,
    })

    return certificate
  } catch (error) {
    console.error("Certificate generation error:", error)
    return null
  }
}

/**
 * Download certificate as PDF data
 * @route GET /api/certificates/:certificateId/download
 * @access Public (certificate holder)
 */
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'firstName lastName')
      .populate('course', 'title')

    if (!certificate) {
      return res.status(404).json(
        new ApiResponse(404, null, "Certificate not found").toJSON()
      )
    }

    // Return data for frontend PDF generation
    return res.json(
      new ApiResponse(
        200,
        {
          certificateId: certificate.certificateId,
          userName: certificate.userName,
          courseTitle: certificate.courseTitle,
          instructorName: certificate.instructorName,
          completedAt: certificate.completedAt,
          issuedAt: certificate.createdAt,
          verificationCode: certificate.certificateId,
        },
        "Certificate data for download"
      ).toJSON()
    )
  } catch (error) {
    console.error("Download certificate error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
}

module.exports = {
  verifyCertificate,
  getCertificateById,
  getUserCertificatesList,
  getCertificateStatistics,
  generateCertificateForCompletion,
  downloadCertificate,
}
