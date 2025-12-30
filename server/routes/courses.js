const express = require("express")
const Course = require("../models/Course")
const User = require("../models/User")
const { auth, authorize, optionalAuth } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, level, search, sort = "createdAt", order = "desc", featured } = req.query

    const query = { isPublished: true }

    // Filter by category
    if (category && category !== "all") {
      query.category = category
    }

    // Filter by level
    if (level && level !== "all") {
      query.level = level
    }

    // Filter by featured
    if (featured === "true") {
      query.featured = true
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Sort options
    const sortOptions = {}
    sortOptions[sort] = order === "desc" ? -1 : 1

    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName avatar")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Course.countDocuments(query)

    // Add enrollment status if user is authenticated
    if (req.user) {
      const user = await User.findById(req.user._id)
      courses.forEach((course) => {
        const enrollment = user.enrolledCourses.find((ec) => ec.course.toString() === course._id.toString())
        course._doc.isEnrolled = !!enrollment
        course._doc.progress = enrollment ? enrollment.progress : 0
      })
    }

    res.json({
      success: true,
      courses,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "firstName lastName avatar bio")
      .populate("reviews.user", "firstName lastName avatar")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is enrolled
    let isEnrolled = false
    let progress = 0

    if (req.user) {
      const user = await User.findById(req.user._id)
      const enrollment = user.enrolledCourses.find((ec) => ec.course.toString() === course._id.toString())
      isEnrolled = !!enrollment
      progress = enrollment ? enrollment.progress : 0
    }

    res.json({
      success: true,
      course: {
        ...course._doc,
        isEnrolled,
        progress,
      },
    })
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(req.user._id)

    // Check if already enrolled
    const existingEnrollment = user.enrolledCourses.find((ec) => ec.course.toString() === course._id.toString())

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      })
    }

    // Add enrollment
    user.enrolledCourses.push({
      course: course._id,
      enrolledAt: new Date(),
      progress: 0,
    })

    // Update course enrollment count
    course.studentsEnrolled += 1

    await Promise.all([user.save(), course.save()])

    // Add XP for enrollment
    await user.addXP(50)

    res.json({
      success: true,
      message: "Successfully enrolled in course",
      course,
    })
  } catch (error) {
    console.error("Enroll course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/courses/:id/unenroll
// @desc    Unenroll from course
// @access  Private
router.post("/:id/unenroll", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(req.user._id)

    // Find enrollment
    const enrollmentIndex = user.enrolledCourses.findIndex((ec) => ec.course.toString() === course._id.toString())

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    // Remove enrollment
    user.enrolledCourses.splice(enrollmentIndex, 1)

    // Update course enrollment count
    course.studentsEnrolled = Math.max(0, course.studentsEnrolled - 1)

    await Promise.all([user.save(), course.save()])

    res.json({
      success: true,
      message: "Successfully unenrolled from course",
    })
  } catch (error) {
    console.error("Unenroll course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/courses/:id/progress
// @desc    Update course progress
// @access  Private
router.put("/:id/progress", auth, async (req, res) => {
  try {
    const { progress, lessonId } = req.body

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      })
    }

    const user = await User.findById(req.user._id)
    const enrollment = user.enrolledCourses.find((ec) => ec.course.toString() === req.params.id)

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    const oldProgress = enrollment.progress
    enrollment.progress = progress

    // Mark as completed if progress is 100%
    if (progress === 100 && !enrollment.completed) {
      enrollment.completed = true
      enrollment.completedAt = new Date()
      user.coursesCompleted += 1

      // Add XP for completion
      await user.addXP(200)
    }

    await user.save()

    // Add XP for progress milestones
    if (progress > oldProgress) {
      const milestones = [25, 50, 75]
      for (const milestone of milestones) {
        if (oldProgress < milestone && progress >= milestone) {
          await user.addXP(25)
        }
      }
    }

    res.json({
      success: true,
      message: "Progress updated successfully",
      progress: enrollment.progress,
      completed: enrollment.completed,
    })
  } catch (error) {
    console.error("Update progress error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/courses/:id/review
// @desc    Add a review to a course
// @access  Private
router.post(
  "/:id/review",
  [auth, body("rating").isInt({ min: 1, max: 5 }), body("comment").trim().isLength({ min: 10, max: 500 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { rating, comment } = req.body
      const course = await Course.findById(req.params.id)

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      // Check if user is enrolled
      const user = await User.findById(req.user._id)
      const enrollment = user.enrolledCourses.find((ec) => ec.course.toString() === course._id.toString())

      if (!enrollment) {
        return res.status(400).json({
          success: false,
          message: "Must be enrolled to review this course",
        })
      }

      // Check if user already reviewed
      const existingReview = course.reviews.find((review) => review.user.toString() === req.user._id.toString())

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this course",
        })
      }

      // Add review
      course.reviews.push({
        user: req.user._id,
        rating,
        comment,
        createdAt: new Date(),
      })

      // Update average rating
      const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0)
      course.averageRating = totalRating / course.reviews.length

      await course.save()

      await course.populate("reviews.user", "firstName lastName avatar")

      res.json({
        success: true,
        message: "Review added successfully",
        course,
      })
    } catch (error) {
      console.error("Add review error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Instructor/Admin)
router.post(
  "/",
  [
    auth,
    authorize("instructor", "admin"),
    body("title").trim().isLength({ min: 5, max: 100 }),
    body("description").trim().isLength({ min: 20, max: 1000 }),
    body("category").notEmpty(),
    body("level").isIn(["beginner", "intermediate", "advanced"]),
    body("price").isNumeric().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const courseData = {
        ...req.body,
        instructor: req.user._id,
      }

      const course = new Course(courseData)
      await course.save()

      await course.populate("instructor", "firstName lastName avatar")

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      })
    } catch (error) {
      console.error("Create course error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Course owner/Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user owns the course or is admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      })
    }

    const allowedUpdates = [
      "title",
      "description",
      "thumbnail",
      "category",
      "level",
      "price",
      "tags",
      "requirements",
      "whatYouWillLearn",
      "curriculum",
      "isPublished",
      "featured",
    ]

    const updates = {}
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("instructor", "firstName lastName avatar")

    res.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    })
  } catch (error) {
    console.error("Update course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Course owner/Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user owns the course or is admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      })
    }

    await Course.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Delete course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/courses/categories
// @desc    Get course categories
// @access  Public
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await Course.distinct("category", { isPublished: true })

    res.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
