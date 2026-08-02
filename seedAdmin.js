if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const User = require("./models/user.js");

const dburl = process.env.MONGODB_URI || "mongodb+srv://akhileshlonkar2606_db_user:rb8vv7t74VKog4la@cluster0.sc9eijl.mongodb.net/github-portfolio?appName=Cluster0";

async function seedAdmin() {
  try {
    await mongoose.connect(dburl);
    console.log("Connected to database");

    // Find akhileshlonkar user and set role to admin
    const adminUser = await User.findOne({ username: "akhileshlonkar" });

    if (adminUser) {
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`✅ Admin role assigned to user: ${adminUser.username}`);
    } else {
      console.log("⚠️  User 'akhileshlonkar' not found. Sign up first, then run this script again.");
    }

    await mongoose.disconnect();
    console.log("Done!");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

seedAdmin();