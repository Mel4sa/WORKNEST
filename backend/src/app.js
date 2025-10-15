import dotenv from "dotenv";
import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";

import inviteRoutes from "./routes/invitation.route.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/project.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectDB from "./lib/db.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/", (req, res) => res.send("WorkNest Backend Çalışıyor!"));

// DB bağlantısı
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT} portunda çalışıyor`);
});