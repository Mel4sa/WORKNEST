import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { generateToken } from '../lib/utils.js';

export const register = async (req, res) => {
  const { fullname, email, password, bio } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanları doldurunuz' });
    }

    if (password.length < 8 || password.length > 20) {
      return res.status(400).json({ message: 'Şifre 8-20 karakter arasında olmalıdır' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email kullanılmaktadır' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
    });

    generateToken(newUser._id, res);

    res.status(201).json({
      id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
    });
  }  catch (error) {
    console.error('Error in register controller:', error.message);
    res.status(500).json({
      message: 'Kullanıcı oluşturulurken hata oluştu',
      error: error.message,
    });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Hatalı şifre' });
    }

    generateToken(user._id, res);

    res.status(200).json({
      id: user._id,
      fullname: user.fullname,
      email: user.email,
    });
  } catch (error) {
    console.error('Error in login controller:', error.message);
    res.status(500).json({
      message: 'Giriş yapılırken hata oluştu',
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Çıkış yapıldı' });
};
