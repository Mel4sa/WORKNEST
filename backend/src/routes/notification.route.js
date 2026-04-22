import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { 
  getNotifications,
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.get("/recent", getRecentNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:notificationId/read", markAsRead);
router.patch("/mark-all-read", markAllAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;
