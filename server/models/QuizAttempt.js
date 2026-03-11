const mongoose = require("mongoose")

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course reference is required"],
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Lesson reference is required"],
  },
  answers: {
    type: [Number],
    default: [],
  },
  score: {
    type: Number,
    required: [true, "Score is required"],
    min: 0,
    max: 100,
  },
  correctAnswers: {
    type: Number,
    required: [true, "Correct answers count is required"],
    min: 0,
  },
  totalQuestions: {
    type: Number,
    required: [true, "Total questions count is required"],
    min: 1,
  },
  passed: {
    type: Boolean,
    required: [true, "Pass status is required"],
  },
  attemptNumber: {
    type: Number,
    required: [true, "Attempt number is required"],
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes for efficient queries
quizAttemptSchema.index({ user: 1 })
quizAttemptSchema.index({ lesson: 1 })
quizAttemptSchema.index({ course: 1 })
quizAttemptSchema.index({ user: 1, lesson: 1 })
quizAttemptSchema.index({ lesson: 1 })

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema)

module.exports = QuizAttempt
