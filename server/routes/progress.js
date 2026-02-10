const express = require("express")
const User = require("../models/User")
const Course = require("../models/Course")
const { auth } = require("../middleware/auth")

const router = express.Router()

const COURSE_COMPLETION_XP = 200

const findLessonInCourse = (course, lessonId) => {
  if (!course?.curriculum?.length) return false

  for (const section of course.curriculum) {
    if (section?.lessons?.some((l) => l._id.toString() === lessonId)) {
      return true
    }
  }

  return false
}

const buildProgressPayload = ({ courseId, lessonId, enrollment, course }) => {
  const totalLessons = course.totalLessons || 0
  const completedLessonsCount = enrollment.completedLessons.length

  const progressPercent =
    totalLessons === 0
      ? 0
      : Math.round((completedLessonsCount / totalLessons) * 100)

  const isCompleted = totalLessons > 0 && completedLessonsCount === totalLessons

  return {
    courseId,
    lessonId: lessonId || null,
    totalLessons,
    completedLessonsCount,
    progressPercent,
    isCompleted,
    lastAccessedLesson: enrollment.lastAccessedLesson || null,
  }
}

/**
 * POST /api/progress/lesson
 * Marks a lesson as completed
 */
router.post("/lesson", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "courseId and lessonId are required",
      })
    }

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

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

    const lessonExists = findLessonInCourse(course, lessonId)

    if (!lessonExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    )

    if (!alreadyCompleted) {
      enrollment.completedLessons.push(lessonId)
    }

    enrollment.lastAccessedLesson = lessonId

    const progressData = buildProgressPayload({
      courseId,
      lessonId,
      enrollment,
      course,
    })

    let rewarded = false
    let xpAdded = 0

    if (progressData.isCompleted && enrollment.isCourseCompleted !== true) {
      enrollment.isCourseCompleted = true
      enrollment.completedAt = new Date()
      enrollment.certificateUnlocked = true

      user.coursesCompleted = (user.coursesCompleted || 0) + 1
      user.xp = (user.xp || 0) + COURSE_COMPLETION_XP

      xpAdded = COURSE_COMPLETION_XP
      rewarded = true
    }
    await user.save()

    return res.json({
      success: true,
      message: alreadyCompleted
        ? "Lesson already completed"
        : "Lesson marked as completed",
      rewarded,
      xpAdded,
      data: progressData,
    })
  } catch (error) {
    console.error("Lesson progress error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * POST /api/progress/lesson/access
 * Track lesson access (view/open)
 */
router.post("/lesson/access", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "courseId and lessonId are required",
      })
    }

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

    // find existing access entry
    const existing = enrollment.lessonAccessHistory.find(
      l => l.lessonId.toString() === lessonId
    )

    if (existing) {
      existing.lastAccessedAt = new Date()
      existing.accessCount += 1
    } else {
      enrollment.lessonAccessHistory.push({
        lessonId,
        lastAccessedAt: new Date(),
        accessCount: 1,
      })
    }

    enrollment.lastAccessedLesson = lessonId

    await user.save()

    res.json({
      success: true,
      message: "Lesson access tracked",
    })
  } catch (error) {
    console.error("Lesson access error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})



/**
 * DELETE /api/progress/lesson
 * Unmarks a lesson (remove from completedLessons)
 */
router.delete("/lesson", auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "courseId and lessonId are required",
      })
    }

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

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

    const lessonExists = findLessonInCourse(course, lessonId)

    if (!lessonExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    const before = enrollment.completedLessons.length

    enrollment.completedLessons = enrollment.completedLessons.filter(
      (id) => id.toString() !== lessonId
    )

    const after = enrollment.completedLessons.length

    if (
      enrollment.lastAccessedLesson &&
      enrollment.lastAccessedLesson.toString() === lessonId
    ) {
      enrollment.lastAccessedLesson = null
    }

    const progressData = buildProgressPayload({
      courseId,
      lessonId,
      enrollment,
      course,
    })

    if (!progressData.isCompleted) {
      enrollment.isCourseCompleted = false
      enrollment.completedAt = null
      enrollment.certificateUnlocked = false
    }


    await user.save()

    return res.json({
      success: true,
      message:
        before === after
          ? "Lesson was not completed already"
          : "Lesson uncompleted successfully",
      data: progressData,
    })
  } catch (error) {
    console.error("Uncomplete lesson error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * GET /api/progress/course/:courseId
 * Returns progress summary of a course for the current user
 */
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    const { courseId } = req.params

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

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

    return res.json({
      success: true,
      data: buildProgressPayload({ courseId, enrollment, course }),
    })
  } catch (error) {
    console.error("Course progress error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * GET /api/progress/course/:courseId/next-lesson
 * Returns next incomplete lesson for the current user in a course
 */
router.get("/course/:courseId/next-lesson", auth, async (req, res) => {
  try {
    const { courseId } = req.params

    const user = await User.findById(req.user._id)
    const course = await Course.findById(courseId)

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

    const completedSet = new Set(
      enrollment.completedLessons.map((id) => id.toString())
    )

    let nextLesson = null

    for (const section of course.curriculum || []) {
      for (const lesson of section.lessons || []) {
        if (!completedSet.has(lesson._id.toString())) {
          nextLesson = {
            courseId: course._id,
            sectionId: section._id,
            sectionTitle: section.title,
            lessonId: lesson._id,
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            isPreview: lesson.isPreview,
          }
          break
        }
      }
      if (nextLesson) break
    }

    res.json({
      success: true,
      data: {
        courseId: course._id,
        nextLesson,
      },
    })
  } catch (error) {
    console.error("Next lesson error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * GET /api/progress/course/:courseId/resume
 * Returns lesson to resume for user
 */
router.get("/course/:courseId/resume", auth, async (req, res) => {
  try {
    const { courseId } = req.params

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

    // 1️⃣ Resume last accessed lesson if exists
    if (enrollment.lastAccessedLesson) {
      return res.json({
        success: true,
        data: {
          courseId,
          resumeLessonId: enrollment.lastAccessedLesson,
          type: "resume",
        },
      })
    }

    // 2️⃣ Otherwise find next incomplete lesson
    const completedSet = new Set(
      enrollment.completedLessons.map(id => id.toString())
    )

    for (const section of course.curriculum || []) {
      for (const lesson of section.lessons || []) {
        if (!completedSet.has(lesson._id.toString())) {
          return res.json({
            success: true,
            data: {
              courseId,
              resumeLessonId: lesson._id,
              type: "next",
            },
          })
        }
      }
    }

    // 3️⃣ Course finished
    return res.json({
      success: true,
      data: {
        courseId,
        resumeLessonId: null,
        type: "completed",
      },
    })
  } catch (error) {
    console.error("Resume lesson error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

/**
 * GET /api/progress/course/:courseId/stats
 * Learning activity statistics for a course
 */
router.get("/course/:courseId/stats", auth, async (req, res) => {
  try {
    const { courseId } = req.params

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

    const history = enrollment.lessonAccessHistory || []

    const uniqueLessons = new Set(
      history.map(h => h.lessonId.toString())
    )

    const totalAccessCount = history.reduce(
      (sum, h) => sum + (h.accessCount || 0),
      0
    )

    const lastAccessedAt =
      history.length > 0
        ? history.reduce((latest, h) =>
            !latest || h.lastAccessedAt > latest
              ? h.lastAccessedAt
              : latest
          , null)
        : null

    return res.json({
      success: true,
      data: {
        courseId,
        lessonsAccessed: uniqueLessons.size,
        totalAccessCount,
        lastAccessedAt,
      },
    })
  } catch (error) {
    console.error("Course stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})


module.exports = router
