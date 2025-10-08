import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Proje başlığı gereklidir'],
    trim: true,
    maxlength: [100, 'Proje başlığı 100 karakterden fazla olamaz']
  },
  
  description: {
    type: String,
    required: [true, 'Proje açıklaması gereklidir'],
    trim: true,
    maxlength: [1000, 'Proje açıklaması 1000 karakterden fazla olamaz']
  },
  
  tags: [{
    type: String,
    enum: ['Web', 'Mobile', 'AI', 'Design', 'Marketing', 'Data Science', 'IoT', 'Game', 'Blockchain', 'Other'],
    required: true
  }],
  
  requiredSkills: [{
    type: String,
    trim: true
  }],
  
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'completed'],
    default: 'pending'
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Proje sahibi gereklidir']
  },
  
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      default: 'member'
    }
  }],
  
  maxMembers: {
    type: Number,
    min: 2,
    max: 10,
    default: 5
  },
  
  deadline: {
    type: Date
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  
}, {
  timestamps: true, // createdAt ve updatedAt otomatik eklenir
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});



const Project = mongoose.model('Project', projectSchema);

export default Project;