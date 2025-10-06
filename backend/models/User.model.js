import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    university: {
      type: String,
      default: ""
    },
    department: {
      type: String,
      default: ""
    },
        title: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ""
    },
    github: {
      type: String,
      default: ""
    },
    linkedin: {
      type: String,
      default: ""
    },
    profileImage: {
      type: String,
      default: ""
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
