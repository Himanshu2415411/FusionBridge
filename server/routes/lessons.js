const express = require("express")
const { auth } = require("../middleware/auth")
const { completeLesson } = require("../controllers/lessonProgress.controller")

const router = express.Router()

router.post("/:courseId/:lessonId/complete", auth, completeLesson)

module.exports = router
