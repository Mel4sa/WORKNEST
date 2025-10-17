import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import { createNotification } from "./notification.controller.js";

// Davet gönder
export const sendInvite = async (req, res) => {
  try {
    const { projectId, receiverId, message } = req.body;
    const senderId = req.user._id; 
    console.log("🚀 Davet gönderme isteği:", { projectId, receiverId, senderId, message });

    if (message && message.length > 100) {
      return res.status(400).json({ message: "Davet mesajı en fazla 100 karakter olabilir" });
    }

    const project = await Project.findById(projectId);
    const receiver = await User.findById(receiverId);
    
    console.log("📋 Proje bulundu:", project ? project.title : "Bulunamadı");
    console.log("� Proje durumu:", project ? project.status : "Yok");
    console.log("�👤 Alıcı bulundu:", receiver ? receiver.fullname : "Bulunamadı");
    
    if (!project || !receiver) {
      return res.status(404).json({ message: "Proje veya kullanıcı bulunamadı" });
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

    console.log("✅ Davet oluşturuldu:", invite);
    res.status(201).json({ message: "Davet gönderildi", invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const getReceivedInvites = async (req, res) => {
  try {
    console.log("📨 Alınan davetler sorgulanıyor, kullanıcı ID:", req.user._id);
    
    const invites = await Invitation.find({ receiver: req.user._id })
      .populate("sender", "fullname profileImage")
      .populate("project", "title")
      .select("sender receiver project status message createdAt")
      .sort({ createdAt: -1 }); // En yeni davetler en üstte

    console.log("📋 Bulunan davetler:", invites.length, "adet");
    console.log("📋 Davet detayları:", invites);
    
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

export const getSentInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({ sender: req.user._id })
      .populate("receiver", "fullname profileImage")
      .populate("project", "title")
      .select("sender receiver project status message createdAt")
      .sort({ createdAt: -1 }); // En yeni davetler en üstte

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
    const { action } = req.body;

    console.log("🎯 PATCH isteği geldi!");
    console.log("📋 Request params:", req.params);
    console.log("📋 Request body:", req.body);
    console.log("👤 User:", req.user ? req.user._id : "Yok");
    console.log("🎯 Davet yanıtlama isteği:", { inviteId, action, userId: req.user?._id });

    const invite = await Invitation.findById(inviteId).populate('project', 'title maxMembers members');
    console.log("📋 Bulunan davet:", invite ? `${invite._id} - ${invite.status}` : "Bulunamadı");
    console.log("📋 Davet proje bilgisi:", invite?.project);
    
    if (!invite) return res.status(404).json({ message: "Davet bulunamadı" });

    if (invite.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bu daveti yanıtlama yetkiniz yok" });
    }

    if (!["accepted", "declined"].includes(action))
      return res.status(400).json({ message: "Geçersiz işlem" });

    const oldStatus = invite.status;
    invite.status = action;
    await invite.save();

    if (action === "accepted") {
      try {
        console.log("🎯 Proje üyesi ekleme işlemi başlıyor");
        console.log("📋 Invite project ID:", invite.project);
        console.log("👤 User ID:", req.user._id);

        const populatedProject = invite.project;
        console.log("📋 Populated proje:", populatedProject ? `${populatedProject.title} (ID: ${populatedProject._id})` : "Bulunamadı");
        
        const project = await Project.findById(populatedProject._id);
        console.log("📋 Full proje:", project ? `${project.title} (ID: ${project._id})` : "Bulunamadı");
        
        if (project) {
          console.log("👥 Mevcut üye sayısı:", project.members.length);
          console.log("👥 Maksimum üye sayısı:", project.maxMembers);
          
          const isAlreadyMember = project.members.some(
            member => member.user.toString() === req.user._id.toString()
          );
          
          console.log("🔍 Zaten üye mi?", isAlreadyMember);
          
          if (!isAlreadyMember) {
            // Maksimum üye sayısını kontrol et ???
            if (project.members.length < project.maxMembers) {
              const newMember = {
                user: req.user._id,
                joinedAt: new Date(),
                role: 'member'
              };
              
              project.members.push(newMember);
              await project.save();
              
              const updatedProject = await Project.findById(project._id)
                .populate('owner', 'fullname email profileImage title department university')
                .populate('members.user', 'fullname email profileImage title department university bio skills');
              
              console.log(`✅ Kullanıcı ${req.user.fullname} projeye eklendi: ${project.title}`);
              console.log(`👥 Yeni üye sayısı: ${updatedProject.members.length}`);
              console.log(`👥 Yeni üye bilgileri:`, updatedProject.members[updatedProject.members.length - 1]);
            } else {
              console.log(`⚠️  Proje dolu! Maksimum ${project.maxMembers} üye`);
              return res.status(400).json({ 
                message: "Proje maksimum üye sayısına ulaşmış", 
                invite 
              });
            }
          } else {
            console.log(`⚠️  Kullanıcı zaten proje üyesi`);
          }
        } else {
          console.log("❌ Proje bulunamadı!");
        }
      } catch (error) {
        console.error("❌ Proje üyesi ekleme hatası:", error);
        return res.status(500).json({ 
          message: "Davet kabul edildi ama proje üyesi eklenemedi", 
          invite 
        });
      }
    }

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

    console.log(`✅ Davet durumu güncellendi: ${oldStatus} → ${action}`);
    res.json({ 
      message: action === "accepted" 
        ? "Davet kabul edildi ve proje üyesi oldunuz!" 
        : "Davet reddedildi",
      invite 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
