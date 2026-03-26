const mongoose = require("mongoose");

const CareerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  skills: [String],

  experience: [
    {
      company: String,
      role: String,
      startDate: Date,
      endDate: Date,
      description: String,
    },
  ],

  projects: [
    {
      title: String,
      description: String,
      techStack: [String],
      githubLink: String,
      liveLink: String,
    },
  ],

  education: [
    {
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
    },
  ],

  links: {
    github: String,
    linkedin: String,
    portfolio: String,
  },

  targetRole: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CareerProfile", CareerProfileSchema);
