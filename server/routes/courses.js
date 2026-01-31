const express = require("express")
const Course = require("../models/Course")
const User = require("../models/User")
const { auth, optionalAuth, authorize } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

/* ===========================
   GET /api/courses
   =========================== */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "firstName lastName avatar")
      .sort({ createdAt: -1 })

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

    res.json({ success: true, courses })
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
   GET /api/courses/:courseId/learn
   Resume course learning (Auth required)
   =========================== */
router.get("/:courseId/learn", auth, async (req, res) => {
  try {
    const { courseId } = req.params

    const user = await User.findById(req.user._id)

    const course = await Course.findById(courseId).populate(
      "instructor",
      "firstName lastName avatar bio"
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const enrollment = user.enrolledCourses.find(
      (ec) => ec.course.toString() === courseId
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

    // ✅ Find next lesson (first incomplete lesson in order)
    let nextLesson = null

    for (const section of course.curriculum || []) {
      for (const lesson of section.lessons || []) {
        const isDone = enrollment.completedLessons.some(
          (id) => id.toString() === lesson._id.toString()
        )

        if (!isDone) {
          nextLesson = {
            _id: lesson._id,
            title: lesson.title,
          }
          break
        }
      }
      if (nextLesson) break
    }

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription,
          thumbnail: course.thumbnail,
          category: course.category,
          level: course.level,
          instructor: course.instructor,
          curriculum: course.curriculum,
          totalLessons,
          totalDurationMinutes: course.totalDurationMinutes,
        },
        progress: {
          completedLessonsCount,
          totalLessons,
          progressPercent,
          isCompleted,
          lastAccessedLesson: enrollment.lastAccessedLesson || null,
        },
        nextLesson,
      },
    })
  } catch (error) {
    console.error("Resume course error:", error)
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
   =========================== */
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

    const alreadyEnrolled = user.enrolledCourses.find(
      ec => ec.course.toString() === course._id.toString()
    )

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      })
    }

    user.enrolledCourses.push({
      course: course._id,
      completedLessons: [],
      lastAccessedLesson: null,
    })

    course.studentsEnrolled += 1

    await user.save()
    await course.save()

    res.json({
      success: true,
      message: "Course enrolled successfully",
      courseId: course._id,
    })
  } catch (error) {
    console.error("Enroll error:", error)
    res.status(500).json({ success: false, message: "Server error" })
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
  [
    auth,
    authorize("admin", "instructor"),
    body("title").isLength({ min: 5 }),
    body("description").isLength({ min: 20 }),
    body("category").notEmpty(),
    body("level").isIn(["beginner", "intermediate", "advanced"]),
    body("price").isNumeric(),
    body("duration").isNumeric(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

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


module.exports = router
