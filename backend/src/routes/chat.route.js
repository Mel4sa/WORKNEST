import express from "express";
import {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getUnreadCount
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(protectRoute);

// Sohbet listesi
router.get("/", getUserChats);

// Okunmamış mesaj sayısı
router.get("/unread-count", getUnreadCount);

// Belirli kullanıcıyla sohbet başlat/getir
router.get("/user/:userId", getOrCreateChat);

// Sohbetteki mesajları getir
router.get("/:chatId/messages", getChatMessages);

// Mesaj gönder
router.post("/:chatId/messages", sendMessage);

// Mesaj düzenle
router.put("/messages/:messageId", editMessage);

// Mesaj sil
router.delete("/messages/:messageId", deleteMessage);

export default router;
