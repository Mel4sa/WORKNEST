import express from "express";
import {
  getAllProjects,
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  joinProject,
  leaveProject,
  removeMember,
  cleanupDeletedProjects
} from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProjects); 
router.post("/cleanup", cleanupDeletedProjects); 

// Authentication 
router.use(protectRoute); 

router.get("/my-projects", getUserProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/join", joinProject);
router.post("/:id/leave", leaveProject);
router.delete("/:id/members/:userId", removeMember);

export default router;
