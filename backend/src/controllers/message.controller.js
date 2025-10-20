import Message from '../models/message.model.js';
import User from '../models/user.model.js';

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
    console.error('Mesajlar getirilemedi:', error);
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

    // Alıcının var olup olmadığını kontrol et
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Alıcı bulunamadı' });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    await newMessage.save();

    // Populate edilmiş mesajı geri döndür
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'fullname username profileImage')
      .populate('receiver', 'fullname username profileImage');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Mesaj gönderilemedi:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Kullanıcının tüm konuşmalarını getir
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Son mesajları grupla
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
          as: 'partner'
        }
      },
      {
        $unwind: '$partner'
      },
      {
        $project: {
          partner: {
            _id: '$partner._id',
            fullname: '$partner.fullname',
            username: '$partner.username',
            profileImage: '$partner.profileImage'
          },
          lastMessage: '$lastMessage',
          unreadCount: '$unreadCount'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Konuşmalar getirilemedi:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
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
    console.error('Mesajlar güncellenemedi:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
