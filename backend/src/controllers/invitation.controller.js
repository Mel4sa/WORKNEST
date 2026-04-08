import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { createNotification } from "./notification.controller.js";

// Davet gönder
export const sendInvite = async (req, res) => {
  try {
    const { projectId, receiverId, message } = req.body;
    const senderId = req.user._id; 
  // ...existing code...

    if (message && message.length > 100) {
      return res.status(400).json({ message: "Davet mesajı en fazla 100 karakter olabilir" });
    }

    const project = await Project.findById(projectId);
    const receiver = await User.findById(receiverId);
    
  // ...existing code...
    

    if (!project || !receiver) {
      return res.status(404).json({ message: "Proje veya kullanıcı bulunamadı" });
    }


    // Kullanıcı zaten proje üyesiyse davet gönderme
    const isAlreadyMember = project.members.some(m => {
      if (m.user) return m.user.toString() === receiverId.toString();
      return m.toString() === receiverId.toString();
    });
    if (isAlreadyMember) {
      return res.status(400).json({ message: "Bu kullanıcı zaten proje üyesi!" });
    }

    // Aynı projede bekleyen bir davet var mı kontrol et
    const existingInvite = await Invitation.findOne({
      project: projectId,
      receiver: receiverId,
      status: 'pending'
    });
    if (existingInvite) {
      return res.status(400).json({ message: "Bu kullanıcıya zaten bekleyen bir davet var!" });
    }

    if (project.status === "cancelled") {
      return res.status(400).json({ message: "İptal edilmiş projelere davet gönderilemez" });
    }

    if (project.status === "completed") {
      return res.status(400).json({ message: "Tamamlanmış projelere davet gönderilemez" });
    }


    const invite = await Invitation.create({
      project: projectId,
      sender: senderId,
      receiver: receiverId,
      status: "pending", // pending, accepted, declined
      message: message || "Projeye katılmaya davet ediliyorsunuz!"
    });

    // SOCKET.IO: Davet gönderildiğinde alıcıya anlık event gönder
    try {
      const io = req.app.get("io");
      if (io && receiverId) {
        io.to(receiverId.toString()).emit("invite:new");
      }
    } catch (err) {
      console.error("[SOCKET] Davet gönderiminde socket emit hatası:", err);
    }

    // Alıcıya bildirim gönder
    await createNotification({
      userId: receiverId,
      type: 'invite_sent',
      title: 'Yeni Proje Daveti',
      message: `${req.user.fullname} sizi "${project.title}" projesine davet etti`,
      relatedProject: projectId,
      relatedUser: senderId,
      relatedInvite: invite._id
    });

  // ...existing code...
    res.status(201).json({ message: "Davet gönderildi", invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const getReceivedInvites = async (req, res) => {
  try {
  // ...existing code...
    
    const invites = await Invitation.find({ receiver: req.user._id })
      .populate("sender", "fullname profileImage")
      .populate("project", "title")
      .select("sender receiver project status message createdAt")
      .sort({ createdAt: -1 }); // En yeni davetler en üstte

  // ...existing code...
  // ...existing code...
    
  // ...existing code...
    
    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const getSentInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({ sender: req.user._id })
      .populate("receiver", "fullname profileImage")
      .populate("project", "title")
      .select("sender receiver project status message createdAt")
      .sort({ createdAt: -1 }); // En yeni davetler en üstte

    // console.log("📤 Gönderilen davetler:", invites.length, "adet");
    // invites.forEach(invite => {
    //   console.log(`📤 Sent Invite ID ${invite._id}:`, {
    //     message: invite.message,
    //     messageType: typeof invite.message,
    //     messageLength: invite.message?.length,
    //     hasMessage: !!invite.message
    //   });
    // });

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
    const { action } = req.body;

  // ...existing code...

  const invite = await Invitation.findById(inviteId).populate('project', 'title maxMembers members');
  // ...existing code...
    
    if (!invite) return res.status(404).json({ message: "Davet bulunamadı" });

    if (invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu daveti yanıtlama yetkiniz yok" });
    }

    if (!["accepted", "declined"].includes(action))
      return res.status(400).json({ message: "Geçersiz işlem" });


    const oldStatus = invite.status;
    // If accepted, add user to project, then delete invite. If declined, just delete invite.

    if (action === "accepted") {
      try {
        // ...existing code...
      } catch (error) {
        console.error("❌ Proje üyesi ekleme hatası:", error);
        return res.status(500).json({ 
          message: "Davet kabul edildi ama proje üyesi eklenemedi", 
          invite 
        });
      }
    }


    // Send notification before deleting invite
    const notificationType = action === "accepted" ? 'invite_accepted' : 'invite_declined';
    const notificationTitle = action === "accepted" ? 'Davet Kabul Edildi' : 'Davet Reddedildi';
    const notificationMessage = action === "accepted" 
      ? `${req.user.fullname} "${invite.project.title}" projesine katılma davetinizi kabul etti`
      : `${req.user.fullname} "${invite.project.title}" projesine katılma davetinizi reddetti`;

    await createNotification({
      userId: invite.sender,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      relatedProject: invite.project._id,
      relatedUser: req.user._id,
      relatedInvite: invite._id
    });

    // Delete the invitation from DB
    await Invitation.findByIdAndDelete(invite._id);
  // ...existing code...

    // SOCKET.IO: Davet yanıtlandığında hem gönderen hem alıcıya anlık event gönder
    try {
      const io = req.app.get("io");
      if (io) {
        // Alıcıya (yanıtlayan) ve gönderen kullanıcıya event gönder
        io.to(invite.receiver.toString()).emit("invite:updated");
        io.to(invite.sender.toString()).emit("invite:updated");
      }
    } catch (err) {
      console.error("[SOCKET] Davet yanıtında socket emit hatası:", err);
    }

    res.json({ 
      message: action === "accepted" 
        ? "Davet kabul edildi ve proje üyesi oldunuz!" 
        : "Davet reddedildi ve davet kaydı silindi"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
