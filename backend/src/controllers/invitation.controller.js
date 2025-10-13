import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";

// Davet gönder
export const sendInvite = async (req, res) => {
  try {
    const { projectId, receiverId, message } = req.body;
    const senderId = req.user._id; // Token'dan gelen kullanıcı

    console.log("🚀 Davet gönderme isteği:", { projectId, receiverId, senderId, message });

    // Kontroller
    const project = await Project.findById(projectId);
    const receiver = await User.findById(receiverId);
    
    console.log("📋 Proje bulundu:", project ? project.title : "Bulunamadı");
    console.log("👤 Alıcı bulundu:", receiver ? receiver.fullname : "Bulunamadı");
    
    if (!project || !receiver) {
      return res.status(404).json({ message: "Proje veya kullanıcı bulunamadı" });
    }

    // Davet oluştur
    const invite = await Invitation.create({
      project: projectId,
      sender: senderId,
      receiver: receiverId,
      status: "pending", // pending, accepted, declined
      message: message || "Projeye katılmaya davet ediliyorsunuz!"
    });

    console.log("✅ Davet oluşturuldu:", invite);
    res.status(201).json({ message: "Davet gönderildi", invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Alınan davetleri listele
export const getReceivedInvites = async (req, res) => {
  try {
    console.log("📨 Alınan davetler sorgulanıyor, kullanıcı ID:", req.user._id);
    
    const invites = await Invitation.find({ receiver: req.user._id })
      .populate("sender", "fullname profileImage")
      .populate("project", "title")
      .select("sender receiver project status message createdAt");

    console.log("📋 Bulunan davetler:", invites.length, "adet");
    console.log("📋 Davet detayları:", invites);
    
    // Her bir davet için message alanını özellikle kontrol et
    invites.forEach(invite => {
      console.log(`📨 Invite ID ${invite._id}:`, {
        message: invite.message,
        messageType: typeof invite.message,
        messageLength: invite.message?.length,
        hasMessage: !!invite.message
      });
    });
    
    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Gönderilen davetleri listele
export const getSentInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({ sender: req.user._id })
      .populate("receiver", "fullname profileImage")
      .populate("project", "title")
      .select("sender receiver project status message createdAt");

    console.log("📤 Gönderilen davetler:", invites.length, "adet");
    invites.forEach(invite => {
      console.log(`📤 Sent Invite ID ${invite._id}:`, {
        message: invite.message,
        messageType: typeof invite.message,
        messageLength: invite.message?.length,
        hasMessage: !!invite.message
      });
    });

    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Daveti kabul et / reddet
export const respondInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body; // "accepted" veya "declined"

    const invite = await Invitation.findById(inviteId);
    if (!invite) return res.status(404).json({ message: "Davet bulunamadı" });

    if (!["accepted", "declined"].includes(action))
      return res.status(400).json({ message: "Geçersiz işlem" });

    invite.status = action;
    await invite.save();

    res.json({ message: `Davet ${action} olarak işaretlendi`, invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
