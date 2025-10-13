import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import bcrypt from "bcryptjs";

// Başka kullanıcının profilini görme (sadece genel bilgiler)
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('fullname username profileImage university department bio skills createdAt') // Hassas bilgileri çıkar
      .populate('projects', 'title description status createdAt'); // Kullanıcının projelerini de göster

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Profil getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Profil güncelleme (sadece kendi profili)
export const updateProfile = async (req, res) => {
  try {
    // Kimlik doğrulama middleware'i ile gelen kullanıcı ID'si
    const userId = req.user._id;
    const { university, department, title, skills, bio, github, linkedin } = req.body;

    // Sadece kendi profilini güncelleyebilir
    const updateData = {};
    if (university !== undefined) updateData.university = university;
    if (department !== undefined) updateData.department = department;
    if (title !== undefined) updateData.title = title;
    if (skills !== undefined) updateData.skills = skills;
    if (bio !== undefined) updateData.bio = bio;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

    // Güvenlik: Sadece kendi profili güncellenebilir
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { 
      new: true,
      runValidators: true 
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

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


// Kullanıcı adı değiştirme (sadece kendi profili)
export const updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ message: "Yeni kullanıcı adı gerekli" });

    // Kullanıcı adı benzersizlik kontrolü
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    // Sadece kendi kullanıcı adını değiştirebilir
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: newUsername },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({
      message: "Kullanıcı adı başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Kullanıcı adı güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Email değiştirme (sadece kendi profili)
export const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: "Yeni email gerekli" });

    // Email benzersizlik kontrolü
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Bu email zaten kullanımda" });
    }

    // Sadece kendi email'ini değiştirebilir
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { email: newEmail },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({
      message: "Email başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Email güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Şifre değiştirme (sadece kendi profili)
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Eski şifre ve yeni şifre gerekli" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalıdır" });
    }

    // Sadece kendi şifresini değiştirebilir
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    // Eski şifreyi kontrol et
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: "Eski şifre yanlış" });
    }

    // Yeni şifreyi hashle ve güncelle
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Şifre başarıyla güncellendi" });
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Hesap silme (sadece kendi hesabı)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Sadece kendi hesabını silebilir
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({ message: "Hesap başarıyla silindi" });
  } catch (error) {
    console.error("Hesap silme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
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
    .select('_id fullname title profileImage')
    .limit(15)
    .lean();

    console.log("✅ Arama sonuçları:", users.length, "kullanıcı bulundu");
    res.status(200).json(users);
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error);
    res.status(500).json({ message: "Arama sırasında bir hata oluştu" });
  }
};

