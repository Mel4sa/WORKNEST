import dotenv from "dotenv";
import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";

import inviteRoutes from "./routes/invitation.route.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/project.route.js";
import notificationRoutes from "./routes/notification.route.js";
import messageRoutes from "./routes/message.route.js";
import chatRoutes from "./routes/chat.route.js";
import connectDB from "./lib/db.js";
import aiRoutes from "./routes/ai.route.js";

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
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/ai", aiRoutes);


app.get("/", (req, res) => res.send("WorkNest Backend Çalışıyor!"));


connectDB();

// SOCKET.IO
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Her yerde erişmek için global olarak ekle
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Yeni bir client bağlandı!", socket.id);

  // Kullanıcı kimliği ile odaya katılma
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`👤 Kullanıcı odasına katıldı: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client bağlantısı koptu:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server ${PORT} portunda (socket.io ile) çalışıyor`);
});