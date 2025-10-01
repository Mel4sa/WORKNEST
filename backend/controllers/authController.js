// import User from "../models/User.js";
// import { hashPassword, comparePassword } from "../utils/password.js";
// import jwt from "jsonwebtoken";

// const { validationResult } = require("express-validator");



// export const register = async (req, res) => {
//   try {
//     const { fullname, email, password, bio } = req.body;
//     if (!fullname || !email || !password)
//       return res.status(400).json({ message: "Tüm alanları doldurunuz" });

//     const existingUser = await User.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ message: "Email kullanılmaktadır" });

//     const hashed = await hashPassword(password);

//     const user = await User.create({ fullname, email, password: hashed, bio });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(201).json({ id: user._id, fullname: user.fullname, email: user.email, token });
//   } catch (err) {
//     res.status(500).json({ message: "Kayıt sırasında hata oluştu", error: err.message });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email ve şifre gereklidir" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı" });

//     const isMatch = await comparePassword(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Hatalı şifre" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

//     res.status(200).json({ id: user._id, fullname: user.fullname, email: user.email, token });
//   } catch (err) {
//     res.status(500).json({ message: "Giriş sırasında hata oluştu", error: err.message });
//   }
// };
