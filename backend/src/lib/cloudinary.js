import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  console.warn("[cloudinary] CLOUDINARY_URL is not set; cloudinary upload will be disabled.");
}


let config = null;

if (cloudinaryUrl) {
  const urlParts = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
  if (urlParts) {
    const [, api_key, api_secret, cloud_name] = urlParts;
    config = { cloud_name, api_key, api_secret, secure: true };
  }
}

if (config) {
  cloudinary.config(config);
}

export default cloudinary;

