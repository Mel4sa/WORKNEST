import express from "express";
import { register, login, logout, forgotPassword, resetPassword, resendResetLink } from "../controllers/auth.controller.js";
import { testEmailConfig } from "../lib/emailService.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-reset-link", resendResetLink);

// Test endpoint
router.get("/test-email", async (req, res) => {
  try {
    const result = await testEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
