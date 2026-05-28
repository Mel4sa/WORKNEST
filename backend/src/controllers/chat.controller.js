import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { createNotification } from "./notification.controller.js";

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Geçersiz sohbet ID" });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ message: "Sohbet bulunamadı veya yetkiniz yok" });

    await Message.updateMany(
      { chat: chatId },
      { $addToSet: { deletedBy: userId } }
    );

    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { deletedBy: userId }
    });

    res.status(200).json({ success: true, message: "Sohbet sizden gizlendi", deletedChatId: chatId });
  } catch (error) {
    res.status(500).json({ message: "Sohbet silinemedi", error: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await Chat.find({ 
      participants: userId,
      deletedBy: { $ne: userId } 
    })
      .populate('participants', 'fullname username profileImage title')
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

export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params; 
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Kendinizle sohbet başlatamazsınız" });
    }

    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId], $size: 2 }
    }).populate('participants', 'fullname username profileImage');

    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, userId],
        lastActivity: new Date()
      });
      chat = await Chat.findById(chat._id).populate('participants', 'fullname username profileImage');
    }

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Sohbet başlatılamadı", error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Geçersiz sohbet ID" });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ message: "Sohbet erişimi reddedildi" });

    const messages = await Message.find({
      chat: chatId,
      deletedBy: { $ne: userId } 
    })
    .populate('sender', 'fullname username profileImage')
    .sort({ createdAt: -1 });

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

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = "text" } = req.body;
    const userId = req.user._id;

    if (!content?.trim() && !req.file) {
      return res.status(400).json({ message: "Mesaj içeriği veya dosya gerekli" });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ message: "Sohbet bulunamadı" });

    const receiverId = chat.participants.find(p => p.toString() !== userId.toString());

    const messageData = {
      chat: chatId,
      sender: userId,
      receiver: receiverId,
      content: content?.trim() || "", 
      messageType: messageType, 
    };

    if (req.file) {
      messageData.fileUrl = `/uploads/${req.file.filename}`; 
      messageData.fileName = req.file.originalname; 
      
      if (req.file.mimetype.startsWith("image/")) {
        messageData.messageType = "image";
      } else {
        messageData.messageType = "file";
      }
    }

    // 4. Mesajı Kaydet
    const message = await Message.create(messageData);

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastActivity: new Date(),
      $pull: { deletedBy: { $in: [userId, receiverId] } } 
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullname username profileImage');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Gönderilemedi", error: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) return res.status(400).json({ message: "Mesaj içeriği boş olamaz" });

    const message = await Message.findOne({ _id: messageId, sender: userId });
    if (!message) return res.status(404).json({ message: "Mesaj bulunamadı" });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (message.createdAt < tenMinutesAgo) return res.status(400).json({ message: "Süre doldu" });

    await Message.findByIdAndUpdate(messageId, { content: content.trim() });
    const updatedMessage = await Message.findById(messageId).populate('sender', 'fullname username profileImage');

    res.status(200).json({ success: true, message: updatedMessage });
  } catch (error) {
    res.status(500).json({ message: "Düzenlenemedi", error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({ _id: messageId, sender: userId });
    if (!message) return res.status(404).json({ message: "Mesaj bulunamadı" });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (message.createdAt < oneDayAgo) return res.status(400).json({ message: "Süre doldu" });

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ success: true, message: "Mesaj silindi", deletedMessageId: messageId });
  } catch (error) {
    res.status(500).json({ message: "Silinemedi", error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Message.countDocuments({
      chat: { $in: await Chat.find({ participants: userId }).select('_id') },
      sender: { $ne: userId },
      isRead: false
    });
    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Hata", error: error.message });
  }
};