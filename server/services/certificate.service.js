const Certificate = require("../models/Certificate")
const { generateCertificateHash } = require("../utils/certificateHash")

/**
 * Generates a random certificate ID in format CERT-XXXXXX
 * @returns {string} Certificate ID (e.g., CERT-8F4K2P)
 */
const generateCertificateId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let randomString = ""
  
  for (let i = 0; i < 6; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return `CERT-${randomString}`
}

/**
 * Issues a course completion certificate for a user
 * @param {Object} user - User object (must be populated)
 * @param {Object} course - Course object (must be populated with instructor)
 * @returns {Object} Certificate document
 */
const issueCertificate = async (user, course) => {
  // Check if certificate already exists
  const existingCertificate = await Certificate.findOne({
    user: user._id,
    course: course._id,
  })

  if (existingCertificate) {
    return existingCertificate
  }

  // Generate unique certificate ID (with retry logic for uniqueness)
  let certificateId
  let isUnique = false
  
  while (!isUnique) {
    certificateId = generateCertificateId()
    const existing = await Certificate.findOne({ certificateId })
    if (!existing) {
      isUnique = true
    }
  }

  // Generate verification hash
  const verificationHash = generateCertificateHash(user._id.toString(), course._id.toString())

  // Get instructor name
  let instructorName = "Unknown Instructor"
  if (course.instructor) {
    if (typeof course.instructor === "object" && course.instructor.firstName) {
      instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`
    }
  }

  // Get user name
  const userName = `${user.firstName} ${user.lastName}`

  // Create certificate
  const certificate = new Certificate({
    certificateId,
    verificationHash,
    user: user._id,
    course: course._id,
    userName,
    courseTitle: course.title,
    instructorName,
    completedAt: new Date(),
  })

  // Save and return
  await certificate.save()

  // Record certificate activity
  user.activityFeed = user.activityFeed || []
  user.activityFeed.push({
    type: "certificate_earned",
    message: "Earned certificate for course",
    timestamp: new Date(),
  })

  if (user.activityFeed.length > 50) {
    user.activityFeed = user.activityFeed.slice(-50)
  }

  await user.save()

  return certificate
}

module.exports = {
  issueCertificate,
}
