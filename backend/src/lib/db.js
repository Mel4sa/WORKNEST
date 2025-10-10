import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB bağlantısı başarılı");
    console.log("📊 Database Name:", connection.connection.db.databaseName);
    console.log("🔗 Connection Host:", connection.connection.host);
    
    // MongoDB işlemlerini debug et
    mongoose.set('debug', true);
  } catch (error) {
    console.error("❌ MongoDB bağlantı hatası:", error.message);
    process.exit(1);
  }
};

export default connectDB;
