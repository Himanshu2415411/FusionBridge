const Course = require("../models/Course")
const ProjectIdea = require("../models/ProjectIdea")
const RoleSkill = require("../models/RoleSkill")

const searchPlatform = async (req, res) => {
  try {
    const query = (req.query.q || "").trim()

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required. Use ?q=<term>",
      })
    }

    const [courses, projectIdeas, roleSkills] = await Promise.all([
      Course.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .select("title description category level tags"),

      ProjectIdea.find({ $text: { $search: query } })
        .limit(5)
        .select("title description techStack difficulty"),

      RoleSkill.find({ $text: { $search: query } })
        .limit(5)
        .select("role skills description"),
    ])

    res.json({
      success: true,
      results: {
        courses,
        projectIdeas,
        roleSkills,
      },
    })
  } catch (error) {
    console.error("Search error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

module.exports = { searchPlatform }
