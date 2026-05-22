/**
 * Signed Video URL Service
 * Generates time-limited signed URLs for Cloudinary video access
 */

const crypto = require("crypto")

/**
 * Generate signed Cloudinary URL for video streaming
 * Ensures videos can only be accessed within expiration time
 *
 * @param {string} publicId - Cloudinary public ID of video
 * @param {number} expiryHours - Hours until URL expires (default: 24)
 * @returns {object} - { url, expiresAt, signature }
 */
const generateSignedVideoUrl = (publicId, expiryHours = 24) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiSecret) {
    throw new Error("Cloudinary credentials not configured")
  }

  // Calculate expiration time (Unix timestamp)
  const expirationTime = Math.floor(Date.now() / 1000) + expiryHours * 3600

  // Base URL for video resource
  const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`

  // Build query string with transformation and auth params
  const params = [
    `public_id=${publicId}`,
    `sign_url=true`,
    `type=upload`,
    `resource_type=video`,
    `expires_at=${expirationTime}`,
  ]

  // Create signature
  // SHA-256 hash of params + secret
  const stringToSign = params.join("&") + apiSecret
  const signature = crypto.createHash("sha256").update(stringToSign).digest("hex")

  // Build complete signed URL
  const signedUrl = `${baseUrl}/${publicId}.mp4?${params.join("&")}&signature=${signature}`

  return {
    url: signedUrl,
    expiresAt: new Date(expirationTime * 1000),
    expirationTime,
    signature,
  }
}

/**
 * Verify signed URL is valid
 * Checks expiration time hasn't passed
 *
 * @param {number} expirationTime - Unix timestamp from signed URL
 * @returns {boolean} - True if URL still valid
 */
const isSignedUrlValid = (expirationTime) => {
  const currentTime = Math.floor(Date.now() / 1000)
  return expirationTime > currentTime
}

/**
 * Invalidate signed URL
 * (Cloudinary signed URLs expire automatically)
 * This function is for tracking purposes
 *
 * @param {string} publicId - Video public ID
 * @returns {object} - Invalidation record
 */
const invalidateSignedUrl = (publicId) => {
  return {
    publicId,
    invalidatedAt: new Date(),
    reason: "Manual invalidation or video deleted",
  }
}

module.exports = {
  generateSignedVideoUrl,
  isSignedUrlValid,
  invalidateSignedUrl,
}
