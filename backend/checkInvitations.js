import mongoose from 'mongoose';
import Invitation from './src/models/invitation.model.js';

mongoose.connect('mongodb://localhost:27017/worknest');

const checkInvitations = async () => {
  try {
    const invitations = await Invitation.find({}).populate('sender', 'fullname').populate('receiver', 'fullname').populate('project', 'title');
    console.log('Invitations in DB:', JSON.stringify(invitations, null, 2));
    
    // Eğer message alanı yoksa, varsayılan mesajı ekleyelim
    for (let inv of invitations) {
      if (!inv.message) {
        inv.message = "Projeye katılmaya davet ediliyorsunuz!";
        await inv.save();
        console.log(`Updated invitation ${inv._id} with default message`);
      }
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

checkInvitations();
