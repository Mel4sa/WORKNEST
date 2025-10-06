import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

// Profil güncelleme
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { university, department, title, skills, bio, github, linkedin } = req.body;

    const updateData = {};
    if (university !== undefined) updateData.university = university;
    if (department !== undefined) updateData.department = department;
    if (title !== undefined) updateData.title = title;
    if (skills !== undefined) updateData.skills = skills;
    if (bio !== undefined) updateData.bio = bio;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

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

// Me – giriş yapan kullanıcıyı döndür
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Fetch user hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};


export const uploadPhoto = async (req, res) => {
  try {
    const file = req.file;
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile_photos",
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true }
    );

    fs.unlinkSync(file.path);
    res.json({ url: user.profileImage });
  } catch (err) {
    res.status(500).json({ message: "Fotoğraf yüklenemedi", error: err.message });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: "" },
      { new: true }
    );
    res.json({ message: "Fotoğraf silindi" });
  } catch (err) {
    res.status(500).json({ message: "Silme işlemi başarısız", error: err.message });
  }
};