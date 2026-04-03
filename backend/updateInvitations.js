import mongoose from 'mongoose';
import Invitation from './src/models/invitation.model.js';


async function updateInvitations() {
  try {
    await mongoose.connect(MONGO_URI);

    // Tüm invitation'ları al
    const invitations = await Invitation.find({});

    // Message alanı olmayan kayıtları güncelle
    let updatedCount = 0;
    for (const invitation of invitations) {
      if (!invitation.message) {
        invitation.message = "Projeye katılmaya davet ediliyorsunuz!";
        await invitation.save();
        updatedCount++;
      } else {
      }
    }

    
    // Kontrol et
    const updatedInvitations = await Invitation.find({}).select('_id message');
    updatedInvitations.forEach(inv => {
    });

  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await mongoose.connection.close();
  }
}

updateInvitations();
