import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware çalışıyor");
    console.log("📋 Headers:", req.headers.authorization ? "Token var" : "Token yok");
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("✅ Token alındı:", token ? "Var" : "Yok");
    }

    if (!token) {
      console.log("❌ Token bulunamadı");
      return res.status(401).json({ message: "Token bulunamadı. Yetkisiz erişim." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token süresi dolmuş" });
      }
      return res.status(401).json({ message: "Geçersiz token" });
    }


    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    req.user = user;
    next();

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};
