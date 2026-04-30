export const deleteConversation = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    // Mesajları fiziksel olarak silmiyoruz, sadece silen kişiyi listeye ekliyoruz
    const result = await Message.updateMany(
      {
        $or: [
          { sender: currentUserId, receiver: partnerId },
          { sender: partnerId, receiver: currentUserId }
        ],
        deletedBy: { $ne: currentUserId } // Zaten silinmemişse ekle
      },
      {
        $push: { deletedBy: currentUserId }
      }
    );

    res.status(200).json({ success: true, message: 'Sohbet sizden gizlendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sohbet gizlenemedi', error: error.message });
  }
};
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { createNotification } from './notification.controller.js';

export const getMessages = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: partnerId },
        { sender: partnerId, receiver: currentUserId }
      ],
      deletedBy: { $ne: currentUserId } // SİHİRLİ DOKUNUŞ: Silen kişiye gösterme
    })
    .populate('sender', 'fullname username profileImage')
    .populate('receiver', 'fullname username profileImage')
    .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Mesaj gönder
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Alıcı ve mesaj içeriği gerekli' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Alıcı bulunamadı' });
    }

    const sender = await User.findById(senderId);

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      isRead: false
    });

    await newMessage.save();
  
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'fullname username profileImage')
      .populate('receiver', 'fullname username profileImage');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ],
          deletedBy: { $ne: currentUserId } // Bu kullanıcı bu mesajı sildiyse listede sayma
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
                profileImage: 1,
                title: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$partner'
      },
      {
        $addFields: {
          chatId: '$lastMessage.chat'
        }
      },
      {
        $project: {
          partner: '$partner',
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt'
          },
          unreadCount: '$unreadCount',
          chatId: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $limit: 20 
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {

    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

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
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      isRead: { $ne: true } 
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ 
      message: 'Message unread count hatası', 
      error: error.message 
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const result = await Message.updateMany(
      { receiver: currentUserId, isRead: { $ne: true } },
      { $set: { isRead: true } }
    );


    res.status(200).json({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Mesajlar okundu işaretlenemedi', 
      error: error.message 
    });
  }
};

export const getRecentMessageNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id;

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
        $limit: 5
      }
    ]);

    res.status(200).json(recentMessages);
  } catch (error) {
    res.status(500).json({ 
      message: 'Son mesaj bildirimleri getirilemedi', 
      error: error.message 
    });
  }
};
