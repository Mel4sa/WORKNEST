import express from "express";
import {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getUnreadCount,
  deleteChat
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../lib/multer.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getUserChats);
router.get("/unread-count", getUnreadCount);
router.get("/user/:userId", getOrCreateChat);
router.get("/:chatId/messages", getChatMessages);

router.post("/:chatId/messages", upload.single('file'), sendMessage);

router.put("/messages/:messageId", editMessage);

router.delete("/messages/:messageId", deleteMessage);
router.delete("/:chatId", deleteChat);

export default router;
