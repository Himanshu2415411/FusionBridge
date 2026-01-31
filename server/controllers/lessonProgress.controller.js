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

const getLessonDetails = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params

    const course = await Course.findById(courseId).populate(
      "instructor",
      "firstName lastName avatar"
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const found = findLessonInCourse(course, lessonId)

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course",
      })
    }

    const { section, lesson } = found

    let completed = false

    if (req.user) {
      const user = await User.findById(req.user._id)

      const enrollment = user.enrolledCourses.find(
        (ec) => ec.course.toString() === courseId.toString()
      )

      if (enrollment) {
        completed = enrollment.completedLessons.some(
          (id) => id.toString() === lessonId.toString()
        )
      }
    }

    return res.json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        sectionId: section._id,
        sectionTitle: section.title,
        lesson: {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: lesson.order,
          isPreview: lesson.isPreview,
          resources: lesson.resources || [],
        },
        completed,
      },
    })
  } catch (error) {
    console.error("Get lesson details error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getLessonDetails,
}
