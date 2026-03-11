const express = require("express")
const { auth } = require("../middleware/auth")
const { searchPlatform } = require("../controllers/search.controller")

const router = express.Router()

// @route   GET /api/search?q=<term>
// @desc    Search across courses, project ideas, and role skills
// @access  Private
router.get("/", auth, searchPlatform)

module.exports = router
