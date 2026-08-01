const mongoose = require("mongoose");
const Profile = require("../models/profile.js");
const indianData = require("./indianData.js");

const seedIndianProfiles = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/github-portfolio");
    console.log("Connected to MongoDB");

    // Clear existing profiles
    await Profile.deleteMany({});
    console.log("Cleared existing profiles");

    // Insert Indian developer profiles
    const result = await Profile.insertMany(indianData.data);
    console.log(`Successfully seeded ${result.length} Indian developer profiles`);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedIndianProfiles();