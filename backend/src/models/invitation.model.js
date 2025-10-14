import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Proje gereklidir']
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Gönderen kullanıcı gereklidir']
  },
  
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Alıcı kullanıcı gereklidir']
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  
  message: {
    type: String,
    default: 'Projeye katılmaya davet ediliyorsunuz!',
    maxlength: [500, 'Davet mesajı en fazla 500 karakter olabilir'],
    trim: true
  },
  }, {
  timestamps: true
});

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
