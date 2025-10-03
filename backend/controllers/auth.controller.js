import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

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
      { expiresIn: "7d" }
    );

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
    res.cookie("jwt", "", { maxAge: 0 }); // cookie'yi hemen sıfırla (JWT'yi temizle)
    res.status(200).json({ message: "Çıkış başarılı" });
  } catch (error) {
    console.error("❌ Logout hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
