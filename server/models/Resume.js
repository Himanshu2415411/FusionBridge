const mongoose = require("mongoose")

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resumeData: {
    type: Object,
  },
  atsScore: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

ResumeSchema.index({ user: 1 })

module.exports = mongoose.model("Resume", ResumeSchema)
