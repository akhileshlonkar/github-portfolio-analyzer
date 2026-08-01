# GitHub Developer Portfolio Analyzer

A full-stack web application that analyzes GitHub developer profiles. Enter any GitHub username to fetch and analyze their portfolio including repos, languages, stars, forks, and contribution scores.

---

## Features
- User authentication (Sign up / Login)
- Analyze any GitHub developer profile
- View detailed stats: repos, stars, forks, followers, languages
- Contribution score (0-100)
- Top repositories by stars
- Add personal tags and notes to profiles
- Write analysis reports with strengths/weaknesses
- Refresh profiles to get latest data from GitHub API
- Responsive dashboard UI

---

## Tech Stack

### Frontend
- HTML / CSS
- Bootstrap 5
- Font Awesome
- EJS (Embedded JavaScript Templates)

### Backend
- Node.js
- Express.js
- Passport.js (authentication)

### Database
- MongoDB Atlas (Cloud Database)
- Mongoose ODM

### External APIs
- GitHub REST API (via Axios)

### Tools & Platforms
- Git & GitHub
- Render (Deployment)

---

## Project Structure

```
github-portfolio-analyzer/
├── index.js              # Main Express server
├── githubconfig.js       # GitHub API configuration
├── models/
│   ├── profile.js        # Profile schema (analyzed GitHub users)
│   ├── report.js         # Report schema (analysis reports)
│   └── user.js           # User schema (app authentication)
├── views/                # EJS templates
│   ├── boilerplate.ejs   # Master layout
│   ├── navbar.ejs        # Navigation partial
│   ├── footer.ejs        # Footer partial
│   ├── index.ejs         # Dashboard (all profiles)
│   ├── show.ejs          # Profile detail + reports
│   ├── new.ejs           # Analyze new profile form
│   ├── edit.ejs          # Edit tags & notes
│   ├── login.ejs         # Login form
│   └── signup.ejs        # Signup form
├── init/
│   ├── data.js           # Sample profile data
│   ├── index.js          # Seed script for profiles
│   └── seedReports.js    # Seed script for reports
├── public/style.css      # Custom styles
├── .env                  # Environment variables
└── package.json
```

---

## Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/github-portfolio-analyzer.git
cd github-portfolio-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file:
```
GITHUB_TOKEN=your_github_personal_access_token
ATLAS_URL=mongodb+srv://user:pass@cluster.mongodb.net/?appName=GithubPortfolio
SECRET=your_session_secret
PORT=3000
```

4. Seed the database (optional)
```bash
node init/index.js
node init/seedReports.js
```

5. Start the server
```bash
npm start
```

6. Open in browser
```
http://localhost:3000
```

---

## GitHub Token

To avoid API rate limits, create a Personal Access Token:
1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Generate a new token (no scopes needed for public repos)
3. Add it to your `.env` file as `GITHUB_TOKEN`

---

## Deployment

Deployed on Render. Set environment variables in the Render dashboard.

---

## Future Enhancements
- Contribution graph visualization
- Language usage pie charts
- Compare multiple developers side-by-side
- Export reports as PDF
- Organization/team analysis
- Automated weekly profile refresh# github-portfolio-analyzer
