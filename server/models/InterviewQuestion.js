const mongoose = require("mongoose")

const InterviewQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
  },
  question: {
    type: String,
  },
  type: {
    type: String,
    enum: ["technical", "coding", "behavioral"],
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("InterviewQuestion", InterviewQuestionSchema)
