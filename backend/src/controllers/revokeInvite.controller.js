// backend/src/controllers/invitation.controller.js
import Invitation from "../models/invitation.model.js";

// Daveti geri çek
export const revokeInvite = async (req, res) => {
  try {
    const { projectId, receiverId } = req.body;
    const senderId = req.user._id;

    // Sadece gönderen kişi daveti geri çekebilir
    const invite = await Invitation.findOne({
      project: projectId,
      receiver: receiverId,
      sender: senderId,
      status: 'pending'
    });

    if (!invite) {
      return res.status(404).json({ message: "Bekleyen davet bulunamadı" });
    }

    await invite.deleteOne();

    // SOCKET.IO: Davet geri çekildiğinde hem alıcıya hem gönderen kullanıcıya event gönder
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(receiverId.toString()).emit("invite:deleted");
        io.to(senderId.toString()).emit("invite:deleted");
      }
    } catch (err) {
      console.error("[SOCKET] Davet geri çekmede socket emit hatası:", err);
    }

    return res.json({ message: "Davet başarıyla geri çekildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
