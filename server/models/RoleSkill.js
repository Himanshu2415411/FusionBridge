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

module.exports = mongoose.model("RoleSkill", RoleSkillSchema)
