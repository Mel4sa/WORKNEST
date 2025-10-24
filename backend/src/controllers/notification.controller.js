import Notification from "../models/notification.model.js";

// Bildirim oluştur (genel helper function)
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedProject = null,
  relatedUser = null,
  relatedInvite = null
}) => {
  try {
  // ...
    
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedProject,
      relatedUser,
      relatedInvite
    });
    
  // ...
    return notification;
  } catch (error) {
  // ...
    throw error;
  }
};

export const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 5 } = req.query;

    const notifications = await Notification.find({ user: userId })
      .populate('relatedProject', 'title')
      .populate('relatedUser', 'fullname profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });

    res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
  // ...
    res.status(500).json({ message: "Son bildirimler getirilemedi" });
  }
};

// Kullanıcının bildirimlerini getir
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
      .populate('relatedProject', 'title')
      .populate('relatedUser', 'fullname profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });

    const total = await Notification.countDocuments({ user: userId });

    res.status(200).json({
      notifications,
      unreadCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
  // ...
    res.status(500).json({ message: "Bildirimler getirilemedi" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
  // ...
    
    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });

  // ...

    res.status(200).json({ unreadCount });
  } catch (error) {
  // ...
    res.status(500).json({ message: "Okunmamış bildirim sayısı getirilemedi" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    res.status(200).json({ message: "Bildirim okundu olarak işaretlendi" });
  } catch (error) {
  // ...
    res.status(500).json({ message: "Bildirim güncellenemedi" });
  }
};

// Tüm bildirimleri okundu olarak işaretle
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Tüm bildirimler okundu olarak işaretlendi" });
  } catch (error) {
  // ...
    res.status(500).json({ message: "Bildirimler güncellenemedi" });
  }
};

// Bildirimi sil
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    res.status(200).json({ message: "Bildirim silindi" });
  } catch (error) {
  // ...
    res.status(500).json({ message: "Bildirim silinemedi" });
  }
};
