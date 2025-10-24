// Bir kişiyle olan tüm mesajları sil
export const deleteConversation = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    // Hem gönderici hem alıcı olarak iki taraflı sil
    const result = await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId }
      ]
    });

    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sohbet silinemedi', error: error.message });
  }
};
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { createNotification } from './notification.controller.js';

// Mesajları getir (iki kullanıcı arasındaki konuşma)
export const getMessages = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'fullname username profileImage')
    .populate('receiver', 'fullname username profileImage')
    .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
  // ...
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Mesaj gönder
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

  // ...

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Alıcı ve mesaj içeriği gerekli' });
    }

    // Alıcının var olup olmadığını kontrol et
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Alıcı bulunamadı' });
    }

    // Göndereni de al (bildirim için isim gerekli)
    const sender = await User.findById(senderId);

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      isRead: false
    });

    await newMessage.save();
  // ...

    // Mesaj bildirimi oluştur
    try {
      await createNotification({
        userId: receiverId,
        type: 'new_message',
        title: 'Yeni Mesaj',
        message: `${sender.fullname} size bir mesaj gönderdi`,
        relatedUser: senderId
      });
  // ...
    } catch (notificationError) {
  // ...
      // Bildirim hatası mesaj gönderimini engellemez
    }

    // Populate edilmiş mesajı geri döndür
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'fullname username profileImage')
      .populate('receiver', 'fullname username profileImage');

    res.status(201).json(populatedMessage);
  } catch (error) {
  // ...
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcının tüm konuşmalarını getir - Optimize edilmiş
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

  // ...

    // Optimize edilmiş aggregate query - limit ekleyelim
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                username: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$partner'
      },
      {
        $project: {
          partner: '$partner',
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: '$unreadCount'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 20 // Son 20 konuşma
      }
    ]);

  // ...

    res.status(200).json(conversations);
  } catch (error) {
  // ...
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Mesajları okundu olarak işaretle
export const markAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        sender: partnerId,
        receiver: currentUserId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.status(200).json({ message: 'Mesajlar okundu olarak işaretlendi' });
  } catch (error) {
  // ...
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Okunmamış mesaj sayısını getir
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

  // ...

    // Sadece okunmamış mesajları say - isRead: true olanları sayma
    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      isRead: { $ne: true } // true olmayan tüm durumlar (false, undefined, null)
    });

  // ...

    res.status(200).json({ unreadCount });
  } catch (error) {
  // ...
    res.status(500).json({ 
      message: 'Message unread count hatası', 
      error: error.message 
    });
  }
};

// Tüm mesajları okundu olarak işaretle
export const markAllAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;

  // ...

    const result = await Message.updateMany(
      { receiver: currentUserId, isRead: { $ne: true } },
      { $set: { isRead: true } }
    );

  // ...

    res.status(200).json({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
  // ...
    res.status(500).json({ 
      message: 'Mesajlar okundu işaretlenemedi', 
      error: error.message 
    });
  }
};

// Navbar için son mesaj bildirimlerini getir
export const getRecentMessageNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;

  // ...

    // Son okunmamış mesajları gönderen kişiye göre grupla
    const recentMessages = await Message.aggregate([
      {
        $match: {
          receiver: currentUserId,
          isRead: { $ne: true }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$sender',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sender',
          pipeline: [
            {
              $project: {
                _id: 1,
                fullname: 1,
                profileImage: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $project: {
          sender: '$sender',
          lastMessage: {
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: '$unreadCount'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 5 // Son 5 kişiden gelen mesajlar
      }
    ]);

  // ...

    res.status(200).json(recentMessages);
  } catch (error) {
  // ...
    res.status(500).json({ 
      message: 'Son mesaj bildirimleri getirilemedi', 
      error: error.message 
    });
  }
};
