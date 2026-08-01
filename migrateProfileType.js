require("dotenv").config();
const mongoose = require("mongoose");
const Profile = require("./models/profile.js");

const dburl = "mongodb://127.0.0.1:27017/github-portfolio";

// Known company/organization GitHub accounts
const companyAccounts = [
  "nodejs", "npm", "github", "git", "facebook", "google", "microsoft",
  "apple", "amazon", "netflix", "airbnb", "uber", "twitter", "linkedin",
  "stripe", "shopify", "vercel", "netlify", "cloudflare", "docker",
  "kubernetes", "linux", "apache", "nginx", "redis", "mongodb",
  "postgresql", "mysql", "sqlite", "rust-lang", "golang", "python",
  "ruby", "java", "kotlin", "swift", "dart", "flutter", "react",
  "vuejs", "angular", "sveltejs", "nextjs", "nuxt", "gatsbyjs",
  "gridsome", "11ty", "hugo", "jekyll", "hexo", "vuepress",
  "docusaurus", "gitbook", "mkdocs", "sphinx", "readthedocs",
  "gitlab", "bitbucket", "heroku", "aws", "azure", "gcp",
  "digitalocean", "linode", "vultr", "hetzner", "ovh", "scaleway",
  "fastly", "akamai", "cdnjs", "jsdelivr", "unpkg", "esm",
  "skypack", "pika", "snowpack", "vitejs", "webpack", "rollup",
  "parcel", "esbuild", "swc", "babel", "typescript", "eslint",
  "prettier", "stylelint", "husky", "lint-staged", "commitlint",
  "semantic-release", "renovate", "dependabot", "greenkeeper", "snyk",
  "yarn", "pnpm", "bun", "deno", "apna-college",
];

async function migrate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(dburl);
  console.log("Connected!");

  // Update all profiles that don't have profileType
  const profiles = await Profile.find({
    $or: [
      { profileType: { $exists: false } },
      { profileType: null },
    ],
  });

  console.log(`Found ${profiles.length} profiles to update`);

  let individualCount = 0;
  let companyCount = 0;

  for (const profile of profiles) {
    const isCompany = companyAccounts.includes(profile.username);
    profile.profileType = isCompany ? "company" : "individual";
    await profile.save();

    if (isCompany) {
      companyCount++;
      console.log(`  🏢 ${profile.username} -> company`);
    } else {
      individualCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("MIGRATION COMPLETE!");
  console.log(`👤 Individual profiles: ${individualCount}`);
  console.log(`🏢 Company profiles: ${companyCount}`);
  console.log("=".repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
