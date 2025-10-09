import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import emailjs from "@emailjs/nodejs";

// REGISTER
export const register = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password)
      return res.status(400).json({ message: "Tüm alanları doldurunuz" });

    if (password.length < 8 || password.length > 20)
      return res.status(400).json({ message: "Şifre 8-20 karakter arasında olmalıdır" });
    

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email kullanılmaktadır" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Kayıt başarılı",
      token,
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Register hatası:", error.message);
    res.status(500).json({ message: "Kullanıcı oluşturulurken hata oluştu", error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Geçersiz şifre." });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login hatası:", error.message);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};


//  LOGOUT
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); 
    res.status(200).json({ message: "Çıkış başarılı" });
  } catch (error) {
    console.error("❌ Logout hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};



export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 365 * 24 * 60 * 60 * 1000;
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    res.status(200).json({
      message: "Şifre sıfırlama linki oluşturuldu",
      resetLink,
      fullname: user.fullname || user.email,
    });
  } catch (error) {
    console.error("ForgotPassword hatası:", error.message);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token geçerli mi kontrol
    });

    if (!user) return res.status(400).json({ message: "Geçersiz veya süresi dolmuş token." });


    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    console.error("ResetPassword hatası:", error.message);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

export const resendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "E-posta adresi gerekli" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "E-posta adresi bulunamadı" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 dakika (forgotPassword ile aynı)
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    res.status(200).json({ 
      message: "Yeni şifre sıfırlama bağlantısı oluşturuldu",
      resetLink,
      fullname: user.fullname || user.email
    });
  } catch (error) {
    console.error("Resend reset link error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};