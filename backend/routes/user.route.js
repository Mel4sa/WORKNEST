import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { updateProfile, getMe } from "../controllers/user.controller.js";

const router = express.Router();

router.put("/update", protectRoute, updateProfile);
router.get("/me", protectRoute, getMe);

export default router;
