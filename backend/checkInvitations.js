import mongoose from 'mongoose';
import Invitation from './src/models/invitation.model.js';


const checkInvitations = async () => {
  try {
    const invitations = await Invitation.find({}).populate('sender', 'fullname').populate('receiver', 'fullname').populate('project', 'title');
    
    // Eğer message alanı yoksa, varsayılan mesajı ekleyelim
    for (let inv of invitations) {
      if (!inv.message) {
        inv.message = "Projeye katılmaya davet ediliyorsunuz!";
        await inv.save();
      }
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

checkInvitations();
