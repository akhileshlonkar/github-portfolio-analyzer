const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  summary: {
    type: String,
    required: true,
  },

  strengths: [String],

  weaknesses: [String],

  score: {
    type: Number,
    min: 1,
    max: 100,
  },

  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);