const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const API_TIMEOUT_MS = 10000 // 10 seconds

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.csrfToken = null
  }

  normalizeEntity(payload, preferredKeys = []) {
    if (payload == null || typeof payload !== "object") {
      return payload
    }

    for (const key of preferredKeys) {
      if (payload[key] !== undefined && payload[key] !== null) {
        return payload[key]
      }
    }

    return payload
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

  async requestEnvelope(endpoint, options = {}) {
    const method = options.method?.toUpperCase() || "GET"
    const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method)

    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(isStateChanging),
      credentials: "include",
      ...options,
    })

    let data = null
    try {
      data = await response.json()
    } catch {
      throw new Error("Invalid response format from server")
    }

    if (!response.ok) {
      throw new Error(data?.message || "API request failed")
    }

    if (data?.success === false) {
      throw new Error(data?.message || "Request failed")
    }

    return data
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
  register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
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

  getActivityFeed(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/activity${qs ? `?${qs}` : ""}`)
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

  getCourseProgress(courseId) {
    return this.request(`/progress/course/${courseId}`).then((data) =>
      this.normalizeEntity(data, ["progress"])
    )
  }

  enrollInCourse(courseId) {
    return this.request(`/courses/${courseId}/enroll`, {
      method: "POST",
    })
  }

  trackLessonAccess({ courseId, lessonId }) {
    return this.request("/progress/lesson/access", {
      method: "POST",
      body: JSON.stringify({ courseId, lessonId }),
    })
  }

  markLessonComplete({ courseId, lessonId }) {
    return this.request("/progress/complete", {
      method: "POST",
      body: JSON.stringify({ courseId, lessonId }),
    })
  }

  /* ================= COMMUNITY ================= */

  getCommunityFeed(params = {}) {
    return this.getCommunityFeedData(params)
  }

  getCommunityFeedData(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.requestEnvelope(`/community/feed${qs ? `?${qs}` : ""}`).then((data) =>
      this.normalizeEntity(data, ["posts"])
    )
  }

  getCommunityEvents(params = {}) {
    return this.getCommunityEventsData(params)
  }

  getCommunityEventsData(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.requestEnvelope(`/community/events${qs ? `?${qs}` : ""}`).then((data) =>
      this.normalizeEntity(data, ["events"])
    )
  }

  getCommunityMembers(params = {}) {
    return this.getCommunityMembersData(params)
  }

  getCommunityMembersData(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.requestEnvelope(`/community/members${qs ? `?${qs}` : ""}`).then((data) =>
      this.normalizeEntity(data, ["members"])
    )
  }

  createPost(data) {
    return this.requestEnvelope("/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((response) => this.normalizeEntity(response, ["post"]))
  }

  likePost(postId) {
    return this.requestEnvelope(`/community/posts/${postId}/like`, {
      method: "POST",
    })
  }

  registerForEvent(eventId) {
    return this.requestEnvelope(`/community/events/${eventId}/join`, {
      method: "POST",
    }).then((response) => this.normalizeEntity(response, ["event"]))
  }

  /* ================= EARN ================= */

  getProjects(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.getEarnProjectsData(params)
  }

  getEarnProjects(params = {}) {
    return this.getEarnProjectsData(params)
  }

  getEarnProjectsData(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.requestEnvelope(`/earn/projects${qs ? `?${qs}` : ""}`).then((data) =>
      this.normalizeEntity(data, ["projects"])
    )
  }

  submitProposal(data) {
    return this.request("/earn/proposals", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  getEarnDashboard() {
    return this.getEarnDashboardData()
  }

  getEarnDashboardData() {
    return this.requestEnvelope("/earn/dashboard").then((data) =>
      this.normalizeEntity(data, ["data", "dashboard"])
    )
  }

  getProposals(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/earn/proposals${qs ? `?${qs}` : ""}`)
  }

  getContracts(params = {}) {
    return this.getWorkspaceContractsData(params)
  }

  getWorkspaceContractsData(params = {}) {
    const qs = new URLSearchParams(params).toString()
    return this.requestEnvelope(`/earn/workspace/contracts${qs ? `?${qs}` : ""}`).then((data) =>
      this.normalizeEntity(data, ["data", "contracts"])
    )
  }

  getEarnings() {
    return this.getEarnDashboardData()
  }

  getProposals(params = {}) {
    return this.getEarnDashboardData().then((dashboard) => dashboard?.recentProjects || [])
  }

  /* ================= GROW ================= */

  getGrowRoadmap() {
    return this.requestEnvelope("/grow/roadmap").then((data) =>
      this.normalizeEntity(data, ["roadmap"])
    )
  }

  getGrowProjects() {
    return this.requestEnvelope("/grow/projects").then((data) =>
      this.normalizeEntity(data, ["projects"])
    )
  }

  getGrowRoadmapData() {
    return this.getGrowRoadmap()
  }

  getGrowProjectsData() {
    return this.getGrowProjects()
  }

  getDashboardOverviewData() {
    return this.requestEnvelope("/dashboard/overview").then((data) =>
      this.normalizeEntity(data, ["dashboard"])
    )
  }

  getGrowResume() {
    return this.requestEnvelope("/grow/resume/analyze", { method: "POST" }).then((data) =>
      this.normalizeEntity(data, ["resume"])
    )
  }

  getGrowInterview() {
    return this.requestEnvelope("/grow/interview").then((data) =>
      this.normalizeEntity(data, ["questions"])
    )
  }

  getGrowResumeData() {
    return this.getGrowResume()
  }

  getGrowInterviewData() {
    return this.getGrowInterview()
  }

  /* ================= ANALYTICS ================= */

  getAnalyticsDashboard() {
    return this.request("/analytics/dashboard")
  }
}

const apiService = new ApiService()
export default apiService
