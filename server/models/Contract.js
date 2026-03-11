const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FreelanceProject",
    required: true,
  },

  clientName: {
    type: String,
  },

  contractText: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contract", ContractSchema);
