const mongoose = require("mongoose")

const RoleSkillSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

RoleSkillSchema.index({ role: "text", skills: "text" })

module.exports = mongoose.model("RoleSkill", RoleSkillSchema)
