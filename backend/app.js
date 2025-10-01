import express from "express";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import cors from "cors";


import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("🌿 WorkNest Backend Çalışıyor!"));

connectDB();

app.listen(5000, () => console.log("Server 5000 portunda çalışıyor"));


dotenv.config();
connectDB();
