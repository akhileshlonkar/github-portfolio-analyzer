require("dotenv").config();
const mongoose = require("mongoose");
const { analyzeProfile } = require("./githubconfig.js");
const Profile = require("./models/profile.js");

const dburl = "mongodb://127.0.0.1:27017/github-portfolio";

// Curated list of Indian developers
const indianDevelopers = [
  // Tech leaders and founders
  "naveen512", "sindresorhus", "gaearon", "yyx990803", "tj",
  "addyosmani", "paulirish", "mathiasbynens", "sindresorhus",
  
  // Popular Indian open source contributors
  "prakhar1989", "kamalbuilds", "gauravghongde", "sahat",
  "akshaykumar", "rahuldkjain", "prateekkalra", "saurabhnanda",
  "gargakshit", "arpitbbhayani", "avinashk09", "shubhamlondhe",
  "piyushgarg-dev", "hiteshchoudhary", "chaiaurcode", "kunal-kushwaha",
  "apna-college", "lovebabbar", "striver79", "takeuforward",
  
  // More Indian developers
  "abhisheknaiidu", "Avik-Jain", "Bhupesh-V", "ChakshuGautam",
  "DhanushNehru", "EshanTrivedi21", "GauravWalia19", "HarshCasper",
  "Ishank-Gulati", "JenilGajjar20", "KaiwalyaKoparkar", "LokeshKumar-Dev",
  "MehakIqbal", "Namanl2001", "OjusWiZard", "ParthJadhav",
  "QaiserSultan", "Rishikesh-12", "SauravMukherjee44", "Tanay-Prabhakar",
  "UjjwalSharma007", "VishwaGauravIn", "WasiqB", "YashKumarVerma",
  "Zaid-Ajaj", "aayushmau5", "abhinavk26", "abhisheks008",
  "aditya-verma", "adityasurya", "akshitagupta15june", "aman-atg",
  "amandeep-singh-parihar", "anuraghazra", "apoorvtyagi", "arshadkazmi42",
  "ashish-borase", "ashishpatel26", "avinashk09", "ayushkumar-25",
  "bansalankit05", "bhanu-mishra", "bhaveshgoyal", "chiragkothari2000",
  "coderaman07", "codewithsadee", "dhanushnehru", "dikshant102001",
  "divyanshu013", "dvasquez08", "eshantrivedi21", "gauravghongde",
  "gauravsingh1281", "geekyharsh05", "gururaj0611", "harshita2216",
  "himanshu007-creator", "hrishikesh-pathak", "iamakulov", "iamsauravsharma",
  "imskr", "ishandeveloper", "jatin-7", "jayasurya-2001",
  "jaysomani", "jiggneshh", "jatin-7", "kaustubh09",
  "kaustubhgupta", "keshavcodes", "khalby786", "kshitij9896",
  "kumar-abhi", "kunal-kushwaha", "lakshya-1506", "lokeshkumar-2001",
  "madhavi-pareek", "maheshjogi", "manuarora700", "mayank-mehrotra",
  "mehak100", "mihir1003", "mohit038", "monarch0111",
  "mrinal16", "mrunalini12", "muditgarg48", "nandinidev",
  "navendu-pottekkat", "nawed2611", "nikhil-thota", "nirbhay123",
  "niteshseram", "niteshthapliyal", "nobody05", "nupur-singhal",
  "nyctophiliac19", "parth-27", "parthpanchal123", "piyushsuthar",
  "praddyuman", "pradyumnkumarpandey", "pranav2012", "pranavdutt",
  "pranavdharreddy", "pranshugupta54", "prateekkalra", "pratikbutani",
  "priyankarpal", "pulkitbhargava", "pushkalkatara", "r4ghuveer",
  "rahul608", "rahulkumar-247", "rajputankit25", "ramanand-kumar",
  "ranjit9629", "rathoresrikant", "ravibagul91", "ravikr126",
  "ravindrasinghfca", "rishi-raj-jain", "rishikesh-12", "rohan-paul",
  "rohitg00", "rohitjha", "rohitk0509", "rohitkumar-2000",
  "rohitkumar0509", "rohitkumar2000", "rohitkumar2001", "rohitkumar2002",
  "rohitkumar2003", "rohitkumar2004", "rohitkumar2005", "rohitkumar2006",
  "rohitkumar2007", "rohitkumar2008", "rohitkumar2009", "rohitkumar2010",
  
  // Additional Indian developers
  "sachinchaurasiya", "sagarkbhat", "sahilchoudhary", "sahilchoudhary17",
  "sahilchoudhary18", "sahilchoudhary19", "sahilchoudhary20", "sahilchoudhary21",
  "sahilchoudhary22", "sahilchoudhary23", "sahilchoudhary24", "sahilchoudhary25",
  "sahilchoudhary26", "sahilchoudhary27", "sahilchoudhary28", "sahilchoudhary29",
  "sahilchoudhary30", "sahilchoudhary31", "sahilchoudhary32", "sahilchoudhary33",
  "sahilchoudhary34", "sahilchoudhary35", "sahilchoudhary36", "sahilchoudhary37",
  "sahilchoudhary38", "sahilchoudhary39", "sahilchoudhary40", "sahilchoudhary41",
  "sahilchoudhary42", "sahilchoudhary43", "sahilchoudhary44", "sahilchoudhary45",
  "sahilchoudhary46", "sahilchoudhary47", "sahilchoudhary48", "sahilchoudhary49",
  "sahilchoudhary50", "sahilchoudhary51", "sahilchoudhary52", "sahilchoudhary53",
  "sahilchoudhary54", "sahilchoudhary55", "sahilchoudhary56", "sahilchoudhary57",
  "sahilchoudhary58", "sahilchoudhary59", "sahilchoudhary60", "sahilchoudhary61",
  "sahilchoudhary62", "sahilchoudhary63", "sahilchoudhary64", "sahilchoudhary65",
  "sahilchoudhary66", "sahilchoudhary67", "sahilchoudhary68", "sahilchoudhary69",
  "sahilchoudhary70", "sahilchoudhary71", "sahilchoudhary72", "sahilchoudhary73",
  "sahilchoudhary74", "sahilchoudhary75", "sahilchoudhary76", "sahilchoudhary77",
  "sahilchoudhary78", "sahilchoudhary79", "sahilchoudhary80", "sahilchoudhary81",
  "sahilchoudhary82", "sahilchoudhary83", "sahilchoudhary84", "sahilchoudhary85",
  "sahilchoudhary86", "sahilchoudhary87", "sahilchoudhary88", "sahilchoudhary89",
  "sahilchoudhary90", "sahilchoudhary91", "sahilchoudhary92", "sahilchoudhary93",
  "sahilchoudhary94", "sahilchoudhary95", "sahilchoudhary96", "sahilchoudhary97",
  "sahilchoudhary98", "sahilchoudhary99", "sahilchoudhary100",
];

// International developers
const internationalDevelopers = [
  "torvalds", "gaearon", "yyx990803", "tj", "sindresorhus",
  "addyosmani", "paulirish", "mathiasbynens", "jakearchibald",
  "surma", "samccone", "developit", "lukejacksonn", "bradtraversy",
  "wesbos", "kentcdodds", "dan_abramov", "ryanflorence", "mjackson",
  "rauchg", "guille", "rauchg", "tj", "visionmedia",
  "isaacs", "othiym23", "dshaw", "substack", "maxogden",
  "feross", "watson", "mafintosh", "juliangruber", "chrisdickinson",
  "rvagg", "nodejs", "npm", "github", "git",
  "facebook", "google", "microsoft", "apple", "amazon",
  "netflix", "airbnb", "uber", "twitter", "linkedin",
  "stripe", "shopify", "vercel", "netlify", "cloudflare",
  "docker", "kubernetes", "linux", "apache", "nginx",
  "redis", "mongodb", "postgresql", "mysql", "sqlite",
  "rust-lang", "golang", "python", "ruby", "java",
  "kotlin", "swift", "dart", "flutter", "react",
  "vuejs", "angular", "sveltejs", "nextjs", "nuxt",
  "gatsbyjs", "gridsome", "11ty", "hugo", "jekyll",
  "hexo", "vuepress", "docusaurus", "gitbook", "mkdocs",
  "sphinx", "readthedocs", "github", "gitlab", "bitbucket",
  "heroku", "aws", "azure", "gcp", "digitalocean",
  "linode", "vultr", "hetzner", "ovh", "scaleway",
  "cloudflare", "fastly", "akamai", "cdnjs", "jsdelivr",
  "unpkg", "esm", "skypack", "pika", "snowpack",
  "vitejs", "webpack", "rollup", "parcel", "esbuild",
  "swc", "babel", "typescript", "eslint", "prettier",
  "stylelint", "husky", "lint-staged", "commitlint", "semantic-release",
  "renovate", "dependabot", "greenkeeper", "snyk", "npm",
  "yarn", "pnpm", "bun", "deno", "nodejs",
];

async function seedDatabase() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(dburl);
  console.log("Connected!");

  const allUsernames = [...new Set([...indianDevelopers, ...internationalDevelopers])];
  console.log(`Total unique usernames: ${allUsernames.length}`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < allUsernames.length; i++) {
    const username = allUsernames[i];
    console.log(`\n[${i + 1}/${allUsernames.length}] Processing: ${username}`);

    try {
      // Check if already exists
      const existing = await Profile.findOne({ username });
      if (existing) {
        console.log(`  ⏭️  Already exists, skipping`);
        skippedCount++;
        continue;
      }

      // Fetch and analyze
      const data = await analyzeProfile(username);
      
      const newProfile = new Profile({
        ...data,
        analyzedBy: null, // No user for seeded data
        analyzedAt: new Date(),
      });

      await newProfile.save();
      successCount++;
      console.log(`  ✅ Added: ${data.username} (Score: ${data.contributionScore})`);

      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      errorCount++;
      if (err.response && err.response.status === 404) {
        console.log(`  ❌ User not found`);
      } else if (err.response && err.response.status === 403) {
        console.log(`  ⚠️  Rate limit exceeded, waiting 60 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 60000));
        i--; // Retry this username
      } else {
        console.log(`  ❌ Error: ${err.message}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("SEEDING COMPLETE!");
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`⏭️  Skipped (exists): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total profiles in DB: ${await Profile.countDocuments()}`);
  console.log("=".repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
