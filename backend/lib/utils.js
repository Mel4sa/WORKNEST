import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  // user objesi genelde { id, email } gibi bilgileri içerir
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET, // .env dosyanda JWT_SECRET olmalı
    { expiresIn: "7d" }     // Token 7 gün geçerli
  );
};
