import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary URL'den parçaları ayır
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
  throw new Error("CLOUDINARY_URL environment variable is not set");
}

// URL'yi parse et: cloudinary://api_key:api_secret@cloud_name
const urlParts = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
if (!urlParts) {
  throw new Error("Invalid CLOUDINARY_URL format");
}

const [, api_key, api_secret, cloud_name] = urlParts;

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
  secure: true,
});

// Cloudinary başarıyla konfigüre edildi

export default cloudinary;
