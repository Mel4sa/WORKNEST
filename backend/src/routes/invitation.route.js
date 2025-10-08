import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { 
  sendInvite, 
  getReceivedInvites, 
  getSentInvites, 
  respondInvite 
} from "../controllers/invitation.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendInvite);
router.get("/received", protectRoute, getReceivedInvites);
router.get("/sent", protectRoute, getSentInvites);
router.patch("/respond/:inviteId", protectRoute, respondInvite);

export default router;
