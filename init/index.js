const mongoose = require("mongoose");
const initData = require("./data.js");
const Profile = require("../models/profile.js");

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/github-portfolio");
}

const seed = async () => {
  await Profile.deleteMany({});
  await Profile.insertMany(initData.data);
  console.log("Done - seeded " + initData.data.length + " profiles");
  process.exit(0);
};

seed();