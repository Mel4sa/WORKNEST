import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import connectDB from "./config/db.js";

dotenv.config(); // Sadece bir kez, en başta

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log('📦 Body:', req.body);
  next();
});

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("🌿 WorkNest Backend Çalışıyor!"));

// Database bağlantısı
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server ${PORT} portunda çalışıyor`);
});