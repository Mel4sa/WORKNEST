import express from "express";
import Skill from "../models/skill.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find({}, "name").sort({ name: 1 });
    res.json(skills.map(s => s.name));
  } catch (err) {
    res.status(500).json({ error: "Yetenekler alınamadı." });
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Geçersiz yetenek adı." });
  }
  try {
    const skill = await Skill.findOneAndUpdate(
      { name: name.trim() },
      { name: name.trim() },
      { upsert: true, new: true }
    );
    res.status(201).json(skill.name);
  } catch (err) {
    res.status(500).json({ error: "Yetenek eklenemedi." });
  }
});

export default router;
