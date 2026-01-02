const express = require("express")
const { auth, optionalAuth } = require("../middleware/auth")

const router = express.Router()

/*
|--------------------------------------------------------------------------
| TEMP MODE: MOCK COURSES (NO DATABASE)
|--------------------------------------------------------------------------
| Reason:
| - MongoDB not finalized yet
| - Frontend & dashboard need stable APIs
| - Keeps API contract intact
|
| Later:
| - Replace mockCourses with Course.find()
| - Remove mock enroll logic
*/

const mockCourses = [
  {
    _id: "course_1",
    title: "Advanced React Development",
    category: "Web Development",
    level: "advanced",
    thumbnail: "/placeholder.svg",
    duration: 12,
    isPublished: true,
    featured: true,
  },
  {
    _id: "course_2",
    title: "Backend with Node & Express",
    category: "Web Development",
    level: "intermediate",
    thumbnail: "/placeholder.svg",
    duration: 10,
    isPublished: true,
    featured: false,
  },
]

/* ===========================
   GET /api/courses
   =========================== */
router.get("/", optionalAuth, async (req, res) => {
  res.json({
    success: true,
    courses: mockCourses,
    pagination: {
      current: 1,
      pages: 1,
      total: mockCourses.length,
    },
  })
})

/* ===========================
   GET /api/courses/:id
   =========================== */
router.get("/:id", optionalAuth, async (req, res) => {
  const course = mockCourses.find(c => c._id === req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  res.json({
    success: true,
    course: {
      ...course,
      isEnrolled: false,
      progress: 0,
    },
  })
})

/* ===========================
   POST /api/courses/:id/enroll
   =========================== */
router.post("/:id/enroll", auth, async (req, res) => {
  const course = mockCourses.find(c => c._id === req.params.id)

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found",
    })
  }

  res.json({
    success: true,
    message: "Course enrolled successfully (mock)",
    data: {
      courseId: course._id,
      enrolledAt: new Date(),
      progress: 0,
    },
  })
})

/* ===========================
   PUT /api/courses/:id/progress
   =========================== */
router.put("/:id/progress", auth, async (req, res) => {
  const { progress } = req.body

  if (progress < 0 || progress > 100) {
    return res.status(400).json({
      success: false,
      message: "Progress must be between 0 and 100",
    })
  }

  res.json({
    success: true,
    message: "Progress updated successfully (mock)",
    progress,
    completed: progress === 100,
  })
})

/* ===========================
   META: categories
   =========================== */
router.get("/meta/categories", async (req, res) => {
  res.json({
    success: true,
    categories: ["Web Development", "Data Science", "Design"],
  })
})

module.exports = router
