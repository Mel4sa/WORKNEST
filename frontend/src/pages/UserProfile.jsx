import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const handleOpenChat = () => {
    setChatOpen(true);
    // Burada gerçek uygulamada mevcut mesajları yüklersiniz
    // Şimdilik örnek mesajlar ekleyelim
    setMessages([
      {
        id: 1,
        senderId: currentUser._id,
        senderName: currentUser.fullname,
        message: "Merhaba! Nasılsın?",
        timestamp: new Date(Date.now() - 30000),
        isMe: true
      },
      {
        id: 2,
        senderId: user._id,
        senderName: user.fullname,
        message: "Merhaba! İyiyim, teşekkürler. Sen nasılsın?",
        timestamp: new Date(Date.now() - 25000),
        isMe: false
      },
      {
        id: 3,
        senderId: currentUser._id,
        senderName: currentUser.fullname,
        message: "Ben de iyiyim. Projen hakkında konuşabilir miyiz?",
        timestamp: new Date(Date.now() - 20000),
        isMe: true
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: messages.length + 1,
      senderId: currentUser._id,
      senderName: currentUser.fullname,
      message: newMessage,
      timestamp: new Date(),
      isMe: true
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    // Burada gerçek uygulamada backend'e mesaj gönderilir
    // Simülasyon için otomatik cevap ekleyelim
    setTimeout(() => {
      const autoReply = {
        id: messages.length + 2,
        senderId: user._id,
        senderName: user.fullname,
        message: "Mesajın için teşekkürler! Yakında cevap vereceğim.",
        timestamp: new Date(),
        isMe: false
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Eğer kendi profilini görmeye çalışıyorsa, normal Profile sayfasına yönlendir
  useEffect(() => {
    if (currentUser && userId === currentUser._id) {
      navigate("/profile");
    }
  }, [currentUser, userId, navigate]);

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
        onChatClick={handleOpenChat}
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
