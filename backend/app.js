import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// CORS ayarı (frontend ile credential uyumlu)
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,               // cookie ve auth header’ı izin ver
}));

app.use(express.json());
app.use(cookieParser());

// Request log middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log('📦 Body:', req.body);
  next();
});

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("🌿 WorkNest Backend Çalışıyor!"));

// DB bağlantısı
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT} portunda çalışıyor`);
});