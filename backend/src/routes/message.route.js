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

router.use(protectRoute);

router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/recent-notifications', getRecentMessageNotifications);

router.put('/mark-all-read', markAllAsRead);

router.delete('/:partnerId/delete-all', deleteConversation);

router.get('/:partnerId', getMessages);

router.post('/', sendMessage);

router.put('/:partnerId/read', markAsRead);

export default router;
