const express = require("express")
const User = require("../models/User")
const Course = require("../models/Course")
const { auth } = require("../middleware/auth")
const { completeLessonForUser } = require("../utils/lessonCompletion")
const crypto = require("crypto")
const { updateProgressValidation } = require("../middleware/validators/progress.validator")
const validateRequest = require("../middleware/validateRequest")
const { markLessonComplete } = require("../controllers/lessonProgress.controller")
const { ApiResponse } = require("../utils/apiResponse")
const { isEnrolledInCourse, ownsProgressRecord } = require("../middleware/authorization")
const { validateWatchTime, preventDuplicateCompletion, validateLessonExists } = require("../middleware/lessonValidation")
const { xpActionLimiter } = require("../middleware/rateLimiting")
const { atomicLessonCompletion, atomicXpAward } = require("../utils/transactions")
const { logActivity, ACTIVITY_TYPES } = require("../services/activityLogger")
const { getBadgesForEvent, getBadgeDetails } = require("../utils/badgeEarner")
const { generateCertificateForCompletion } = require("../controllers/certificate.controller")
const { updateStreak, checkStreakMilestone } = require("../utils/streakCalculator")

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
 * Marks a lesson as completed with XP, badges, and activity logging
 * Requires: 80% watch time, enrollment, valid lesson
 */
router.post(
  "/lesson",
  auth,
  xpActionLimiter,
  validateWatchTime,
  preventDuplicateCompletion,
  validateLessonExists,
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.body
      const userId = req.user._id

      const user = await User.findById(userId)
      const course = await Course.findById(courseId)

      if (!course) {
        return res.status(404).json(
          new ApiResponse(404, null, "Course not found").toJSON()
        )
      }

      // Use atomic transaction for consistency
      const completionResult = await atomicLessonCompletion(userId, courseId, lessonId)

      if (!completionResult.success) {
        return res.status(409).json(
          new ApiResponse(409, null, completionResult.error).toJSON()
        )
      }

      // Award XP for lesson completion (10 XP)
      const xpResult = await atomicXpAward(userId, 10, "lesson_completion")

      if (!xpResult.success) {
        console.error("XP award failed:", xpResult.error)
      }

      // Update user with new XP and level
      if (xpResult.success) {
        user.xp = xpResult.newXp
        user.level = xpResult.newLevel
      }

      // Get lesson details
      let lessonTitle = "Lesson"
      for (const section of course.curriculum) {
        const lesson = section.lessons.find((l) => l._id.toString() === lessonId)
        if (lesson) {
          lessonTitle = lesson.title
          break
        }
      }

      // Log activity
      await logActivity(userId, ACTIVITY_TYPES.LESSON_COMPLETED, {
        courseId,
        courseName: course.title,
        lessonId,
        lessonName: lessonTitle,
      })

      // Check for badges
      const enrollment = user.enrolledCourses.find((ec) => ec.course.toString() === courseId)
      const completedLessonsInCourse = enrollment?.completedLessons?.length || 0

      let badgesEarned = []
      let totalXpFromBadges = 0

      badgesEarned = getBadgesForEvent('lesson_completed', {
        lessonsCompleted: completedLessonsInCourse + 1,
      })

      // Add badges to user
      for (const badgeId of badgesEarned) {
        const badge = getBadgeDetails(badgeId)
        if (badge && !user.badges.find((b) => b.name === badge.name)) {
          user.badges.push({
            name: badge.name,
            icon: badge.icon,
            earnedAt: new Date(),
          })
          totalXpFromBadges += badge.xp
          user.xp += badge.xp

          // Log badge earned
          await logActivity(userId, ACTIVITY_TYPES.BADGE_EARNED, {
            badgeName: badge.name,
            badgeId: badge.id,
            icon: badge.icon,
          })
        }
      }

      // Recalculate level with badge XP
      user.level = Math.floor(user.xp / 1000) + 1

      // Update streak
      const today = new Date()
      const lastActivityDay = user.lastActivityDate ? new Date(user.lastActivityDate) : null
      const lastActivityDayOnly = lastActivityDay
        ? new Date(lastActivityDay.getFullYear(), lastActivityDay.getMonth(), lastActivityDay.getDate())
        : null
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const wasActivityToday = lastActivityDayOnly && lastActivityDayOnly.getTime() === todayOnly.getTime()

      const streakUpdate = updateStreak(
        user.longestStreak || 0,
        user.currentStreak || 0,
        user.lastActivityDate,
        wasActivityToday
      )

      user.longestStreak = streakUpdate.longestStreak
      user.currentStreak = streakUpdate.currentStreak
      user.lastActivityDate = new Date()

      // Check for streak milestones
      const streakMilestone = checkStreakMilestone(user.currentStreak)
      if (streakMilestone) {
        const milestoneBadge = getBadgeDetails(streakMilestone.badge.toLowerCase().replace(/ /g, '_'))
        if (milestoneBadge && !user.badges.find((b) => b.name === milestoneBadge.name)) {
          user.badges.push({
            name: milestoneBadge.name,
            icon: milestoneBadge.icon,
            earnedAt: new Date(),
          })
          user.xp += milestoneBadge.xp

          await logActivity(userId, ACTIVITY_TYPES.STREAK_MILESTONE, {
            streakCount: user.currentStreak,
          })

          await logActivity(userId, ACTIVITY_TYPES.BADGE_EARNED, {
            badgeName: milestoneBadge.name,
            badgeId: milestoneBadge.id,
            icon: milestoneBadge.icon,
          })
        }
      }

      // Check if course is completed
      const courseCompletion = enrollment && enrollment.completedLessons.length === course.totalLessons
      if (courseCompletion && !enrollment.isCourseCompleted) {
        enrollment.isCourseCompleted = true
        enrollment.completedAt = new Date()

        // Award course completion XP
        const courseXpResult = await atomicXpAward(userId, COURSE_COMPLETION_XP, "course_completion")
        if (courseXpResult.success) {
          user.xp = courseXpResult.newXp
          user.level = courseXpResult.newLevel
        }

        // Log course completion
        await logActivity(userId, ACTIVITY_TYPES.COURSE_COMPLETED, {
          courseId,
          courseName: course.title,
        })

        // Check for course completion badges
        const coursesCompleted = user.enrolledCourses.filter(
          (ec) => ec.isCourseCompleted
        ).length

        const courseBadges = getBadgesForEvent('course_completed', {
          coursesCompleted,
        })

        for (const badgeId of courseBadges) {
          const badge = getBadgeDetails(badgeId)
          if (badge && !user.badges.find((b) => b.name === badge.name)) {
            user.badges.push({
              name: badge.name,
              icon: badge.icon,
              earnedAt: new Date(),
            })
            user.xp += badge.xp

            await logActivity(userId, ACTIVITY_TYPES.BADGE_EARNED, {
              badgeName: badge.name,
              badgeId: badge.id,
              icon: badge.icon,
            })
          }
        }

        // Generate certificate
        const certificate = await generateCertificateForCompletion(userId, courseId)
        if (certificate) {
          enrollment.certificateUnlocked = true
        }
      }

      // Update level up status
      const leveledUp = xpResult.success && xpResult.leveledUp

      if (leveledUp) {
        await logActivity(userId, ACTIVITY_TYPES.LEVEL_UP, {
          newLevel: user.level,
          totalXp: user.xp,
        })
      }

      // Save user
      await user.save()

      const { progress } = completionResult

      return res.json(
        new ApiResponse(
          200,
          {
            progress,
            xpAwarded: (xpResult.success ? 10 : 0) + totalXpFromBadges + (courseCompletion ? COURSE_COMPLETION_XP : 0),
            newLevel: user.level,
            totalXp: user.xp,
            leveledUp,
            badgesEarned: badgesEarned.map((id) => {
              const badge = getBadgeDetails(id)
              return {
                id,
                name: badge?.name,
                icon: badge?.icon,
              }
            }),
            courseCompleted: courseCompletion,
            certificateUnlocked: courseCompletion,
          },
          "Lesson marked as completed"
        ).toJSON()
      )
    } catch (error) {
      console.error("Lesson progress error:", error)
      return res.status(500).json(
        new ApiResponse(500, null, "Server error").toJSON()
      )
    }
  }
)

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

router.post("/complete", auth, markLessonComplete)

module.exports = router
