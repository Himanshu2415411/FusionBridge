const express = require("express")
const { auth } = require("../middleware/auth")
const { getLessonDetails } = require("../controllers/lessonProgress.controller")
const { submitQuiz, getQuizAttempts } = require("../controllers/quiz.controller")
const { ApiResponse } = require("../utils/apiResponse")
const { isEnrolledInCourse } = require("../middleware/authorization")
const { quizLimiter } = require("../middleware/rateLimiting")
const Course = require("../models/Course")

const router = express.Router()

/**
 * GET /api/lessons/:courseId/:lessonId
 * Get lesson details with video URL and resources
 */
router.get("/:courseId/:lessonId", auth, isEnrolledInCourse, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    // Find lesson in curriculum
    let lesson = null
    let sectionIndex = -1

    for (let i = 0; i < course.curriculum.length; i++) {
      const foundLesson = course.curriculum[i].lessons.find(
        (l) => l._id.toString() === lessonId
      )
      if (foundLesson) {
        lesson = foundLesson
        sectionIndex = i
        break
      }
    }

    if (!lesson) {
      return res.status(404).json(
        new ApiResponse(404, null, "Lesson not found").toJSON()
      )
    }

    // Format lesson data with resources
    const lessonData = {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration,
      order: lesson.order,
      isPreview: lesson.isPreview,
      resources: lesson.resources || [],
      quiz: lesson.quiz || [],
      section: {
        index: sectionIndex,
        title: course.curriculum[sectionIndex].title,
      },
    }

    return res.json(
      new ApiResponse(200, lessonData, "Lesson details retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get lesson details error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/lessons/:courseId/:lessonId/resources
 * Get lesson resources only
 */
router.get("/:courseId/:lessonId/resources", auth, isEnrolledInCourse, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    // Find lesson
    let lesson = null

    for (const section of course.curriculum) {
      lesson = section.lessons.find((l) => l._id.toString() === lessonId)
      if (lesson) break
    }

    if (!lesson) {
      return res.status(404).json(
        new ApiResponse(404, null, "Lesson not found").toJSON()
      )
    }

    const resources = (lesson.resources || []).map((resource) => ({
      title: resource.title,
      url: resource.url,
      type: resource.type,
      icon: getResourceIcon(resource.type),
    }))

    return res.json(
      new ApiResponse(200, resources, "Resources retrieved").toJSON()
    )
  } catch (error) {
    console.error("Get resources error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/lessons/:courseId/:lessonId/quiz
 * Get quiz for lesson
 */
router.get("/:courseId/:lessonId/quiz", auth, isEnrolledInCourse, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params

    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json(
        new ApiResponse(404, null, "Course not found").toJSON()
      )
    }

    // Find lesson
    let lesson = null

    for (const section of course.curriculum) {
      lesson = section.lessons.find((l) => l._id.toString() === lessonId)
      if (lesson) break
    }

    if (!lesson) {
      return res.status(404).json(
        new ApiResponse(404, null, "Lesson not found").toJSON()
      )
    }

    const quiz = lesson.quiz || []

    if (quiz.length === 0) {
      return res.status(404).json(
        new ApiResponse(404, null, "No quiz for this lesson").toJSON()
      )
    }

    // Return quiz without correct answers (obfuscated for security)
    const quizData = quiz.map((question) => ({
      question: question.question,
      options: question.options,
    }))

    return res.json(
      new ApiResponse(
        200,
        {
          lessonId,
          questions: quizData,
          totalQuestions: quizData.length,
        },
        "Quiz retrieved"
      ).toJSON()
    )
  } catch (error) {
    console.error("Get quiz error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * POST /api/lessons/:courseId/:lessonId/quiz
 * Submit quiz answers with rate limiting
 */
router.post("/:courseId/:lessonId/quiz", auth, quizLimiter, async (req, res) => {
  try {
    // Call quiz controller with courseId in params
    req.params.lessonId = req.params.lessonId
    req.body.courseId = req.params.courseId
    return submitQuiz(req, res)
  } catch (error) {
    console.error("Quiz submission error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * GET /api/lessons/:courseId/:lessonId/quiz-attempts
 * Get quiz attempt history
 */
router.get("/:courseId/:lessonId/quiz-attempts", auth, async (req, res) => {
  try {
    req.params.lessonId = req.params.lessonId
    return getQuizAttempts(req, res)
  } catch (error) {
    console.error("Get quiz attempts error:", error)
    return res.status(500).json(
      new ApiResponse(500, null, "Server error").toJSON()
    )
  }
})

/**
 * Helper function to get resource icon
 */
function getResourceIcon(type) {
  const icons = {
    pdf: '📄',
    link: '🔗',
    code: '💻',
  }
  return icons[type] || '📎'
}

module.exports = router
