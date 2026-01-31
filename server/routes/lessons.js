const express = require("express")
const { auth, optionalAuth } = require("../middleware/auth")
const {
  getLessonDetails,
  completeLesson,
} = require("../controllers/lessonProgress.controller")

const router = express.Router()

router.get("/:courseId/:lessonId", optionalAuth, getLessonDetails)
router.post("/:courseId/:lessonId/complete", auth, completeLesson)

module.exports = router
