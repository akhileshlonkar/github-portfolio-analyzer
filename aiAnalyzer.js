const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";

// Helper: call Groq with a prompt and return parsed JSON
async function callGroq(systemPrompt, userPrompt, maxTokens = 512) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: maxTokens,
  });

  const content = response.choices[0]?.message?.content || "";
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  return JSON.parse(jsonMatch[1].trim());
}

// 1. Generate a natural language profile summary
async function generateProfileSummary(profile) {
  const systemPrompt = `You are a developer portfolio analyst. Write a brief positive summary (2-3 sentences). No markdown. Return JSON only.`;

  const userPrompt = `Profile: ${profile.username}, Repos: ${profile.publicRepos}, Stars: ${profile.totalStars}, Followers: ${profile.followers}, Languages: ${profile.topLanguages.join(", ") || "None"}, Score: ${profile.contributionScore}/100

Return JSON: { "summary": "string" }`;

  return callGroq(systemPrompt, userPrompt, 256);
}

// 2. Assess technical skills
async function assessSkills(profile) {
  const systemPrompt = `You are a technical mentor. Rate skills 1-10 generously. Return JSON only.`;

  const userPrompt = `Profile: ${profile.username}, Repos: ${profile.publicRepos}, Stars: ${profile.totalStars}, Languages: ${profile.topLanguages.join(", ") || "None"}, Followers: ${profile.followers}

Return JSON: { "skills": [{"name":"string","rating":1-10,"justification":"short string"}], "overallLevel": "beginner|intermediate|advanced|expert" }`;

  return callGroq(systemPrompt, userPrompt, 384);
}

// 3. Generate improvement recommendations
async function generateRecommendations(profile) {
  const systemPrompt = `You are a developer mentor. Give 3 brief positive recommendations. Return JSON only.`;

  const userPrompt = `Profile: ${profile.username}, Repos: ${profile.publicRepos}, Stars: ${profile.totalStars}, Score: ${profile.contributionScore}/100, Languages: ${profile.topLanguages.join(", ") || "None"}

Return JSON: { "recommendations": [{"title":"string","description":"short string","priority":"low|medium|high"}] }`;

  return callGroq(systemPrompt, userPrompt, 384);
}

// 4. Analyze code quality patterns
async function analyzeCodeQuality(profile) {
  const systemPrompt = `You are a code quality analyst. Be generous with scores (6-8 for active devs). Return JSON only.`;

  const userPrompt = `Profile: ${profile.username}, Repos: ${profile.publicRepos}, Stars: ${profile.totalStars}, Forks: ${profile.totalForks}, Languages: ${profile.topLanguages.join(", ") || "None"}, Followers: ${profile.followers}

Return JSON: {"overallScore":1-10,"strengths":["short string"],"concerns":["short string"],"metrics":{"projectDiversity":"rating","communityEngagement":"rating","languageVersatility":"rating","projectMaintenance":"rating"}}`;

  return callGroq(systemPrompt, userPrompt, 384);
}

// Run all AI analyses for a profile
async function analyzeProfileWithAI(profile) {
  const [summary, skills, recommendations, codeQuality] = await Promise.all([
    generateProfileSummary(profile).catch(err => {
      console.error("AI Summary error:", err.message);
      return { summary: "AI analysis unavailable." };
    }),
    assessSkills(profile).catch(err => {
      console.error("AI Skills error:", err.message);
      return { skills: [], overallLevel: "unknown" };
    }),
    generateRecommendations(profile).catch(err => {
      console.error("AI Recommendations error:", err.message);
      return { recommendations: [] };
    }),
    analyzeCodeQuality(profile).catch(err => {
      console.error("AI Code Quality error:", err.message);
      return { overallScore: 0, strengths: [], concerns: [], metrics: {} };
    }),
  ]);

  return {
    aiSummary: summary.summary,
    aiSkills: skills.skills || [],
    aiOverallLevel: skills.overallLevel || "unknown",
    aiRecommendations: recommendations.recommendations || [],
    aiCodeQuality: codeQuality,
    aiAnalyzedAt: new Date(),
  };
}

module.exports = { analyzeProfileWithAI };