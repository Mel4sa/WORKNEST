import express from "express";
import { updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/update", protectRoute, updateProfile);


export default router;
