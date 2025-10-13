import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { 
  updateProfile, 
  getMe, 
  uploadPhoto, 
  deletePhoto, 
  updateUsername,
  updateEmail,
  updatePassword,
  deleteAccount,
  searchUsers,
  getUserProfile 
} from "../controllers/user.controller.js";

const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/heic',
      'image/heif'
    ];

    const fileName = file.originalname.toLowerCase();
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');
    
    if (allowedTypes.includes(file.mimetype) || isHeic) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPG, PNG, GIF, WEBP ve HEIC formatları desteklenir.'), false);
    }
  }
});

router.put("/update", protectRoute, updateProfile);
router.get("/me", protectRoute, getMe);
router.get("/search", protectRoute, searchUsers);
router.get("/profile/:userId", protectRoute, getUserProfile);

router.post("/upload-photo", protectRoute, upload.single("photo"), uploadPhoto);
router.delete("/delete-photo", protectRoute, deletePhoto);

router.put("/change-username", protectRoute, updateUsername);
router.put("/change-email", protectRoute, updateEmail);
router.put("/change-password", protectRoute, updatePassword);
router.delete("/delete-account", protectRoute, deleteAccount);

// HEIC formatlarını JPG'ye çevir
router.post("/convert-heic", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.profileImage && user.profileImage.includes('.heic')) {
      const newUrl = user.profileImage.replace('.heic', '.jpg');
      user.profileImage = newUrl;
      await user.save();
      
      res.json({ 
        success: true, 
        message: "Profil resmi formatı güncellendi",
        user: user 
      });
    } else {
      res.json({ 
        success: false, 
        message: "HEIC format bulunamadı" 
      });
    }
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: "Format dönüştürme hatası", 
      error: err.message 
    });
  }
});

export default router;
