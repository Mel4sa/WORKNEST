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
  cleanupDeletedProjects,
  createIlan,
  updateIlan,
  deleteIlan,
  getProjectIlans,
  addResource,
  deleteResource,
  uploadResource
} from "../controllers/project.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../lib/multer.js";

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

// Ilan management routes
router.get("/:id/ilans", getProjectIlans);
router.post("/:id/ilans", createIlan);
router.put("/:id/ilans/:ilanId", updateIlan);
router.delete("/:id/ilans/:ilanId", deleteIlan);

// Resource management routes
router.post("/:id/resources", addResource);
router.delete("/:id/resources/:resourceId", deleteResource);

export default router;
