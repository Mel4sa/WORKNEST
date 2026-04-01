import mongoose from 'mongoose';
import Invitation from './src/models/invitation.model.js';


async function updateInvitations() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB'ye bağlandı");

    // Tüm invitation'ları al
    const invitations = await Invitation.find({});
    console.log(`📋 Toplam ${invitations.length} davet bulundu`);

    // Message alanı olmayan kayıtları güncelle
    let updatedCount = 0;
    for (const invitation of invitations) {
      if (!invitation.message) {
        invitation.message = "Projeye katılmaya davet ediliyorsunuz!";
        await invitation.save();
        updatedCount++;
        console.log(`✅ Güncellendi: ${invitation._id}`);
      } else {
        console.log(`⏭️  Zaten var: ${invitation._id} - "${invitation.message}"`);
      }
    }

    console.log(`🎉 ${updatedCount} davet güncellendi`);
    
    // Kontrol et
    const updatedInvitations = await Invitation.find({}).select('_id message');
    console.log("\n📋 Güncel durumu:");
    updatedInvitations.forEach(inv => {
      console.log(`${inv._id}: "${inv.message}"`);
    });

  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Bağlantı kapatıldı");
  }
}

updateInvitations();
