const mongoose = require("mongoose")
const Course = require("../models/Course")
const QuizAttempt = require("../models/QuizAttempt")
const { recordQuizAttempt } = require("../services/quizAttempt.service")

/**
 * Submit quiz answers
 * POST /api/lessons/:lessonId/quiz
 */
const submitQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params
    const { answers } = req.body
    const userId = req.user._id

    // find course containing this lesson
    const course = await Course.findOne({
      "curriculum.lessons._id": lessonId,
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // find lesson inside course
    let lesson = null

    for (const section of course.curriculum) {
      lesson = section.lessons.find(
        (l) => l._id.toString() === lessonId
      )
      if (lesson) break
    }

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      })
    }

    const quiz = lesson.quiz || []

    if (quiz.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This lesson has no quiz",
      })
    }

    // evaluate answers
    let correctAnswers = 0

    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++
      }
    })

    const totalQuestions = quiz.length
    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = score >= 60

    // store attempt
    await recordQuizAttempt(
      userId,
      course._id,
      lessonId,
      answers,
      score,
      correctAnswers,
      totalQuestions,
      passed
    )

    res.json({
      success: true,
      score,
      correctAnswers,
      totalQuestions,
      passed,
    })
  } catch (error) {
    console.error("Quiz submission error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

/**
 * Get quiz attempt history
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { lessonId } = req.params
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson ID",
      })
    }

    const attempts = await QuizAttempt.find({
      user: userId,
      lesson: lessonId,
    })
      .sort({ createdAt: -1 })
      .select(
        "attemptNumber score correctAnswers totalQuestions passed createdAt"
      )

    res.json({
      success: true,
      count: attempts.length,
      attempts,
    })
  } catch (error) {
    console.error("Get quiz attempts error:", error)

    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  submitQuiz,
  getQuizAttempts,
}