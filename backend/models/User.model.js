import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  title: { type: String, default: "" },
  education: { type: String, default: "" },
  skills: { type: [String], default: [] },
  bio: { type: String, maxlength: 500, default: "" },
  socialLinks: { linkedin: String, github: String },
  profileImage: { type: String, default: "/Users/elifors/Desktop/profil fotoğrafı.webp" },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
