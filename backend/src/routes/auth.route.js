import express from "express";
import { register, login, logout, forgotPassword, resetPassword, resendResetLink } from "../controllers/auth.controller.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-reset-link", resendResetLink);

export default router;
