const mongoose = require("mongoose")

const ActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  message: {
    type: String,
  },

  metadata: {
    type: Object,
    default: {},
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

ActivitySchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("Activity", ActivitySchema)
