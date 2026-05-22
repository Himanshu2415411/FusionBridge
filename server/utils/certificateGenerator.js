/**
 * Certificate Generator - Generates and manages certificates
 */

const crypto = require('crypto')
const Certificate = require('../models/Certificate')
const { v4: uuidv4 } = require('uuid')

/**
 * Generate certificate ID
 * @returns {string} Unique certificate ID
 */
const generateCertificateId = () => {
  return `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`
}

/**
 * Generate verification hash
 * @param {string} certificateId - Certificate ID
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {string} Verification hash
 */
const generateVerificationHash = (certificateId, userId, courseId) => {
  const data = `${certificateId}-${userId}-${courseId}-${Date.now()}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Create and save certificate
 * @param {object} options - Certificate options
 * @returns {Promise<object>} Created certificate
 */
const createCertificate = async (options) => {
  try {
    const {
      userId,
      courseId,
      userName,
      courseTitle,
      instructorName,
      completedAt = new Date(),
    } = options

    const certificateId = generateCertificateId()
    const verificationHash = generateVerificationHash(certificateId, userId, courseId)

    const certificate = new Certificate({
      certificateId,
      verificationHash,
      user: userId,
      course: courseId,
      userName,
      courseTitle,
      instructorName,
      completedAt,
    })

    await certificate.save()
    return certificate
  } catch (error) {
    console.error('Create certificate error:', error)
    throw error
  }
}

/**
 * Verify certificate
 * @param {string} certificateId - Certificate ID to verify
 * @returns {Promise<object>} Certificate if valid, null otherwise
 */
const verifyCertificate = async (certificateId) => {
  try {
    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'firstName lastName email avatar')
      .populate('course', 'title')

    return certificate || null
  } catch (error) {
    console.error('Verify certificate error:', error)
    return null
  }
}

/**
 * Get user certificates
 * @param {string} userId - User ID
 * @returns {Promise<array>} Array of user certificates
 */
const getUserCertificates = async (userId) => {
  try {
    const certificates = await Certificate.find({ user: userId })
      .populate('course', 'title')
      .sort({ completedAt: -1 })

    return certificates
  } catch (error) {
    console.error('Get user certificates error:', error)
    return []
  }
}

/**
 * Get certificate by ID
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<object>} Certificate document
 */
const getCertificateById = async (certificateId) => {
  try {
    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'firstName lastName email avatar')
      .populate('course', 'title description')

    return certificate
  } catch (error) {
    console.error('Get certificate error:', error)
    return null
  }
}

/**
 * Download certificate (returns formatted data for PDF generation)
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<object>} Certificate data for download
 */
const downloadCertificate = async (certificateId) => {
  try {
    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'firstName lastName')
      .populate('course', 'title')

    if (!certificate) {
      return null
    }

    return {
      certificateId: certificate.certificateId,
      userName: certificate.userName,
      courseTitle: certificate.courseTitle,
      instructorName: certificate.instructorName,
      completedAt: certificate.completedAt,
      verificationUrl: `${process.env.FRONTEND_URL}/certificate/verify/${certificate.certificateId}`,
      downloadedAt: new Date(),
    }
  } catch (error) {
    console.error('Download certificate error:', error)
    return null
  }
}

/**
 * Format certificate for display
 * @param {object} certificate - Certificate document
 * @returns {object} Formatted certificate
 */
const formatCertificate = (certificate) => {
  if (!certificate) return null

  return {
    id: certificate._id,
    certificateId: certificate.certificateId,
    userName: certificate.userName,
    courseTitle: certificate.courseTitle,
    instructorName: certificate.instructorName,
    completedAt: certificate.completedAt,
    createdAt: certificate.createdAt,
    verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate/verify/${certificate.certificateId}`,
  }
}

/**
 * Check if user has certificate for course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} True if certificate exists
 */
const hasCertificate = async (userId, courseId) => {
  try {
    const certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    })

    return !!certificate
  } catch (error) {
    console.error('Check certificate error:', error)
    return false
  }
}

/**
 * Get certificate stats
 * @param {string} userId - User ID
 * @returns {Promise<object>} Certificate statistics
 */
const getCertificateStats = async (userId) => {
  try {
    const totalCertificates = await Certificate.countDocuments({ user: userId })

    const recentCertificates = await Certificate.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(3)

    return {
      total: totalCertificates,
      recent: recentCertificates,
    }
  } catch (error) {
    console.error('Get certificate stats error:', error)
    return { total: 0, recent: [] }
  }
}

module.exports = {
  generateCertificateId,
  generateVerificationHash,
  createCertificate,
  verifyCertificate,
  getUserCertificates,
  getCertificateById,
  downloadCertificate,
  formatCertificate,
  hasCertificate,
  getCertificateStats,
}
