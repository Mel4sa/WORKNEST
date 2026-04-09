import Invitation from "../models/invitation.model.js";

export const revokeInvite = async (req, res) => {
  try {
    const { projectId, receiverId } = req.body;
    const senderId = req.user._id;


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
