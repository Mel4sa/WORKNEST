import express from "express";
import {
  getAllProjects,
  getUserProjects,
  getOwnedProjects,
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

router.get("/", getAllProjects); 
router.post("/cleanup", cleanupDeletedProjects); 

router.use(protectRoute); 

router.get("/my-projects", getUserProjects);
router.get("/owned-projects", getOwnedProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/join", joinProject);
router.post("/:id/leave", leaveProject);
router.delete("/:id/members/:userId", removeMember);

export default router;
