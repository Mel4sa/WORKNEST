import express from "express";
import connectDB from "./config/db.js";  
import dotenv from "dotenv";

dotenv.config();

const app = express();

// MongoDB bağlantısı
connectDB();

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server ${process.env.PORT} portunda çalışıyor`);
});
