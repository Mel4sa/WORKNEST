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




// Alınan davetler
router.get("/received", protectRoute, getReceivedInvites);

// Gönderilen davetler
router.get("/sent", protectRoute, getSentInvites);


// Daveti kabul et/ reddet
router.patch("/respond/:inviteId", protectRoute, respondInvite);

// Davet gönder
router.post("/send", protectRoute, sendInvite);

// Daveti geri çek
router.post("/revoke", protectRoute, revokeInvite);

export default router;
