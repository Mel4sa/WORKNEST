import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  getConversations, 
  markAsRead 
} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(protectRoute);

// GET /messages/conversations - Kullanıcının tüm konuşmalarını getir
router.get('/conversations', getConversations);

// GET /messages/:partnerId - Belirli bir kullanıcıyla olan mesajları getir
router.get('/:partnerId', getMessages);

// POST /messages - Yeni mesaj gönder
router.post('/', sendMessage);

// PUT /messages/:partnerId/read - Mesajları okundu olarak işaretle
router.put('/:partnerId/read', markAsRead);

export default router;
