const User = require("../models/User")
const Course = require("../models/Course")

const COURSE_COMPLETION_XP = 200

const findLessonInCourse = (course, lessonId) => {
  if (!course?.curriculum?.length) return null

  for (const section of course.curriculum || []) {
    for (const lesson of section.lessons || []) {
      if (lesson._id.toString() === lessonId.toString()) {
        return { section, lesson }
      }
    }
  }

  return null
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

const completeLesson = async (req, res) => {
  try {
    const userId = req.user._id
    const { courseId, lessonId } = req.params

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const lessonFound = findLessonInCourse(course, lessonId)
    if (!lessonFound) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    const user = await User.findById(userId)

    const enrollment = user.enrolledCourses.find(
      (ec) => ec.course.toString() === courseId.toString()
    )

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      })
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId.toString()
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
    console.error("Complete lesson error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  completeLesson,
}
