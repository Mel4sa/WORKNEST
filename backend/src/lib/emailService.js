import emailjs from "@emailjs/nodejs";

// EmailJS konfigürasyonu
const emailjsConfig = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY
};

export const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
    const templateParams = {
      to_email: userEmail,
      to_name: userName || 'Kullanıcı',
      user_name: userName,
      reset_link: resetLink,
      message: `Merhaba ${userName || 'Kullanıcı'},\n\nŞifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:\n\n${resetLink}\n\nBu bağlantı 15 dakika geçerlidir.\n\nİyi günler,\nWorkNest Ekibi`
    };

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      {
        publicKey: emailjsConfig.publicKey,
        privateKey: emailjsConfig.privateKey
      }
    );
    return { success: true, response };
    
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error('Email gönderilemedi: ' + error.message);
  }
};

export const sendEmail = async (to, subject, message, userName = 'Kullanıcı') => {
  try {
    const templateParams = {
      to_email: to,
      to_name: userName,
      subject: subject,
      message: message,
      user_name: userName
    };

    const response = await emailjs.send(
      emailjsConfig.serviceId,
      emailjsConfig.templateId,
      templateParams,
      {
        publicKey: emailjsConfig.publicKey,
        privateKey: emailjsConfig.privateKey
      }
    );
    return { success: true, response };
    
  } catch (error) {
    throw new Error('Email gönderilemedi: ' + error.message);
  }
};

export const testEmailConfig = async () => {
  try {
    return {
      configured: !!(emailjsConfig.serviceId && emailjsConfig.templateId && emailjsConfig.publicKey),
      config: {
        serviceId: emailjsConfig.serviceId,
        templateId: emailjsConfig.templateId,
        hasPublicKey: !!emailjsConfig.publicKey,
        hasPrivateKey: !!emailjsConfig.privateKey
      }
    };
  } catch (error) {
    return { configured: false, error: error.message };
  }
};

export default {
  sendPasswordResetEmail,
  sendEmail,
  testEmailConfig
};