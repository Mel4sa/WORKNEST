import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  getConversations, 
  markAsRead,
  getUnreadCount,
  markAllAsRead,
  getRecentMessageNotifications,
  deleteConversation
} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(protectRoute);

// GET /messages/conversations - Kullanıcının tüm konuşmalarını getir
router.get('/conversations', getConversations);

// GET /messages/unread-count - Okunmamış mesaj sayısını getir
router.get('/unread-count', getUnreadCount);

// GET /messages/recent-notifications - Son mesaj bildirimlerini getir
router.get('/recent-notifications', getRecentMessageNotifications);

// PUT /messages/mark-all-read - Tüm mesajları okundu olarak işaretle (partnerId route'undan önce olmalı)
router.put('/mark-all-read', markAllAsRead);

// DELETE /messages/:partnerId/delete-all - Bir kişiyle olan tüm mesajları sil
router.delete('/:partnerId/delete-all', deleteConversation);

// GET /messages/:partnerId - Belirli bir kullanıcıyla olan mesajları getir
router.get('/:partnerId', getMessages);

// POST /messages - Yeni mesaj gönder
router.post('/', sendMessage);

// PUT /messages/:partnerId/read - Mesajları okundu olarak işaretle
router.put('/:partnerId/read', markAsRead);

export default router;
