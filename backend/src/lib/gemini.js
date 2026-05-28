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

