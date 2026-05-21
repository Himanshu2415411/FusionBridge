/**
 * Cookie Authentication Utilities
 * Handles setting and clearing httpOnly cookies for JWT authentication
 */

const setCookie = (res, token, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  }

  res.cookie("authToken", token, { ...defaultOptions, ...options })
}

const clearCookie = (res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
}

const getCookie = (req) => {
  return req.cookies?.authToken || null
}

module.exports = {
  setCookie,
  clearCookie,
  getCookie,
}
