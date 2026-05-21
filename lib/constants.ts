/**
 * Frontend Constants
 * Centralized constants used across the application
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "FusionBridge"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    REGISTER: "/auth/register",
  },
  COURSES: {
    LIST: "/courses",
    GET: (id: string) => `/courses/${id}`,
    CREATE: "/courses",
    ENROLL: (id: string) => `/courses/${id}/enroll`,
    PUBLISH: (id: string) => `/courses/${id}/publish`,
    ADD_LESSON: (id: string) => `/courses/${id}/lessons`,
  },
  PROGRESS: {
    GET: "/progress",
    LESSON_COMPLETE: "/progress/lesson",
    SAVE_TIME: "/progress/save-time",
    QUIZ_COMPLETE: "/progress/quiz-complete",
  },
  CERTIFICATES: {
    GET: (courseId: string) => `/certificates/course/${courseId}`,
    VERIFY: (hash: string) => `/certificates/verify/${hash}`,
  },
  ACTIVITY: "/activity",
  DASHBOARD: "/dashboard",
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  TIMEOUT: "Request timed out. Please try again.",
  UNAUTHORIZED: "Please log in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "Resource not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNKNOWN: "Something went wrong. Please try again.",
}

// Success Messages
export const SUCCESS_MESSAGES = {
  COURSE_CREATED: "Course created successfully!",
  LESSON_ADDED: "Lesson added successfully!",
  COURSE_ENROLLED: "Enrolled successfully!",
  LESSON_COMPLETED: "Lesson completed!",
  COURSE_COMPLETED: "Course completed! 🎉",
}

// API Request Timeouts
export const API_TIMEOUT_MS = 10000 // 10 seconds

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  DEFAULT_PAGE: 1,
}

// Cache
export const CACHE_KEYS = {
  COURSES: "courses",
  PROGRESS: "progress",
  DASHBOARD: "dashboard",
  ACTIVITIES: "activities",
}

export const CACHE_TIMES = {
  COURSES: 5 * 60 * 1000, // 5 minutes
  PROGRESS: 1 * 60 * 1000, // 1 minute
  DASHBOARD: 2 * 60 * 1000, // 2 minutes
  ACTIVITIES: 2 * 60 * 1000, // 2 minutes
}

// UI
export const TOAST_DURATION = 3000 // milliseconds
