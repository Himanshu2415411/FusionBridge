const mongoose = require("mongoose")

const ProjectIdeaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  techStack: [String],
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
  },
  estimatedTime: {
    type: String,
  },
  generatedFromSkills: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

ProjectIdeaSchema.index({ title: "text", description: "text", techStack: "text" })

module.exports = mongoose.model("ProjectIdea", ProjectIdeaSchema)
