const express = require("express")
const { auth } = require("../middleware/auth")
const { getLessonDetails } = require("../controllers/lessonProgress.controller")
const { submitQuiz, getQuizAttempts } = require("../controllers/quiz.controller")
const { ApiResponse } = require("../utils/apiResponse")

const router = express.Router()

// submit quiz
router.post("/:lessonId/quiz", auth, submitQuiz)

// get quiz attempt history
router.get("/:lessonId/quiz-attempts", auth, getQuizAttempts)

// get lesson details
router.get("/:courseId/:lessonId", auth, getLessonDetails)

module.exports = router