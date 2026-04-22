import mongoose from "mongoose";
import Skill from "../models/skill.model.js";
import fs from "fs";

const skillsFilePath = "./src/data/expanded-skills-array.json";

async function importSkills() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/worknest");
  const skills = JSON.parse(fs.readFileSync(skillsFilePath, "utf-8"));
  await Skill.deleteMany({});
  let added = 0;
  for (const skillName of skills) {
    try {
      await Skill.create({ name: skillName });
      added++;
    } catch (e) {
    }
  }
  mongoose.disconnect();
}

importSkills();
