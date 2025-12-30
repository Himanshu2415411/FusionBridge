const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
      ...options,
    })

    let data = null
    try {
      data = await response.json()
    } catch {
      data = null
    }

    if (!response.ok) {
      throw new Error(data?.message || "API request failed")
    }

    return data
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

  /* ================= ANALYTICS ================= */

  getAnalyticsDashboard() {
    return this.request("/analytics/dashboard")
  }
}

const apiService = new ApiService()
export default apiService
