import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  secure: true,
});

console.log("📌 Cloudinary URL:", process.env.CLOUDINARY_URL);

export default cloudinary;
