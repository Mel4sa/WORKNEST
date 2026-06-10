
import express from "express";
import {
  extractSkillsFromDbWithGemini,
  extractProjectTitleWithGemini,
} from "../lib/gemini.js";

const router = express.Router();

router.post("/analyze-project", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Project description is required" });
    }
  const skills = await extractSkillsFromDbWithGemini(description);
    return res.status(200).json({ success: true, skills });
  } catch (error) {
    console.error("AI analyze project error:", error);
    return res.status(500).json({ success: false, message: "AI project analysis failed", error: error.message });
  }
});

router.post("/generate-title", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Project description is required" });
    }
    const title = await extractProjectTitleWithGemini(description);
    return res.status(200).json({ success: true, title });
  } catch (error) {
    console.error("AI generate title error:", error);
    return res.status(500).json({ success: false, message: "AI project title generation failed", error: error.message });
  }
});

export default router;