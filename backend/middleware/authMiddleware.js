import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(403).json({ message: 'Yetkilendirme yok. Token bulunamadı.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware hatası:', error.message);
    return res.status(401).json({ message: 'Yetkilendirme başarısız.' });
  }
};
