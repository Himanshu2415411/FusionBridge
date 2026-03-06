const QuizAttempt = require("../models/QuizAttempt")

/**
 * Records a quiz attempt for a user
 * @param {string} userId - User's ID
 * @param {string} courseId - Course's ID
 * @param {string} lessonId - Lesson's ID
 * @param {Array<number>} answers - Array of selected option indexes
 * @param {number} score - Score percentage (0-100)
 * @param {number} correctAnswers - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 * @param {boolean} passed - Whether the user passed
 * @returns {Object} Saved QuizAttempt document
 */
const recordQuizAttempt = async (
  userId,
  courseId,
  lessonId,
  answers,
  score,
  correctAnswers,
  totalQuestions,
  passed
) => {
  // Find how many attempts already exist for this user and lesson
  const previousAttempts = await QuizAttempt.countDocuments({
    user: userId,
    lesson: lessonId,
  })

  // Set attempt number
  const attemptNumber = previousAttempts + 1

  // Create new quiz attempt
  const quizAttempt = new QuizAttempt({
    user: userId,
    course: courseId,
    lesson: lessonId,
    answers,
    score,
    correctAnswers,
    totalQuestions,
    passed,
    attemptNumber,
  })

  // Save and return
  await quizAttempt.save()

  return quizAttempt
}

module.exports = {
  recordQuizAttempt,
}
