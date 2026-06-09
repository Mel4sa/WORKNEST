import fetch from "node-fetch";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postToGemini(url, body, { retries = 2, baseDelayMs = 800 } = {}) {
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      const status = data?.error?.status;
      const isUnavailable = response.status === 503 || status === "UNAVAILABLE";

      if (isUnavailable && attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(`Gemini unavailable (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms.`, {
          status,
        });
        await sleep(delay);
        continue;
      }

      return data;
    } catch (err) {
      lastErr = err;

      if (attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(
          `Gemini request failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms`,
          err?.message
        );
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastErr;
}

export async function extractSkillsWithGemini(description) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const prompt = `Aşağıdaki proje açıklamasından anahtar becerileri çıkar ve SADECE bir JSON array olarak döndür (ör: ["React", "Node.js", "MongoDB"]). Açıklama ekleme, sadece array döndür:\n---\n${description}\n---\n\nKURALLAR:\n- Çıktı SADECE JSON array olmalı (ör: ["React", "Node.js"]).\n- Açıklamada geçen teknoloji/alanlar için "genel" (alanın master/headline karşılığı) ile birlikte "spesifik" alt başlıkları da mümkün olduğunca ekle.\n- Genel başlığı kaçırma: Eğer spesifik bir alt alan yakalanıyorsa, onun genel karşılığını da eklemeye çalış.\n- Mobil örneği: Android/iOS/React Native/Flutter/Kotlin/Swift geçiyorsa mutlaka "Mobile App Development" (veya "Mobil Uygulama Geliştirme") de ekle.\n`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const data = await postToGemini(url, body, { retries: 2, baseDelayMs: 900 });
  console.log("Gemini response:", JSON.stringify(data, null, 2));

  const safeParseSkillsArray = (raw) => {
    if (!raw || typeof raw !== "string") return [];

    const text = raw.trim();

    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidateText = fencedMatch?.[1] ? fencedMatch[1].trim() : text;

    const bracketMatch = candidateText.match(/\[[\s\S]*\]/);
    const jsonCandidate = bracketMatch?.[0] ? bracketMatch[0] : candidateText;

    try {
      const parsed = JSON.parse(jsonCandidate);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const skillsText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const skills = safeParseSkillsArray(skillsText);

  return skills.filter((s) => typeof s === "string").map((s) => s.trim()).filter(Boolean);

}

export async function extractProjectTitleWithGemini(description) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Aşağıdaki proje açıklamasına uygun, kısa ve etkili bir proje başlığı üret. SADECE başlığı düz metin olarak döndür, açıklama veya başka bir şey ekleme.\n---\n${description}\n---`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const data = await postToGemini(url, body, { retries: 2, baseDelayMs: 900 });
  console.log("Gemini title response:", JSON.stringify(data, null, 2));

  try {
    const title = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return title || "Yeni Proje";
  } catch {
    return "Yeni Proje";
  }
}

// Analyze project description and return a normalized list of required skills
export async function analyzeProjectWithAI(description) {
  try {
    const skills = await extractSkillsWithGemini(description || "");
  // Normalize skills to lowercase trimmed unique
  const normalized = Array.from(new Set((skills || []).map(s => String(s).trim().toLowerCase()))).filter(Boolean);
    return normalized;
  } catch (err) {
    console.error('analyzeProjectWithAI error:', err?.message || err);
    return [];
  }
}

// Match a single user's skills to project requirements
export async function matchUserToProject(userSkills = [], projectRequirements = [], userName = '', projectTitle = '') {
  // Helpers for normalization and fuzzy matching
  const normalize = (t = "") => String(t || "").toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // simple synonym map (extendable)
  const synonyms = new Map([
    ['web development', 'yazilim gelistirme'],
    ['full stack development', 'yazilim gelistirme'],
    ['fullstack', 'yazilim gelistirme'],
    ['frontend', 'ui ux tasarimi'],
    ['ui/ux', 'ui ux tasarimi'],
    ['ui ux', 'ui ux tasarimi'],
    ['mobile', 'mobile app development'],
    ['mobile app development', 'mobile app development'],
    ['node', 'node.js'],
    ['reactjs', 'react'],
    ['react native', 'react native']
  ]);

  const levenshtein = (a = '', b = '') => {
    const A = String(a).split('');
    const B = String(b).split('');
    const m = A.length, n = B.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = A[i - 1] === B[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  };

  const similarity = (a = '', b = '') => {
    const na = normalize(a);
    const nb = normalize(b);
    if (!na && !nb) return 0;
    if (na === nb) return 1;
    const dist = levenshtein(na, nb);
    const maxLen = Math.max(na.length, nb.length);
    if (maxLen === 0) return 0;
    return 1 - dist / maxLen;
  };

  const isSynonymMatch = (a, b) => {
    const na = normalize(a);
    const nb = normalize(b);
    if (synonyms.get(na) === nb) return true;
    if (synonyms.get(nb) === na) return true;
    return false;
  };

  const isMatch = (req, user) => {
    const nr = normalize(req);
    const nu = normalize(user);
    if (!nr || !nu) return false;
    if (nr === nu) return true;
    if (nr.includes(nu) || nu.includes(nr)) return true;
    if (isSynonymMatch(nr, nu)) return true;
    if (similarity(nr, nu) >= 0.75) return true; // fuzzy threshold
    // token overlap
    const rTokens = new Set(nr.split(' '));
    const uTokens = new Set(nu.split(' '));
    const common = [...rTokens].filter(t => uTokens.has(t));
    if (common.length > 0) return true;
    return false;
  };

  const reqList = (projectRequirements || []).map(r => String(r || ''));
  const userList = (userSkills || []).map(u => String(u || ''));

  const matched = [];
  for (const r of reqList) {
    for (const u of userList) {
      if (isMatch(r, u)) {
        matched.push(r);
        break;
      }
    }
  }

  const uniqueReq = Array.from(new Set(reqList));
  const score = uniqueReq.length > 0 ? matched.length / uniqueReq.length : 0;

  return {
    matchedSkills: matched,
    requiredSkills: uniqueReq,
    userSkills: userList,
    score,
    matchPercent: Math.round(score * 100)
  };
}

// Match multiple users and return sorted matches (best first)
export async function matchMultipleUsersToProject(users = [], projectRequirements = [], projectTitle = '') {
  const reqSet = new Set((projectRequirements || []).map(s => String(s).trim()));

  const results = await Promise.all((users || []).map(async (user) => {
    // reuse single-user matcher logic by calling matchUserToProject
    const match = await matchUserToProject(user.skills || [], [...reqSet], user.fullname || user.username || '', projectTitle);
    return {
      userId: user._id,
      userName: user.fullname || user.username || '',
      ...match
    };
  }));

  // sort desc by score then by number of matched skills
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.matchedSkills.length || 0) - (a.matchedSkills.length || 0);
  });

  return results;
}

