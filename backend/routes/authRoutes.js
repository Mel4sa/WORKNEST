import express from "express";
import { register, login } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protectRoute, (req, res) => res.json(req.user));

/* router.get('/check', protectRoute, checkAuth); // Bu satırın doğru olduğundan emin olun
 */
export default router;
