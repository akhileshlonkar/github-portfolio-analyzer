const axios = require("axios");

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github.v3+json",
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

// Fetch basic user profile
async function fetchUser(username) {
  const { data } = await githubApi.get(`/users/${username}`);
  return data;
}

// Fetch all repos for a user (paginated)
async function fetchRepos(username) {
  let page = 1;
  let allRepos = [];

  while (true) {
    const { data } = await githubApi.get(`/users/${username}/repos`, {
      params: { per_page: 100, page, sort: "updated" },
    });
    allRepos = allRepos.concat(data);
    if (data.length < 100) break;
    page++;
  }

  return allRepos;
}

// Analyze a GitHub profile and return structured data
async function analyzeProfile(username) {
  const [user, repos] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
  ]);

  // Calculate total stars and forks
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

  // Count languages
  const langCount = {};
  repos.forEach((r) => {
    if (r.language) {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
  });

  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);

  // Top repos by stars
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      language: r.language || "Unknown",
      url: r.html_url,
    }));

  // Simple contribution score (0-100)
  const score = Math.min(
    100,
    Math.round(
      totalStars * 2 +
        user.followers * 1.5 +
        user.public_repos * 3 +
        repos.length * 1
    )
  );

  return {
    username: user.login,
    avatar: user.avatar_url,
    bio: user.bio || "",
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    totalStars,
    totalForks,
    topLanguages,
    topRepos,
    profileUrl: user.html_url,
    contributionScore: score,
  };
}

module.exports = { analyzeProfile };