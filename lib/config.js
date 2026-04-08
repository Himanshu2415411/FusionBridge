/**
 * Central API Configuration
 * All frontend API calls should use this base URL to communicate with the backend
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Helper function to build API URLs
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
}

/**
 * Get authorization headers with token
 */
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/**
 * Safe fetch wrapper with JSON parsing and error handling
 * Prevents JSON parsing errors when API returns HTML or other non-JSON responses
 */
export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    
    // Check if response is ok
    if (!response.ok) {
      const text = await response.text()
      console.error(`API Error (${response.status}):`, text)
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    // Get response text first to check if it's valid JSON
    const text = await response.text()
    
    if (!text) {
      throw new Error("Empty response from server")
    }
    
    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error("JSON Parse Error - Raw Response:", text.substring(0, 500))
      throw new Error("Invalid JSON response from server")
    }
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}
