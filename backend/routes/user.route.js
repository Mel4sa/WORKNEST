import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/authMiddleware.js";
import { updateProfile, getMe, uploadPhoto, deletePhoto } from "../controllers/user.controller.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.put("/update", protectRoute, updateProfile);
router.get("/me", protectRoute, getMe);

router.post("/upload-photo", protectRoute, upload.single("photo"), uploadPhoto);
router.delete("/delete-photo", protectRoute, deletePhoto);

export default router;
