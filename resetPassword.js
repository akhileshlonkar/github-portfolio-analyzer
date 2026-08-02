if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const User = require("./models/user.js");

const dburl = process.env.MONGODB_URI || "mongodb+srv://akhileshlonkar2606_db_user:rb8vv7t74VKog4la@cluster0.sc9eijl.mongodb.net/github-portfolio?appName=Cluster0";

async function resetPassword() {
  try {
    await mongoose.connect(dburl);
    console.log("Connected to database");

    const user = await User.findOne({ username: "akhileshlonkar" });

    if (user) {
      await user.setPassword("Akhilesh@123");
      user.role = "admin";
      await user.save();
      console.log("Password reset successfully!");
      console.log("");
      console.log("=== YOUR LOGIN CREDENTIALS ===");
      console.log("Username: akhileshlonkar");
      console.log("Password: Akhilesh@123");
      console.log("Role: admin (full authority)");
      console.log("==============================");
    } else {
      console.log("User 'akhileshlonkar' not found. Sign up first, then run this script.");
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

resetPassword();