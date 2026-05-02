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
  
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  
  status: {
    type: String,
    enum: ['planned', 'pending', 'ongoing', 'completed', 'on_hold', 'cancelled'],
    default: 'planned'
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
  
  lookingForMembers: {
    type: Boolean,
    default: false
  },
  
lookingForSkills: [{
    type: String,
    trim: true
  }],
  
  // Support for multiple job postings (ilans)
  ilans: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Üye Arıyoruz'
    },
    description: {
      type: String,
      trim: true
    },
    skills: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if project has any active ilans
projectSchema.virtual('hasActiveIlan').get(function() {
  // Check legacy lookingForMembers field OR new ilans array
  if (this.lookingForMembers) return true;
  if (this.ilans && this.ilans.length > 0) {
    return this.ilans.some(ilan => ilan.isActive === true);
  }
  return false;
});

// Virtual to get all active ilans
projectSchema.virtual('activeIlans').get(function() {
  if (!this.ilans) return [];
  return this.ilans.filter(ilan => ilan.isActive === true);
});



const Project = mongoose.model('Project', projectSchema);

export default Project;