import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";

// Kullanıcının tüm sohbetlerini getir

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'fullname username profileImage')
      .populate('lastMessage')
      .sort({ lastActivity: -1 });

    const formattedChats = chats.map(chat => {
      const partner = chat.participants.find(p => p._id.toString() !== userId.toString());
      return { ...chat._doc, partner };
    });

    res.status(200).json({ chats: formattedChats }); // "chats" key'i içinde gönderiyoruz
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Belirli bir kullanıcıyla sohbet başlat veya mevcut sohbeti getir
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Kendinizle sohbet başlatamazsınız" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Sıra fark etmeksizin iki kullanıcı arasındaki sohbeti bul
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    }).populate({
      path: 'participants',
      select: 'fullname username profileImage'
    });

    // Eğer sohbet yoksa yeni oluştur
    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, userId]
      });
      chat = await Chat.findById(chat._id).populate({
        path: 'participants',
        select: 'fullname username profileImage'
      });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("Sohbet oluşturma/getirme hatası:", error);
    res.status(500).json({ message: "Sohbet işlemi başarısız", error: error.message });
  }
};

// Sohbetteki mesajları getir
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ message: "Sohbet bulunamadı veya erişim yetkiniz yok" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate({
        path: 'sender',
        select: 'fullname username profileImage'
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Mesajları okundu olarak işaretle
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.status(200).json({
      messages: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: await Message.countDocuments({ chat: chatId })
      }
    });
  } catch (error) {
    console.error("Mesajları getirme hatası:", error);
    res.status(500).json({ message: "Mesajlar getirilemedi", error: error.message });
  }
};

// Mesaj gönder
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = "text" } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Mesaj içeriği boş olamaz" });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({ message: "Sohbet bulunamadı veya erişim yetkiniz yok" });
    }

    // Receiver'ı bul
    const receiverId = chat.participants.find(
      participantId => participantId.toString() !== userId.toString()
    );

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      receiver: receiverId,
      content: content.trim(),
      messageType
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastActivity: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate({
        path: 'sender',
        select: 'fullname username profileImage'
      });

    // Bildirim gönder
    const otherParticipants = chat.participants.filter(
      participantId => participantId.toString() !== userId.toString()
    );
    for (const participantId of otherParticipants) {
      try {
        await createNotification({
          userId: participantId,
          type: 'new_message',
          title: 'Yeni Mesaj',
          message: `${populatedMessage.sender.fullname} size bir mesaj gönderdi`,
          relatedUser: userId
        });
      } catch (notificationError) {
        console.error("❌ Bildirim gönderilemedi:", notificationError);
      }
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error);
    res.status(500).json({ message: "Mesaj gönderilemedi", error: error.message });
  }
};

// Mesaj düzenle
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Mesaj içeriği boş olamaz" });
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: "Mesaj bulunamadı veya düzenleme yetkiniz yok" });
    }

    // 10 dakika kontrolü
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    if (message.createdAt < tenMinutesAgo) {
      return res.status(400).json({
        message: "Bu mesaj 10 dakikadan eski olduğu için düzenlenemez",
        canEdit: false,
        timeLeft: 0
      });
    }

    await Message.findByIdAndUpdate(messageId, {
      content: content.trim()
    });

    const updatedMessage = await Message.findById(messageId)
      .populate({
        path: 'sender',
        select: 'fullname username profileImage'
      });

    res.status(200).json({
      success: true,
      message: updatedMessage
    });

  } catch (error) {
    console.error("❌ Mesaj düzenleme hatası:", error);
    res.status(500).json({
      message: "Mesaj düzenlenemedi",
      error: error.message
    });
  }
};

// Mesaj sil
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: "Mesaj bulunamadı veya silme yetkiniz yok" });
    }

    // 1 gün kontrolü
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    if (message.createdAt < oneDayAgo) {
      return res.status(400).json({
        message: "Bu mesaj 1 günden eski olduğu için silinemez",
        canDelete: false,
        timeLeft: 0
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Mesaj silindi",
      deletedMessageId: messageId
    });
  } catch (error) {
    console.error("Mesaj silme hatası:", error);
    res.status(500).json({ message: "Mesaj silinemedi", error: error.message });
  }
};

// Okunmamış mesaj sayısını getir
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      chat: {
        $in: await Chat.find({ participants: userId }).select('_id')
      },
      sender: { $ne: userId },
      isRead: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Okunmamış mesaj sayısı getirme hatası:", error);
    res.status(500).json({ message: "Okunmamış mesaj sayısı getirilemedi", error: error.message });
  }
};