import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import bcrypt from "bcryptjs";

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
    res.status(500).json({ message: "Sunucu hatası" });
  }
};


export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenmedi" });
    }

    // Dosya türünü kontrol et
    const fileName = req.file.originalname.toLowerCase();
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');
    
    
    // Cloudinary upload options
    const uploadOptions = {
      folder: "profile_photos",
      format: "jpg", // Her zaman JPG'ye çevir
      transformation: [
        { width: 500, height: 500, crop: "fill" },
        { quality: "auto", format: "jpg" }
      ]
    };

    // HEIC dosyaları için ek ayarlar
    if (isHeic) {
      uploadOptions.resource_type = "image";
      // Cloudinary otomatik olarak HEIC'i destekler ve JPG'ye çevirir
    }

    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);


    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.secure_url },
      { new: true }
    );

    // Geçici dosyayı sil
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.json({ 
      message: `Profil fotoğrafı başarıyla yüklendi${isHeic ? ' (HEIC → JPG çevrildi)' : ''}`,
      user: user,
      originalFormat: isHeic ? 'HEIC' : req.file.mimetype,
      finalFormat: 'JPG'
    });
  } catch (err) {
    
    // Geçici dosyayı temizle
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "Fotoğraf yüklenemedi", 
      error: err.message
    });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id, // _id kullan
      { profileImage: "" },
      { new: true }
    );
    res.json({ message: "Fotoğraf silindi" });
  } catch (err) {
    res.status(500).json({ message: "Silme işlemi başarısız", error: err.message });
  }
};


// Kullanıcı adı değiştirme
export const updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ message: "Yeni kullanıcı adı gerekli" });

    const user = await User.findById(req.user._id);
    user.fullname = newUsername;
    await user.save();

    res.json({ message: "Kullanıcı adı güncellendi", user });
  } catch (err) {
    res.status(500).json({ message: "Kullanıcı adı güncellenemedi", error: err.message });
  }
};

// Email değiştirme
export const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: "Yeni email gerekli" });

    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: "Bu email zaten kullanımda" });

    const user = await User.findById(req.user._id);
    user.email = newEmail;
    await user.save();

    res.json({ message: "Email güncellendi", user });
  } catch (err) {
    res.status(500).json({ message: "Email güncellenemedi", error: err.message });
  }
};

// Şifre değiştirme
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    // Eski şifreyi kontrol et
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Eski şifre yanlış" });

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Şifre başarıyla güncellendi" });
  } catch (err) {
    res.status(500).json({ message: "Şifre güncellenemedi", error: err.message });
  }
};


// Hesap silme
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id; // _id kullan
    await User.findByIdAndDelete(userId);

    res.clearCookie("token"); // varsa cookie temizle
    return res.status(200).json({ message: "Hesap başarıyla silindi" });
  } catch (error) {
    res.status(500).json({ message: "Hesap silinemedi", error: error.message });
  }
};

// Kullanıcı arama (Navbar için) - fullname ve title alanlarına göre
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: "Arama terimi en az 1 karakter olmalıdır" });
    }

    const searchTerm = q.trim();
    console.log("🔍 Arama terimi:", searchTerm);

    // Büyük/küçük harf duyarsız regex
    const searchRegex = new RegExp(searchTerm, 'i');

    // fullname ve title alanlarında arama
    const users = await User.find({
      _id: { $ne: currentUserId }, // Kendi hesabını hariç tut
      $or: [
        { fullname: searchRegex },
        { title: searchRegex }
      ]
    })
    .select('fullname title profileImage')
    .limit(15)
    .lean();

    console.log("✅ Arama sonuçları:", users.length, "kullanıcı bulundu");
    res.status(200).json(users);
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error);
    res.status(500).json({ message: "Arama sırasında bir hata oluştu" });
  }
};

