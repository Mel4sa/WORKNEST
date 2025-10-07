import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/authMiddleware.js";
import { updateProfile, getMe, uploadPhoto, deletePhoto, updateUsername,
  updateEmail,
  updatePassword,
  deleteAccount, } from "../controllers/user.controller.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.put("/update", protectRoute, updateProfile);
router.get("/me", protectRoute, getMe);

router.post("/upload-photo", protectRoute, upload.single("photo"), uploadPhoto);
router.delete("/delete-photo", protectRoute, deletePhoto);

router.put("/change-username", protectRoute, updateUsername);
router.put("/change-email", protectRoute, updateEmail);
router.put("/change-password", protectRoute, updatePassword);
router.delete("/delete-account", protectRoute, deleteAccount);

export default router;
