import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // .env yükleniyor

cloudinary.config({
  secure: true
});

export default cloudinary;
