const QuizAttempt = require("../models/QuizAttempt")

/**
 * Get quiz attempt history for a specific lesson
 * @route GET /api/quiz/attempts/:lessonId
 * @access Private
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { lessonId } = req.params
    const userId = req.user._id

    // Find all attempts for this user and lesson
    const attempts = await QuizAttempt.find({
      user: userId,
      lesson: lessonId,
    })
      .sort({ createdAt: -1 })
      .select("attemptNumber score correctAnswers totalQuestions passed createdAt")

    // Format response
    const formattedAttempts = attempts.map((attempt) => ({
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      passed: attempt.passed,
      createdAt: attempt.createdAt,
    }))

    res.json({
      success: true,
      attempts: formattedAttempts,
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
  getQuizAttempts,
}
