const mongoose = require("mongoose")

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: [true, "Certificate ID is required"],
    unique: true,
    trim: true,
  },
  verificationHash: {
    type: String,
    required: [true, "Verification hash is required"],
    unique: true,
  },
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
  userName: {
    type: String,
    required: [true, "User name is required"],
    trim: true,
  },
  courseTitle: {
    type: String,
    required: [true, "Course title is required"],
    trim: true,
  },
  instructorName: {
    type: String,
    required: [true, "Instructor name is required"],
    trim: true,
  },
  completedAt: {
    type: Date,
    required: [true, "Completion date is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Indexes for efficient queries
certificateSchema.index({ certificateId: 1 })
certificateSchema.index({ verificationHash: 1 })

const Certificate = mongoose.model("Certificate", certificateSchema)

module.exports = Certificate
