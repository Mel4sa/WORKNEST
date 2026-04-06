import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { 
  sendInvite, 
  getReceivedInvites, 
  getSentInvites, 
  respondInvite 
} from "../controllers/invitation.controller.js";
import { revokeInvite } from "../controllers/revokeInvite.controller.js";

const router = express.Router();



// Davet gönder
router.post("/send", protectRoute, sendInvite);

// Daveti geri çek
router.post("/revoke", protectRoute, revokeInvite);

export default router;
