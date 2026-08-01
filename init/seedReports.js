const mongoose = require("mongoose");
const Profile = require("../models/profile.js");
const Report = require("../models/report.js");

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/github-portfolio");
}

const sampleReports = [
  {
    title: "Strong Open Source Contributor",
    summary: "This developer has a strong track record of impactful open source contributions with high community engagement.",
    strengths: ["High star count across repos", "Consistent commit history", "Multiple popular projects"],
    weaknesses: ["Limited recent activity in some repos"],
    score: 85,
  },
  {
    title: "Full-Stack Expertise",
    summary: "Demonstrates strong full-stack capabilities with proficiency across frontend and backend technologies.",
    strengths: ["Diverse language portfolio", "Well-documented projects", "Active community involvement"],
    weaknesses: ["Could improve test coverage"],
    score: 78,
  },
  {
    title: "Rising Developer",
    summary: "Early-career developer showing strong potential with clean code and growing contribution history.",
    strengths: ["Clean code practices", "Good documentation", "Active learning"],
    weaknesses: ["Limited project scale", "Fewer collaborators"],
    score: 55,
  },
];

const seedReports = async () => {
  const profiles = await Profile.find({});

  if (profiles.length === 0) {
    console.log("No profiles found. Run init/index.js first.");
    process.exit(0);
  }

  // Add reports to the first 3 profiles
  for (let i = 0; i < Math.min(3, profiles.length); i++) {
    const report = new Report(sampleReports[i]);
    await report.save();
    profiles[i].reports.push(report._id);
    await profiles[i].save();
    console.log(`Added report to profile: ${profiles[i].username}`);
  }

  console.log("Done seeding reports");
  process.exit(0);
};

seedReports();