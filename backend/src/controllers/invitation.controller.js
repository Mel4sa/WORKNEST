import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";

// Davet gönder
export const sendInvite = async (req, res) => {
  try {
    const { projectId, receiverId } = req.body;
    const senderId = req.user._id; // Token’dan gelen kullanıcı

    // Kontroller
    const project = await Project.findById(projectId);
    const receiver = await User.findById(receiverId);
    if (!project || !receiver) {
      return res.status(404).json({ message: "Proje veya kullanıcı bulunamadı" });
    }

    // Davet oluştur
    const invite = await Invitation.create({
      project: projectId,
      sender: senderId,
      receiver: receiverId,
      status: "pending", // pending, accepted, declined
    });

    res.status(201).json({ message: "Davet gönderildi", invite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Alınan davetleri listele
export const getReceivedInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({ receiver: req.user._id })
      .populate("sender", "fullname profileImage")
      .populate("project", "title");

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
      .populate("project", "title");

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
