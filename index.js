if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

/* =========================
   IMPORTS & REQUIREMENTS
========================= */
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo").default;
const { analyzeProfile } = require("./githubconfig.js");
const { analyzeProfileWithAI } = require("./aiAnalyzer.js");
const PORT = process.env.PORT;

/* =========================
   MODELS
========================= */
const Profile = require("./models/profile.js");
const Report = require("./models/report.js");
const User = require("./models/user.js");
const dburl = process.env.MONGODB_URI || "mongodb+srv://akhileshlonkar2606_db_user:rb8vv7t74VKog4la@cluster0.sc9eijl.mongodb.net/github-portfolio?appName=Cluster0";

/* =========================
   APP INITIALIZATION
========================= */
const app = express();

/* =========================
   VIEW ENGINE & MIDDLEWARE
========================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   SESSION & FLASH
========================= */
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

app.use(
  session({
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

/* =========================
   PASSPORT CONFIGURATION
========================= */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* =========================
   GLOBAL LOCALS
========================= */
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.search = req.query.search || "";
  next();
});

/* =========================
   DATABASE CONNECTION
========================= */
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.render("landing.ejs");
});

/* =========================
   PROFILE ROUTES
========================= */

// SEARCH SUGGESTIONS API - Returns autocomplete suggestions
app.get("/api/search-suggestions", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(q, "i");
    const profiles = await Profile.find({
      $or: [
        { username: regex },
        { topLanguages: regex },
        { tags: regex },
        { "topRepos.name": regex },
        { "topRepos.language": regex },
      ],
    }).lean();

    // Collect unique suggestions
    const suggestions = new Set();

    profiles.forEach((p) => {
      // Match usernames
      if (p.username && regex.test(p.username)) {
        suggestions.add(JSON.stringify({ text: p.username, type: "user" }));
      }
      // Match languages
      if (p.topLanguages) {
        p.topLanguages.forEach((lang) => {
          if (regex.test(lang)) {
            suggestions.add(JSON.stringify({ text: lang, type: "language" }));
          }
        });
      }
      // Match tags/skills
      if (p.tags) {
        p.tags.forEach((tag) => {
          if (regex.test(tag)) {
            suggestions.add(JSON.stringify({ text: tag, type: "skill" }));
          }
        });
      }
      // Match repo names
      if (p.topRepos) {
        p.topRepos.forEach((repo) => {
          if (regex.test(repo.name)) {
            suggestions.add(JSON.stringify({ text: repo.name, type: "repo" }));
          }
        });
      }
    });

    const result = Array.from(suggestions)
      .map((s) => JSON.parse(s))
      .slice(0, 10);

    res.json({ suggestions: result });
  } catch (err) {
    next(err);
  }
});

// INDEX - Show all analyzed profiles (with comprehensive filters)
app.get("/profile", async (req, res, next) => {
  try {
    const {
      search,
      profileType,
      minScore,
      maxScore,
      minAiScore,
      maxAiScore,
      aiLevel,
      language,
      minStars,
      maxStars,
      minRepos,
      maxRepos,
      minFollowers,
      maxFollowers,
      dateRange,
      sortBy,
    } = req.query;

    const query = {};

    // Text search
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { username: searchRegex },
        { bio: searchRegex },
        { notes: searchRegex },
        { tags: searchRegex },
        { topLanguages: searchRegex },
        { "topRepos.name": searchRegex },
        { "topRepos.language": searchRegex },
      ];
    }

    // Profile type filter
    if (profileType && profileType !== "all") {
      query.profileType = profileType;
    }

    // Contribution score range
    if (minScore || maxScore) {
      query.contributionScore = {};
      if (minScore) query.contributionScore.$gte = parseInt(minScore);
      if (maxScore) query.contributionScore.$lte = parseInt(maxScore);
    }

    // AI score range
    if (minAiScore || maxAiScore) {
      query["aiCodeQuality.overallScore"] = {};
      if (minAiScore) query["aiCodeQuality.overallScore"].$gte = parseInt(minAiScore);
      if (maxAiScore) query["aiCodeQuality.overallScore"].$lte = parseInt(maxAiScore);
    }

    // AI level filter
    if (aiLevel && aiLevel !== "all") {
      query.aiOverallLevel = aiLevel;
    }

    // Language filter
    if (language) {
      query.topLanguages = language;
    }

    // Stars range
    if (minStars || maxStars) {
      query.totalStars = {};
      if (minStars) query.totalStars.$gte = parseInt(minStars);
      if (maxStars) query.totalStars.$lte = parseInt(maxStars);
    }

    // Repos range
    if (minRepos || maxRepos) {
      query.publicRepos = {};
      if (minRepos) query.publicRepos.$gte = parseInt(minRepos);
      if (maxRepos) query.publicRepos.$lte = parseInt(maxRepos);
    }

    // Followers range
    if (minFollowers || maxFollowers) {
      query.followers = {};
      if (minFollowers) query.followers.$gte = parseInt(minFollowers);
      if (maxFollowers) query.followers.$lte = parseInt(maxFollowers);
    }

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case "7days":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30days":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90days":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "1year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        query.analyzedAt = { $gte: startDate };
      }
    }

    // Sorting
    let sort = { analyzedAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case "score_high":
          sort = { contributionScore: -1 };
          break;
        case "score_low":
          sort = { contributionScore: 1 };
          break;
        case "stars_high":
          sort = { totalStars: -1 };
          break;
        case "stars_low":
          sort = { totalStars: 1 };
          break;
        case "repos_high":
          sort = { publicRepos: -1 };
          break;
        case "repos_low":
          sort = { publicRepos: 1 };
          break;
        case "followers_high":
          sort = { followers: -1 };
          break;
        case "followers_low":
          sort = { followers: 1 };
          break;
        case "ai_score_high":
          sort = { "aiCodeQuality.overallScore": -1 };
          break;
        case "ai_score_low":
          sort = { "aiCodeQuality.overallScore": 1 };
          break;
        case "name_az":
          sort = { username: 1 };
          break;
        case "name_za":
          sort = { username: -1 };
          break;
        case "recent":
          sort = { analyzedAt: -1 };
          break;
        case "oldest":
          sort = { analyzedAt: 1 };
          break;
      }
    }

    const profiles = await Profile.find(query).sort(sort);

    // Get unique languages for filter dropdown
    const languages = await Profile.distinct("topLanguages");
    
    res.render("index.ejs", {
      profiles,
      search: search || "",
      filters: {
        profileType: profileType || "all",
        minScore: minScore || "",
        maxScore: maxScore || "",
        minAiScore: minAiScore || "",
        maxAiScore: maxAiScore || "",
        aiLevel: aiLevel || "all",
        language: language || "",
        minStars: minStars || "",
        maxStars: maxStars || "",
        minRepos: minRepos || "",
        maxRepos: maxRepos || "",
        minFollowers: minFollowers || "",
        maxFollowers: maxFollowers || "",
        dateRange: dateRange || "all",
        sortBy: sortBy || "recent",
      },
      languages: languages.sort(),
    });
  } catch (err) {
    next(err);
  }
});

// SHOW - Show a single profile with reports
app.get("/profile/show/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id).populate("reports");
    if (!profile) {
      req.flash("error", "Profile not found");
      return res.redirect("/profile");
    }
    res.render("show.ejs", { profile });
  } catch (err) {
    next(err);
  }
});

// NEW - Form to enter a GitHub username
app.get("/profile/new", isLoggedIn, (req, res) => {
  res.render("new.ejs");
});

// CREATE - Analyze a GitHub username and save the profile
app.post("/profile", isLoggedIn, async (req, res) => {
  const { username, profileType } = req.body;

  try {
    // Check if already analyzed
    const existing = await Profile.findOne({ username });
    if (existing) {
      req.flash("error", "Profile already analyzed. Showing existing data.");
      return res.redirect(`/profile/show/${existing._id}`);
    }

    // Fetch and analyze from GitHub API
    const data = await analyzeProfile(username);

    const newProfile = new Profile({
      ...data,
      profileType: profileType || "individual",
      analyzedBy: req.user._id,
    });

    await newProfile.save();

    req.flash("success", `Profile for ${username} analyzed successfully!`);
    res.redirect(`/profile/show/${newProfile._id}`);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      req.flash("error", "GitHub user not found");
    } else if (err.response && err.response.status === 403) {
      req.flash("error", "GitHub API rate limit exceeded. Try again later.");
    } else {
      req.flash("error", "Failed to analyze profile: " + err.message);
    }
    res.redirect("/profile/new");
  }
});

// EDIT - Edit profile tags and notes
app.get("/profile/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const profile = await Profile.findById(id);
  if (!profile) {
    req.flash("error", "Profile not found");
    return res.redirect("/profile");
  }
  res.render("edit.ejs", { profile });
});

// UPDATE - Update profile tags and notes
app.put("/profile/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Profile.findByIdAndUpdate(id, {
    tags: req.body.profile.tags || [],
    notes: req.body.profile.notes || "",
  });
  req.flash("success", "Profile updated");
  res.redirect(`/profile/show/${id}`);
});

// DELETE - Remove an analyzed profile
app.get("/profile/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Profile.findByIdAndDelete(id);
  await Report.deleteMany({ _id: { $in: req.body.reportIds || [] } });
  req.flash("success", "Profile deleted");
  res.redirect("/profile");
});

// AI ANALYZE API - AJAX endpoint for instant prediction
app.post("/api/ai-analyze/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const profile = await Profile.findById(id);

  if (!profile) {
    return res.json({ success: false, error: "Profile not found" });
  }

  try {
    const aiResults = await analyzeProfileWithAI(profile);
    await Profile.findByIdAndUpdate(id, { ...aiResults });
    res.json({
      success: true,
      aiScore: aiResults.aiCodeQuality?.overallScore || 0,
      aiLevel: aiResults.aiOverallLevel || "unknown",
    });
  } catch (err) {
    console.error("AI Analysis error:", err);
    res.json({ success: false, error: err.message });
  }
});

// AI ANALYZE - Run AI analysis on a profile
app.post("/profile/:id/ai-analyze", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const profile = await Profile.findById(id);

  if (!profile) {
    req.flash("error", "Profile not found");
    return res.redirect("/profile");
  }

  try {
    const aiResults = await analyzeProfileWithAI(profile);
    await Profile.findByIdAndUpdate(id, { ...aiResults });
    req.flash("success", "AI analysis completed successfully!");
  } catch (err) {
    console.error("AI Analysis error:", err);
    req.flash("error", "AI analysis failed: " + err.message);
  }

  res.redirect(`/profile/show/${id}`);
});

// REFRESH - Re-analyze a profile from GitHub
app.get("/profile/refresh/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const profile = await Profile.findById(id);

  if (!profile) {
    req.flash("error", "Profile not found");
    return res.redirect("/profile");
  }

  try {
    const data = await analyzeProfile(profile.username);
    await Profile.findByIdAndUpdate(id, { ...data, analyzedAt: new Date() });
    req.flash("success", "Profile refreshed with latest data");
  } catch (err) {
    req.flash("error", "Failed to refresh: " + err.message);
  }

  res.redirect(`/profile/show/${id}`);
});

/* =========================
   REPORT ROUTES
========================= */
app.post("/profile/:id/reports", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const profile = await Profile.findById(id);

  if (!profile) {
    req.flash("error", "Profile not found");
    return res.redirect("/profile");
  }

  const newReport = new Report(req.body.report);
  profile.reports.push(newReport);

  await newReport.save();
  await profile.save();

  req.flash("success", "Report added");
  res.redirect(`/profile/show/${id}`);
});

/* =========================
   AUTHENTICATION ROUTES
========================= */

// SIGNUP FORM
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

// SIGNUP LOGIC
app.post("/signup", async (req, res, next) => {
  const { username, email, password } = req.body;

  const newUser = new User({ email, username });
  const registeredUser = await User.register(newUser, password);

  req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash("success", "Welcome! You are now logged in.");
    res.redirect("/profile");
  });
});

// LOGIN FORM
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// LOGIN LOGIC
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Logged in successfully!");
    res.redirect("/profile");
  }
);

// LOGOUT
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out");
    res.redirect("/profile");
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).send("Page not found");
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  res.status(500).send("Something went wrong: " + err.message);
});

/* =========================
   SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
