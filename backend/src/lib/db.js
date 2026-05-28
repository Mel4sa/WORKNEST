import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const updateResourceTypes = async () => {
  try {
    const Project = mongoose.model('Project');
    const projects = await Project.find({ isActive: true });
    let updatedCount = 0;

    for (const project of projects) {
      if (project.resources && project.resources.length > 0) {
        project.resources = project.resources.map(resource => {
          const title = resource.title || '';
          const ext = title.split('.').pop().toLowerCase();
          
          let newType = 'link';
          if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
            newType = 'image';
          } else if (["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar", "7z", "txt", "rtf"].includes(ext)) {
            newType = 'file';
          }
          
          if (resource.type !== newType) {
            resource.type = newType;
            updatedCount++;
          }
          return resource;
        });
        await project.save();
      }
    }
  } catch (error) {
  }
};

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlantısı başarılı");
    
    await updateResourceTypes();
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error.message);
    process.exit(1);
  }
};

export default connectDB;
