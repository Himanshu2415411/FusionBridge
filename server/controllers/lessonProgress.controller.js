const User = require("../models/User")
const Course = require("../models/Course")

const findLessonInCourse = (course, lessonId) => {
  for (const section of course.curriculum || []) {
    for (const lesson of section.lessons || []) {
      if (lesson._id.toString() === lessonId.toString()) {
        return { section, lesson }
      }
    }
  }
  return null
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

    await user.save()

    const totalLessons = course.totalLessons || 0
    const completedLessonsCount = enrollment.completedLessons.length

    const progressPercent =
      totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100)

    res.json({
      success: true,
      message: alreadyCompleted ? "Lesson already completed" : "Lesson marked as completed",
      data: {
        courseId: course._id,
        lessonId,
        totalLessons,
        completedLessonsCount,
        progressPercent,
        isCompleted: totalLessons > 0 && completedLessonsCount >= totalLessons,
        lastAccessedLesson: enrollment.lastAccessedLesson,
      },
    })
  } catch (error) {
    console.error("Complete lesson error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  completeLesson,
}
