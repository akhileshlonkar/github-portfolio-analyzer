const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  profileType: {
    type: String,
    enum: ["individual", "company"],
    default: "individual",
  },

  avatar: {
    type: String,
    default: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
  },

  bio: {
    type: String,
    default: "",
  },

  publicRepos: {
    type: Number,
    default: 0,
  },

  followers: {
    type: Number,
    default: 0,
  },

  following: {
    type: Number,
    default: 0,
  },

  totalStars: {
    type: Number,
    default: 0,
  },

  totalForks: {
    type: Number,
    default: 0,
  },

  topLanguages: [String],

  topRepos: [
    {
      name: String,
      stars: Number,
      language: String,
      url: String,
    },
  ],

  profileUrl: String,

  contributionScore: {
    type: Number,
    default: 0,
  },

  tags: [String],

  notes: {
    type: String,
    default: "",
  },

  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],

  analyzedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  analyzedAt: {
    type: Date,
    default: Date.now,
  },

  // AI Analysis fields
  aiSummary: {
    type: String,
    default: "",
  },

  aiSkills: [
    {
      name: String,
      rating: Number,
      justification: String,
    },
  ],

  aiOverallLevel: {
    type: String,
    default: "",
  },

  aiRecommendations: [
    {
      title: String,
      description: String,
      priority: String,
    },
  ],

  aiCodeQuality: {
    overallScore: Number,
    strengths: [String],
    concerns: [String],
    metrics: {
      projectDiversity: String,
      communityEngagement: String,
      languageVersatility: String,
      projectMaintenance: String,
    },
  },

  aiAnalyzedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Profile", profileSchema);