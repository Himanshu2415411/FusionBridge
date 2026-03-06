const express = require("express")
const { auth, optionalAuth } = require("../middleware/auth")
const { getLessonDetails } = require("../controllers/lessonProgress.controller")
const { getQuizAttempts } = require("../controllers/quiz.controller")

const router = express.Router()

router.get("/:courseId/:lessonId", optionalAuth, getLessonDetails)

// GET /api/lessons/:lessonId/quiz-attempts - Get quiz attempt history for a lesson
router.get("/:lessonId/quiz-attempts", auth, getQuizAttempts)

module.exports = router
