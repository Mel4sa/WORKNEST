import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Box,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Snackbar
} from "@mui/material";
import axios from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import UserProfileActions from "../components/userProfile/UserProfileActions";
import UserProfileHeader from "../components/userProfile/UserProfileHeader";
import UserProfileDetails from "../components/userProfile/UserProfileDetails";
import InviteDialog from "../components/userProfile/InviteDialog";
import ChatDialog from "../components/userProfile/ChatDialog";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]); // Current user'ın projeleri (davet için)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Chat state'leri
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Current user'ın projelerini getir (davet için)
  const fetchUserProjects = useCallback(async () => {
    try {
      const response = await axios.get("/projects/my-projects");
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Projeler yüklenemedi:", err);
    }
  }, []);



  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/profile/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error("Profil yüklenemedi:", err);
      setError("Profil yüklenemedi. Kullanıcı bulunamadı veya profil gizli.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserProjects();
    }
  }, [userId, fetchUserProfile, fetchUserProjects]);

  // Davet gönderme fonksiyonu
  const handleSendInvite = async () => {
    try {
      const inviteData = {
        projectId: selectedProject,
        receiverId: userId,
        message: inviteMessage || "Projeye katılmaya davet ediliyorsunuz!"
      };
      
      console.log(" Gönderilen davet verisi:", inviteData);
      console.log(" inviteMessage state:", inviteMessage);
      console.log(" inviteMessage length:", inviteMessage?.length);
      
      const response = await axios.post("/invites/send", inviteData);
      console.log(" Sunucu yanıtı:", response.data);
      
      setSnackbar({
        open: true,
        message: "Davet başarıyla gönderildi!",
        severity: "success"
      });
      
      setInviteDialogOpen(false);
      setSelectedProject("");
      setInviteMessage("");
    } catch (err) {
      console.error("Davet gönderilemedi:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Davet gönderilemedi. Tekrar deneyin.",
        severity: "error"
      });
    }
  };

  // Chat fonksiyonları
  // Chat başlat/aç
  const handleChatOpen = useCallback(async () => {
    console.log("🎯 Chat açılıyor, userId:", userId);
    setChatOpen(true);
    setChatLoading(true);
    
    try {
      // Kullanıcıyla chat oluştur veya mevcut chat'i getir
      console.log("📞 Chat API çağrısı yapılıyor...");
      const chatResponse = await axios.get(`/chats/user/${userId}`);
      console.log("💬 Chat response:", chatResponse.data);
      setCurrentChat(chatResponse.data.chat);
      
      // Chat mesajlarını getir
      const messagesResponse = await axios.get(`/chats/${chatResponse.data.chat._id}/messages`);
      
      // Mesajları frontend formatına çevir
      const formattedMessages = messagesResponse.data.messages.map(msg => ({
        id: msg._id,
        senderId: msg.sender._id,
        senderName: msg.sender.fullname,
        senderAvatar: msg.sender.profileImage,
        message: msg.content,
        timestamp: new Date(msg.createdAt),
        isMe: msg.sender._id === currentUser._id
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Chat yüklenemedi:", error);
      setSnackbar({ 
        open: true, 
        message: "Chat yüklenemedi", 
        severity: "error" 
      });
    } finally {
      setChatLoading(false);
    }
  }, [userId, currentUser]);

  const handleSendMessage = async () => {
    console.log("🚀 handleSendMessage çağrıldı");
    
    if (!newMessage.trim() || !currentChat) {
      console.log("❌ Mesaj boş veya chat yok, çıkılıyor");
      return;
    }
    
    const messageText = newMessage;
    const tempId = `temp-${Date.now()}`; // Geçici ID
    setNewMessage(""); // Hemen temizle
    
    // Optimistic update - mesajı hemen UI'a ekle
    const optimisticMsg = {
      id: tempId,
      senderId: currentUser._id,
      senderName: currentUser.fullname,
      senderAvatar: currentUser.profileImage,
      message: messageText,
      timestamp: new Date(),
      isMe: true,
      sending: true // Gönderiliyor durumu
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    
    try {
      console.log("� Mesaj gönderiliyor:", messageText);
      
      // Backend'e mesaj gönder
      const response = await axios.post(`/chats/${currentChat._id}/messages`, {
        content: messageText,
        messageType: "text"
      });
      
      console.log("✅ Mesaj gönderildi, response:", response.data);
      
      // Geçici mesajı gerçek mesajla değiştir
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? {
              id: response.data.message._id,
              senderId: response.data.message.sender._id,
              senderName: response.data.message.sender.fullname,
              senderAvatar: response.data.message.sender.profileImage,
              message: response.data.message.content,
              timestamp: new Date(response.data.message.createdAt),
              isMe: true,
              sending: false
            }
          : msg
      ));
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
      
      // Hata durumunda geçici mesajı kaldır ve mesajı geri koy
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageText);
      
      setSnackbar({ 
        open: true, 
        message: "Mesaj gönderilemedi", 
        severity: "error" 
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mesaj silme fonksiyonu
  const handleDeleteMessage = async (messageId) => {
    console.log("🗑️ Mesaj siliniyor:", messageId);
    
    try {
      // Optimistic update - mesajı hemen kaldır
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Backend'den sil
      await axios.delete(`/chats/messages/${messageId}`);
      
      console.log("✅ Mesaj silindi");
      
      setSnackbar({ 
        open: true, 
        message: "Mesaj silindi", 
        severity: "success" 
      });
    } catch (error) {
      console.error("Mesaj silinemedi:", error);
      
      // Hata durumunda sayfayı yenile
      window.location.reload();
      
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || "Mesaj silinemedi", 
        severity: "error" 
      });
    }
  };

  // Eğer kendi profilini görmeye çalışıyorsa, normal Profile sayfasına yönlendir
  useEffect(() => {
    if (currentUser && userId === currentUser._id) {
      navigate("/profile");
    }
  }, [currentUser, userId, navigate]);

  // URL parametresinde openChat=true varsa otomatik chat aç
  useEffect(() => {
    const openChat = searchParams.get('openChat');
    console.log("🔍 URL Parametresi Kontrolü:", { 
      openChat, 
      user: !!user, 
      chatOpen, 
      shouldOpen: openChat === 'true' && user && !chatOpen 
    });
    
    if (openChat === 'true' && user && !chatOpen) {
      console.log("🎯 URL parametresinden chat açılıyor");
      setTimeout(() => {
        handleChatOpen();
      }, 500); // Biraz gecikme ekleyelim
      
      // URL'den parametreyi temizle
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, user, chatOpen, handleChatOpen]);

  // Navigation state'inden openChat kontrolü
  useEffect(() => {
    const shouldOpenChat = location.state?.openChat;
    console.log("🔍 Navigation State Kontrolü:", { 
      shouldOpenChat, 
      user: !!user, 
      chatOpen,
      locationState: location.state,
      currentUrl: window.location.href
    });
    
    if (shouldOpenChat && user && !chatOpen && !loading) {
      console.log("🎯 Navigation state'inden chat açılıyor - ŞIMDI!");
      handleChatOpen();
      
      // State'i temizle
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, user, chatOpen, handleChatOpen, location.pathname, loading, navigate]);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "80vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: "40px", minHeight: "80vh" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ padding: "40px", minHeight: "80vh", textAlign: "center" }}>
        <Typography variant="h5">Kullanıcı bulunamadı!</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: "40px", 
      minHeight: "100vh", 
      backgroundColor: "#fafbfc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Geri Dön ve Davet At Butonları */}
      <UserProfileActions
        onGoBack={() => navigate(-1)}
        onInviteClick={() => setInviteDialogOpen(true)}
      />

      {/* Profil Kartı */}
      <Card sx={{
        width: "100%",
        maxWidth: "800px",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "visible",
        position: "relative",
        mt: 4
      }}>
        {/* Profil Avatar */}
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          top: "-60px",
          left: 0,
          right: 0,
          zIndex: 10
        }}>
          <Avatar
            src={user.profileImage}
            sx={{
              width: 120,
              height: 120,
              border: "6px solid white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              fontSize: "3rem",
              fontWeight: "bold",
              bgcolor: "#6b0f1a"
            }}
          >
            {user.fullname?.[0]?.toUpperCase()}
          </Avatar>
        </Box>

        <CardContent sx={{ pt: 12, pb: 4 }}>
          <UserProfileHeader user={user} />
          <Divider sx={{ my: 3 }} />
          <UserProfileDetails user={user} />
        </CardContent>
      </Card>

      {/* Davet Dialog'u */}
      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        user={user}
        projects={projects}
        currentUser={currentUser}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        inviteMessage={inviteMessage}
        setInviteMessage={setInviteMessage}
        onSendInvite={handleSendInvite}
      />

      {/* Chat Dialog */}
      <ChatDialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        user={user}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        onDeleteMessage={handleDeleteMessage}
        loading={chatLoading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfile;
