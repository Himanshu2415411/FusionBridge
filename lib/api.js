const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const API_TIMEOUT_MS = 10000 // 10 seconds

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.csrfToken = null
  }

  /**
   * Set CSRF token (called by app after fetching from /auth/csrf-token)
   */
  setCsrfToken(token) {
    this.csrfToken = token
  }

  /**
   * Get standard headers for API requests
   * Includes CSRF token for state-changing requests
   */
  getAuthHeaders(includeCSRF = false) {
    const headers = {
      "Content-Type": "application/json",
    }

    if (includeCSRF && this.csrfToken) {
      headers["X-CSRF-Token"] = this.csrfToken
    }

    return headers
  }

  /**
   * Fetch with timeout
   */
  async fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT_MS) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.")
      }
      throw error
    }
  }

  /**
   * Make API request with standardized response handling
   */
  async request(endpoint, options = {}) {
    try {
      // Determine if request is state-changing
      const method = options.method?.toUpperCase() || "GET"
      const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method)

      const response = await this.fetchWithTimeout(
        `${this.baseURL}${endpoint}`,
        {
          headers: this.getAuthHeaders(isStateChanging),
          credentials: "include", // Send cookies automatically
          ...options,
        }
      )

      let data = null
      try {
        data = await response.json()
      } catch {
        throw new Error("Invalid response format from server")
      }

      // Handle non-200 status codes
      if (!response.ok) {
        throw new Error(data?.message || "API request failed")
      }

      // Validate response structure
      if (!data.success) {
        throw new Error(data?.message || "Request failed")
      }

      // Return only the data payload (not the wrapper)
      return data.data
    } catch (error) {
      // Handle 401 - redirect to login
      if (error.message?.includes("401") || error.message?.includes("Not authenticated")) {
        // TODO: Implement logout and redirect to login
      }
      throw error
    }
  }

  /* ================= AUTH ================= */

  login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  getCurrentUser() {
    return this.request("/auth/me")
  }

  logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  /* ================= USERS ================= */

  getUserDashboard() {
    return this.request("/users/dashboard")
  }

  getUserProfile() {
    return this.request("/users/profile")
  }

  updateUserProfile(data) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  /* ================= COURSES ================= */

  getCourses(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/courses${qs ? `?${qs}` : ""}`)
  }

  getCourse(id) {
    return this.request(`/courses/${id}`)
  }

  enrollInCourse(courseId) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: "POST",
    })
  }

  /* ================= COMMUNITY ================= */

  getCommunityFeed(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/community/feed${qs ? `?${qs}` : ""}`)
  }

  createPost(data) {
    return this.request("/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /* ================= EARN ================= */

  getProjects(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/earn/projects${qs ? `?${qs}` : ""}`)
  }

  submitProposal(data) {
    return this.request("/earn/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  getEarnDashboard() {
    return this.request("/earn/dashboard")
  }

  getProposals(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/earn/proposals${qs ? `?${qs}` : ""}`)
  }

  getContracts(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/earn/contracts${qs ? `?${qs}` : ""}`)
  }

  getEarnings() {
    return this.request("/earn/earnings")
  }

  /* ================= GROW ================= */

  getGrowRoadmap() {
    return this.request("/grow/roadmap")
  }

  getGrowProjects() {
    return this.request("/grow/projects")
  }

  getGrowResume() {
    return this.request("/grow/resume/analyze", { method: "POST" })
  }

  getGrowInterview() {
    return this.request("/grow/interview")
  }

  /* ================= ANALYTICS ================= */

  getAnalyticsDashboard() {
    return this.request("/analytics/dashboard")
  }
}

const apiService = new ApiService()
export default apiService
