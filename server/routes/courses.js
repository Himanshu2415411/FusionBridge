const express = require("express")
const Course = require("../models/Course")
const User = require("../models/User")
const { auth, optionalAuth, authorize } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")
const { completeLessonForUser } = require("../utils/lessonCompletion")
const { recordQuizAttempt } = require("../services/quizAttempt.service")
const { getPaginationParams } = require("../utils/pagination")
const { createCourseValidation } = require("../middleware/validators/course.validator")
const { submitQuizValidationWithParams } = require("../middleware/validators/quiz.validator")
const validateRequest = require("../middleware/validateRequest")
const upload = require("../middleware/uploadCloudinary")
const courseController = require("../controllers/course.controller")

const router = express.Router()

/* ===========================
   GET /api/courses
   =========================== */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      search = "",
      category,
      level,
    } = req.query

    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req.query)

    const query = { isPublished: true }

    if (search) {
      query.title = { $regex: search, $options: "i" }
    }

    if (category) {
      query.category = category
    }

    if (level) {
      query.level = level
    }

    const courses = await Course.find(query)
      .populate("instructor", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // 👇 Preserve your enrollment + progress logic
    if (req.user) {
      const user = await User.findById(req.user._id)

      courses.forEach(course => {
        const enrollment = user.enrolledCourses.find(
          ec => ec.course.toString() === course._id.toString()
        )

        course._doc.isEnrolled = !!enrollment

        if (enrollment) {
          const totalLessons = course.totalLessons || 0
          const completed = enrollment.completedLessons.length

          course._doc.progress =
            totalLessons === 0
              ? 0
              : Math.round((completed / totalLessons) * 100)
        } else {
          course._doc.progress = 0
        }
      })
    }

    const totalCourses = await Course.countDocuments(query)
    const totalPages = Math.ceil(totalCourses / limit)

    res.json({
      success: true,
      page,
      limit,
      totalCourses,
      totalPages,
      courses,
    })
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

/* ===========================
   GET /api/courses/enrolled
   =========================== */
router.get("/enrolled", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "enrolledCourses.course",
        populate: {
          path: "instructor",
          select: "firstName lastName avatar",
        },
      })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const enrolledCourses = user.enrolledCourses
      .filter(ec => ec.course && ec.course.isPublished)
      .map(ec => {
        const course = ec.course

        const totalLessons = course.totalLessons || 0
        const completedLessons = ec.completedLessons.length

        const progress =
          totalLessons === 0
            ? 0
            : Math.round((completedLessons / totalLessons) * 100)

        // Find next lesson
        let nextLesson = null
        for (const section of course.curriculum || []) {
          for (const lesson of section.lessons || []) {
            if (!ec.completedLessons.includes(lesson._id)) {
              nextLesson = lesson.title
              break
            }
          }
          if (nextLesson) break
        }

        return {
          _id: course._id,
          title: course.title,
          category: course.category,
          level: course.level,
          thumbnail: course.thumbnail,
          instructor: course.instructor,
          rating: course.averageRating,
          studentsEnrolled: course.studentsEnrolled,
          progress,
          completedLessons,
          totalLessons,
          nextLesson,
          enrolledAt: ec.enrolledAt,
        }
      })

    res.json({
      success: true,
      courses: enrolledCourses,
    })
  } catch (error) {
    console.error("Get enrolled courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/* ===========================
   GET /api/courses/:id
   ✅ Access Control:
   - Enrolled user => full curriculum
   - Not enrolled  => preview-only curriculum
   =========================== */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "firstName lastName avatar bio"
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    let isEnrolled = false
    let progress = 0
    let completed = false

    if (req.user) {
      const user = await User.findById(req.user._id)

      const enrollment = user.enrolledCourses.find(
        (ec) => ec.course.toString() === course._id.toString()
      )

      if (enrollment) {
        isEnrolled = true

        const totalLessons = course.totalLessons || 0
        const completedCount = enrollment.completedLessons.length

        progress =
          totalLessons === 0
            ? 0
            : Math.round((completedCount / totalLessons) * 100)

        completed = totalLessons > 0 && completedCount === totalLessons
      }
    }

    // ✅ Preview-only curriculum if NOT enrolled
    let safeCurriculum = course.curriculum || []

    if (!isEnrolled) {
      safeCurriculum = (course.curriculum || [])
        .map((section) => {
          const previewLessons = (section.lessons || []).filter(
            (lesson) => lesson.isPreview === true
          )

          return {
            ...section.toObject(),
            lessons: previewLessons.map((l) => ({
              _id: l._id,
              title: l.title,
              description: l.description,
              duration: l.duration,
              order: l.order,
              isPreview: l.isPreview,
            })),
          }
        })
        .filter((section) => section.lessons.length > 0)
    }

    res.json({
      success: true,
      course: {
        ...course.toObject(),
        curriculum: safeCurriculum,
        isEnrolled,
        progress,
        completed,
      },
    })
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

/* ===========================
   POST /api/courses/:id/enroll
   User Enrollment
   =========================== */
router.post("/:id/enroll", auth, courseController.enrollCourse)

/* ===========================
   GET /api/courses/:id/learn
   Learning Session API
   =========================== */
router.get("/:id/learn", auth, async (req, res) => {
  try {
    const courseId = req.params.id

    const course = await Course.findById(courseId)
      .populate("instructor", "firstName lastName avatar")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(req.user._id)

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    const totalLessons = course.totalLessons || 0
    const completedLessonsCount = enrollment.completedLessons.length

    const progressPercent =
      totalLessons === 0
        ? 0
        : Math.round((completedLessonsCount / totalLessons) * 100)

    const isCompleted =
      totalLessons > 0 && completedLessonsCount === totalLessons

    /* ---------- find next lesson ---------- */
    const completedSet = new Set(
      enrollment.completedLessons.map(id => id.toString())
    )

    let nextLesson = null

    for (const section of course.curriculum || []) {
      for (const lesson of section.lessons || []) {
        if (!completedSet.has(lesson._id.toString())) {
          nextLesson = {
            sectionId: section._id,
            sectionTitle: section.title,
            lessonId: lesson._id,
            title: lesson.title,
            duration: lesson.duration,
            order: lesson.order,
          }
          break
        }
      }
      if (nextLesson) break
    }

    res.json({
      success: true,
      data: {
        course,
        progress: {
          completedLessonsCount,
          totalLessons,
          progressPercent,
          isCompleted,
          lastAccessedLesson: enrollment.lastAccessedLesson,
        },
        completedLessons: enrollment.completedLessons,
        nextLesson,
      },
    })
  } catch (error) {
    console.error("Learning session error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})


router.get("/:id/certificate", auth, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(req.user._id)
    const course = await Course.findById(id)
    .populate("instructor", "firstName lastName avatar")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === id
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    return res.json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        eligible: enrollment.certificateUnlocked === true,
        completedAt: enrollment.completedAt,
        instructor: course.instructor
      }
    })
  } catch (error) {
    console.error("Certificate error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})


const PDFDocument = require("pdfkit")

router.get("/:id/certificate/download", auth, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(req.user._id)
    const course = await Course.findById(id).populate(
      "instructor",
      "firstName lastName"
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === id
    )

    if (!enrollment || !enrollment.certificateUnlocked) {
      return res.status(403).json({
        success: false,
        message: "Certificate not unlocked",
      })
    }

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape"
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FusionBridge-Certificate.pdf`
    )

    doc.pipe(res)

    doc.fontSize(30).text("FusionBridge Certificate", {
      align: "center"
    })

    doc.moveDown(2)

    doc.fontSize(20).text(
      `This certifies that`,
      { align: "center" }
    )

    doc.moveDown()

    doc.fontSize(28).text(
      `${user.firstName} ${user.lastName}`,
      { align: "center" }
    )

    doc.moveDown()

    doc.fontSize(20).text(
      `has successfully completed the course`,
      { align: "center" }
    )

    doc.moveDown()

    doc.fontSize(24).text(
      `${course.title}`,
      { align: "center" }
    )

    doc.moveDown(2)

    doc.fontSize(16).text(
      `Instructor: ${course.instructor.firstName} ${course.instructor.lastName}`,
      { align: "center" }
    )

    doc.moveDown()

    doc.text(
      `Completed on: ${new Date(enrollment.completedAt).toDateString()}`,
      { align: "center" }
    )

    doc.end()

  } catch (error) {
    console.error("Certificate download error:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
})


router.get("/:id/timeline", auth, async (req, res) => {
  try {
    const courseId = req.params.id

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    const completedSet = new Set(
      enrollment.completedLessons.map(id => id.toString())
    )

    let currentLessonFound = false

    const timeline = course.curriculum.map(section => {
      return {
        _id: section._id,
        title: section.title,
        lessons: section.lessons.map(lesson => {
          let status = "locked"

          if (completedSet.has(lesson._id.toString())) {
            status = "completed"
          } else if (!currentLessonFound) {
            status = "current"
            currentLessonFound = true
          }

          return {
            _id: lesson._id,
            title: lesson.title,
            duration: lesson.duration,
            order: lesson.order,
            status,
          }
        }),
      }
    })

    res.json({
      success: true,
      data: {
        courseId,
        timeline,
      },
    })
  } catch (error) {
    console.error("Course timeline error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})



/* ===========================
   PUT /api/courses/:id/progress
   ❌ DEPRECATED (Phase 7)
   =========================== */
router.put("/:id/progress", auth, async (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "Percentage-based progress is deprecated. Use lesson progress API.",
  })
})

/* ===========================
   POST /api/courses
   (Admin / Instructor)
   =========================== */
router.post(
  "/",
  auth,
  authorize("admin", "instructor"),
  createCourseValidation,
  validateRequest,
  async (req, res) => {
    try {
      const course = new Course({
        ...req.body,
        instructor: req.user._id,
      })

      await course.save()

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      })
    } catch (error) {
      console.error("Create course error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  }
)

/* ===========================
   POST /api/courses/:id/curriculum
   Add sections & lessons (Admin / Instructor)
   =========================== */
router.post(
  "/:id/curriculum",
  auth,
  authorize("admin", "instructor"),
  async (req, res) => {
    try {
      const { title, description, order, lessons } = req.body

      if (!title || !Array.isArray(lessons) || lessons.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Section title and lessons are required",
        })
      }

      const course = await Course.findById(req.params.id)
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      course.curriculum.push({
        title,
        description,
        order: order || course.curriculum.length + 1,
        lessons: lessons.map((lesson, index) => ({
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: index + 1,
          isPreview: lesson.isPreview || false,
        })),
      })

      await course.save()

      res.status(201).json({
        success: true,
        message: "Section and lessons added successfully",
        curriculum: course.curriculum,
      })
    } catch (error) {
      console.error("Add curriculum error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  }
)

/* ===========================
   POST /api/courses/:id/review
   =========================== */
router.post("/:id/review", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const courseId = req.params.id

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      })
    }

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const alreadyReviewed = course.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    )

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      })
    }

    course.reviews.push({
      user: req.user._id,
      rating,
      comment,
    })

    // 🔥 Use model method (clean architecture)
    course.calculateAverageRating()

    await course.save()

    res.json({
      success: true,
      message: "Review added successfully",
      averageRating: course.averageRating,
      reviewCount: course.reviewCount, // virtual
    })
  } catch (error) {
    console.error("Add review error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/* ===========================
   GET /api/courses/:id/reviews
   =========================== */
router.get("/:id/reviews", async (req, res) => {
  try {
    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(req.query)

    const course = await Course.findById(req.params.id)
      .populate("reviews.user", "firstName lastName avatar")
      .lean()

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const totalReviews = course.reviews ? course.reviews.length : 0
    const totalPages = Math.ceil(totalReviews / limit)

    // Paginate reviews (sort by newest first)
    const paginatedReviews = course.reviews
      ? course.reviews.slice(skip, skip + limit)
      : []

    res.json({
      success: true,
      page,
      limit,
      totalReviews,
      totalPages,
      averageRating: course.averageRating,
      reviews: paginatedReviews,
    })
  } catch (error) {
    console.error("Get reviews error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/* ===========================
   POST /api/courses/:courseId/lessons/:lessonId/quiz
   =========================== */
router.post(
  "/:courseId/lessons/:lessonId/quiz",
  auth,
  submitQuizValidationWithParams,
  validateRequest,
  async (req, res) => {
    try {
      const { answers } = req.body
      const { courseId, lessonId } = req.params

    const course = await Course.findById(courseId)
    const user = await User.findById(req.user._id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course to attempt quizzes",
      })
    }

    // Find lesson
    let lesson = null
    for (const section of course.curriculum) {
      lesson = section.lessons.find(
        l => l._id.toString() === lessonId
      )
      if (lesson) break
    }

    if (!lesson || !lesson.quiz || lesson.quiz.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No quiz available for this lesson",
      })
    }

    // Calculate score
    let score = 0
    lesson.quiz.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++
      }
    })

    const percentage = Math.round(
      (score / lesson.quiz.length) * 100
    )

    const passed = percentage >= 60

    // Record quiz attempt
    await recordQuizAttempt(
      user._id,
      course._id,
      lessonId,
      answers,
      percentage,
      score,
      lesson.quiz.length,
      passed
    )

    // 🔥 Auto-complete lesson if passed
    let lessonCompleted = false

    if (passed) {
      const result = await completeLessonForUser(
        user,
        course,
        lessonId
      )
      lessonCompleted = result.completed
    }

    // Save quiz attempt
    enrollment.quizAttempts.push({
      lessonId,
      score,
      totalQuestions: lesson.quiz.length,
      percentage,
      passed,
    })

    await user.save()

    res.json({
      success: true,
      data: {
        totalQuestions: lesson.quiz.length,
        correctAnswers: score,
        percentage,
        passed,
        lessonCompleted,
      },
    })


  } catch (error) {
    console.error("Quiz submission error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

router.put("/:courseId/lessons/:lessonId/quiz", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const { quiz } = req.body

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    let lessonFound = false

    for (const section of course.curriculum) {
      for (const lesson of section.lessons) {
        if (lesson._id.toString() === lessonId) {
          lesson.quiz = quiz
          lessonFound = true
        }
      }
    }

    if (!lessonFound) {
      return res.status(404).json({ success: false, message: "Lesson not found" })
    }

    await course.save()

    res.json({ success: true, message: "Quiz added successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})
router.get("/:courseId/lessons/:lessonId/quiz/history", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params

    const user = await User.findById(req.user._id)

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    const attempts = (enrollment.quizAttempts || []).filter(
      a => a.lessonId.toString() === lessonId
    )

    res.json({
      success: true,
      data: attempts,
    })
  } catch (error) {
    console.error("Quiz history error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})
router.get("/:courseId/lessons/:lessonId/quiz/summary", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params

    const user = await User.findById(req.user._id)

    const enrollment = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "User not enrolled in this course",
      })
    }

    const attempts = (enrollment.quizAttempts || []).filter(
      a => a.lessonId.toString() === lessonId
    )

    if (attempts.length === 0) {
      return res.json({
        success: true,
        data: {
          totalAttempts: 0,
          bestScore: 0,
          averageScore: 0,
          lastAttempt: null,
        }
      })
    }

    const totalAttempts = attempts.length
    const bestScore = Math.max(...attempts.map(a => a.percentage))
    const averageScore =
      Math.round(
        attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
      )

    const lastAttempt = attempts[attempts.length - 1]

    res.json({
      success: true,
      data: {
        totalAttempts,
        bestScore,
        averageScore,
        lastAttempt,
      }
    })

  } catch (error) {
    console.error("Quiz summary error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// === New Routes as Per Instructions ===
router.post(
  "/:id/enroll",
  auth,
  courseController.enrollCourse
)

router.post(
  "/:id/lessons",
  auth,
  upload.single("video"),
  courseController.addLesson
)

router.patch(
  "/:id/publish",
  auth,
  courseController.publishCourse
)

module.exports = router
