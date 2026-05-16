
import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { extractSkillsWithGemini, extractProjectTitleWithGemini } from "../lib/gemini.js";

const router = express.Router();

router.post("/analyze-project", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Project description is required" });
    }
    const skills = await extractSkillsWithGemini(description);
    return res.status(200).json({ success: true, skills });
  } catch (error) {
    console.error("AI analyze project error:", error);
    return res.status(500).json({ success: false, message: "AI project analysis failed", error: error.message });
  }
});

// Proje başlığı üretme endpointi
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

router.post("/analyze", protectRoute, async (req, res) => {
  try {
    const { projectContext, message, projectId } = req.body;

    if (!projectContext || !projectContext.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project context is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await chatWithAI(projectContext, message);

    return res.status(200).json({
      success: true,
      result: response,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: error.message,
    });
  }
});

router.post("/match-user", protectRoute, async (req, res) => {
  try {
    const { userId, projectId } = req.body;

    if (!userId || !projectId) {
      return res.status(400).json({
        success: false,
        message: "userId and projectId are required",
      });
    }

    const user = await User.findById(userId).select("fullname username skills");
    const project = await Project.findById(projectId).select("title description");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectRequirements = await analyzeProjectWithAI(project.description);

    const match = await matchUserToProject(
      user.skills || [],
      projectRequirements,
      user.fullname || user.username,
      project.title
    );

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        userName: user.fullname || user.username,
        projectId: project._id,
        projectName: project.title,
        ...match,
      },
    });
  } catch (error) {
    console.error("Match user error:", error);

    return res.status(500).json({
      success: false,
      message: "Matching failed",
      error: error.message,
    });
  }
});

router.post("/match-candidates", protectRoute, async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required",
      });
    }

    const project = await Project.findById(projectId).select("title description");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const users = await User.find({}, "-password").select("_id fullname username skills");

    const projectRequirements = await analyzeProjectWithAI(project.description);

    const matches = await matchMultipleUsersToProject(users, projectRequirements, project.title);

    return res.status(200).json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.title,
        projectRequirements,
        candidateMatches: matches,
      },
    });
  } catch (error) {
    console.error("Match candidates error:", error);

    return res.status(500).json({
      success: false,
      message: "Matching failed",
      error: error.message,
    });
  }
});

export default router;