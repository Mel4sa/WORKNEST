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
  Snackbar,
  Typography
} from "@mui/material";
import axios from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import UserProfileActions from "../components/userProfile/UserProfileActions";
import UserProfileHeader from "../components/userProfile/UserProfileHeader";
import UserProfileDetails from "../components/userProfile/UserProfileDetails";
import InviteDialog from "../components/userProfile/InviteDialog";

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
      const errorMessage = err.response?.data?.message || "Davet gönderilirken hata oluştu";
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };

  // Chat sayfasına yönlendir ve chat oluştur
  const handleChatClick = async () => {
    try {
      // Kullanıcı ile chat oluştur veya mevcut chat'i getir
      await axios.get(`/chats/user/${userId}`);
      // Messages sayfasına yönlendir
      navigate('/messages');
    } catch (err) {
      console.error('Chat oluşturulamadı:', err);
      // Hata olsa bile Messages sayfasına yönlendir
      navigate('/messages');
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
        onChatClick={handleChatClick}
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

      {/* Davet Dialogu */}
      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => {
          setInviteDialogOpen(false);
          setSelectedProject("");
          setInviteMessage("");
        }}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        inviteMessage={inviteMessage}
        setInviteMessage={setInviteMessage}
        onSendInvite={handleSendInvite}
        receiverName={user.fullname}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfile;
