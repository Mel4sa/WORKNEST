import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { createNotification } from "./notification.controller.js";

// 1. Sol taraftaki sohbet listesini getirir
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

    res.status(200).json({ chats: formattedChats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Bir kullanıcıya tıklandığında sohbeti bulur veya anında oluşturur
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params; // Tıklanan kişinin ID'si
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Kendinizle sohbet başlatamazsınız" });
    }

    // Mevcut sohbeti en hızlı şekilde bul
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    }).populate('participants', 'fullname username profileImage');

    if (!chat) {
      // Sohbet yoksa oluştur
      chat = await Chat.create({
        participants: [currentUserId, userId],
        lastActivity: new Date()
      });
      // Oluşturulan sohbeti populate et
      chat = await Chat.findById(chat._id).populate('participants', 'fullname username profileImage');
    }

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Sohbet başlatılamadı", error: error.message });
  }
};

// 3. Mesajları getirir (Instagram tarzı: Eskiler yukarıda, yeniler aşağıda)
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Geçersiz sohbet ID" });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ message: "Sohbet erişimi reddedildi" });

    const partnerId = chat.participants.find(p => p.toString() !== userId.toString());

    // AKILLI SORGU: Hem chat ID ile hem de eski mesajları (ID'siz olanları) çeker
    const messages = await Message.find({
      $or: [
        { chat: chatId },
        { 
          sender: { $in: [userId, partnerId] }, 
          receiver: { $in: [userId, partnerId] } 
        }
      ]
    })
    .populate('sender', 'fullname username profileImage')
    .sort({ createdAt: -1 });

    // Okundu işaretle
    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      messages: messages.reverse(),
      pagination: { total: messages.length }
    });
  } catch (error) {
    res.status(500).json({ message: "Mesajlar yüklenemedi", error: error.message });
  }
};

// 4. Mesaj Gönder
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = "text" } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({ message: "İçerik boş olamaz" });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ message: "Sohbet bulunamadı" });

    const receiverId = chat.participants.find(p => p.toString() !== userId.toString());

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

    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullname username profileImage');

    // Bildirimleri gönder (Sistem yavaşlamasın diye bekletmiyoruz)
    chat.participants.filter(p => p.toString() !== userId.toString()).forEach(pId => {
      createNotification({
        userId: pId,
        type: 'new_message',
        title: 'Yeni Mesaj',
        message: `${populatedMessage.sender.fullname} size mesaj gönderdi`,
        relatedUser: userId
      }).catch(err => console.error("Bildirim hatası:", err));
    });

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Gönderilemedi", error: error.message });
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