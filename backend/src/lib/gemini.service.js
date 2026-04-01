import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeProjectWithAI(description) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Sen bir proje analiz asistanısın.

Aşağıdaki proje açıklamasını analiz et.
Sadece verilen açıklamaya göre karar ver.
Yeni rol veya teknoloji uydurma.
Çıktıyı sadece istenen JSON yapısında üret.

Sadece şu alanları döndür:
- roles
- technologies

Proje açıklaması:
${description}
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["roles", "technologies"],
      },
    },
  });

  return JSON.parse(response.text);
}

// ChatBot conversation için AI'ya soru sor
export async function chatWithAI(projectContext, userMessage) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Sen bir proje danışmanı asistanısın. Kullanıcıya proje geliştirme, ekip kuruluşu, teknoloji seçimi, pazarlama stratejisi gibi konularda danışmanlık veriyorsun.

Kullanıcının projesi hakkında:
${projectContext}

Kullanıcının sorusu veya yorumu:
"${userMessage}"

Lütfen kullanıcının sorusuna yapıcı, faydalı ve özgün bir yanıt ver. Cevapların Türkçe olsun ve pratik öneriler içersin.
`,
    });

    return response.text;
  } catch (error) {
    console.error("Chat with AI error:", error);
    throw error;
  }
}

// Proje-Kişi Eşleştirme: Kullanıcı yetkinliklerini ve proje gereksinimlerini karşılaştır
export async function matchUserToProject(userSkills, projectRequirements, userName, projectName) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Sen bir proje-kişi eşleştirme uzmanısın.

Aşağıdaki kullanıcının yetkinliklerini ve projenin gereksinimlerini analiz ederek:
1. Eşleşme yüzdesini (0-100) hesapla
2. Güçlü yönlerini listele
3. Geliştirmesi gereken alanları listele
4. Kısa bir tavsiye yap

Kullanıcı: ${userName}
Yetkinlikleri: ${Array.isArray(userSkills) ? userSkills.join(", ") : userSkills}

Proje: ${projectName}
Gerekli Roller: ${projectRequirements.roles ? projectRequirements.roles.join(", ") : ""}
Gerekli Teknolojiler: ${projectRequirements.technologies ? projectRequirements.technologies.join(", ") : ""}

Sonucunu aşağıdaki JSON formatında döndür:
{
  "matchPercentage": (0-100 arası sayı),
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "areasToImprove": ["geliştirilecek alan 1", "geliştirilecek alan 2"],
  "recommendation": "kısa tavsiye metni"
}
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchPercentage: {
              type: Type.NUMBER,
              description: "0-100 arası eşleşme yüzdesi",
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Kullanıcının güçlü yönleri",
            },
            areasToImprove: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Geliştirmesi gereken alanlar",
            },
            recommendation: {
              type: Type.STRING,
              description: "Tavsiye metni",
            },
          },
          required: ["matchPercentage", "strengths", "areasToImprove", "recommendation"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Match user to project error:", error);
    throw error;
  }
}

// Birden fazla kullanıcı-proje eşleştirmesi yap
export async function matchMultipleUsersToProject(users, projectRequirements, projectName) {
  try {
    const matches = await Promise.all(
      users.map((user) =>
        matchUserToProject(
          user.skills || [],
          projectRequirements,
          user.fullname || user.username || "Bilinmeyen",
          projectName
        ).then((match) => ({
          userId: user._id,
          userName: user.fullname || user.username,
          ...match,
        }))
      )
    );

    // Eşleşme yüzdesine göre sırala (en yüksekten en düşüğe)
    return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  } catch (error) {
    console.error("Match multiple users error:", error);
    throw error;
  }
}