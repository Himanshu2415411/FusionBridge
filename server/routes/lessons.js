const express = require("express")
const { optionalAuth } = require("../middleware/auth")
const { getLessonDetails } = require("../controllers/lessonProgress.controller")

const router = express.Router()

router.get("/:courseId/:lessonId", optionalAuth, getLessonDetails)

module.exports = router
