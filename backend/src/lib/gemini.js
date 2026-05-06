import fetch from "node-fetch";

export async function extractSkillsWithGemini(description) {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Aşağıdaki proje açıklamasından anahtar becerileri çıkar ve SADECE bir JSON array olarak döndür (ör: [\"React\", \"Node.js\", \"MongoDB\"]). Açıklama ekleme, sadece array döndür:\n---\n${description}\n---`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  console.log("Gemini response:", JSON.stringify(data, null, 2));
  try {
    const skills = JSON.parse(data.candidates[0].content.parts[0].text);
    return skills;
  } catch (e) {
    return [];
  }
}
