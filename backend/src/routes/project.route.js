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
router.get("/", getAllProjects); // Tüm public projeler
router.post("/cleanup", cleanupDeletedProjects); // Database temizle (geçici public)

// Protected routes - authentication gerekli
router.use(protectRoute); // Aşağıdaki tüm route'lar için auth gerekli

router.get("/my-projects", getUserProjects); // Kullanıcının projeleri
router.get("/:id", getProjectById); // Tek proje detayı
router.post("/", createProject); // Yeni proje oluştur
router.put("/:id", updateProject); // Proje güncelle (owner only)
router.delete("/:id", deleteProject); // Proje sil (owner only)
router.post("/:id/join", joinProject); // Projeye katıl
router.post("/:id/leave", leaveProject); // Projeden ayrıl
router.delete("/:id/members/:userId", removeMember); // Üye çıkar (owner only)

export default router;
