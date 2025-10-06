import User from "../models/user.model.js";

export const updateProfile = async (req, res) => {
  try {

    const userId = req.user._id;
    const { university, department, title, skills, bio } = req.body;

    const updateData = {};
    if (university !== undefined) updateData.university = university;
    if (department !== undefined) updateData.department = department;
    if (title !== undefined) updateData.title = title;
    if (skills !== undefined) updateData.skills = skills;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });


    res.status(200).json({
      message: "Profil başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Kullanıcı bilgisi çekme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};