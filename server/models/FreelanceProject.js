const mongoose = require("mongoose");

const FreelanceProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  clientName: {
    type: String,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  techStack: [String],

  estimatedBudget: {
    type: Number,
  },

  estimatedDuration: {
    type: String,
  },

  status: {
    type: String,
    enum: ["planning", "in-progress", "completed"],
    default: "planning",
  },

  tasks: [
    {
      taskTitle: String,
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FreelanceProjectSchema.index({ user: 1 })

module.exports = mongoose.model("FreelanceProject", FreelanceProjectSchema);
