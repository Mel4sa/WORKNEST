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


router.get("/received", protectRoute, getReceivedInvites);
router.get("/sent", protectRoute, getSentInvites);

router.patch("/respond/:inviteId", protectRoute, respondInvite);

router.post("/send", protectRoute, sendInvite);
router.post("/revoke", protectRoute, revokeInvite);

export default router;
