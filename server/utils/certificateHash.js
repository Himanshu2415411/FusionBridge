const crypto = require("crypto")

/**
 * Generates a secure certificate verification hash
 * @param {string} userId - The user's ID
 * @param {string} courseId - The course's ID
 * @returns {string} A secure SHA256 hash as a hex string
 */
const generateCertificateHash = (userId, courseId) => {
  // Generate random bytes for additional entropy
  const randomBytes = crypto.randomBytes(32).toString("hex")
  
  // Get current timestamp
  const timestamp = Date.now().toString()
  
  // Combine all components
  const dataToHash = `${userId}:${courseId}:${timestamp}:${randomBytes}`
  
  // Create SHA256 hash
  const hash = crypto
    .createHash("sha256")
    .update(dataToHash)
    .digest("hex")
  
  return hash
}

module.exports = { generateCertificateHash }
