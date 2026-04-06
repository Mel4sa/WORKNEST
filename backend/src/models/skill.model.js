import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

export default mongoose.model("Skill", SkillSchema);
