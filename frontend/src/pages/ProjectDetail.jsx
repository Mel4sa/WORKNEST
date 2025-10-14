import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Snackbar,
  Container
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axiosInstance from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import ProjectHeader from "../components/project/ProjectHeader";
import TeamMembersList from "../components/project/TeamMembersList";
import ProjectDialogs from "../components/project/ProjectDialogs";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [progress, setProgress] = useState(0);           
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: ""
  });
  const [editStatusData, setEditStatusData] = useState("");
  const [swipedMember, setSwipedMember] = useState(null);

  const animationRef = useRef();

  // Backend'den proje detayını getir
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/projects/${id}`);
      console.log("Project API response:", response.data); // Debug için
      
      setProject(response.data); // Backend'den direkt project objesi geliyor
      setEditFormData({
        title: response.data.title || "",
        description: response.data.description || ""
      });
      setEditStatusData(response.data.status || "planned");
    } catch (err) {
      console.error("Proje detayı yüklenemedi:", err);
      setError("Proje detayı yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Üye silme fonksiyonu
  // Swipe işlemini başlat
  const handleSwipeStart = (e, memberId) => {
    // Eğer memberId null ise swipe'ı kapat
    if (memberId === null) {
      setSwipedMember(null);
      return;
    }
    
    if (e.type === 'touchstart') {
      const startX = e.touches[0].clientX;
      
      const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX;
        const deltaX = startX - currentX;
        
        if (deltaX > 30) {
          setSwipedMember(memberId);
        } else if (deltaX < -30) {
          setSwipedMember(null);
        }
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    } else if (e.type === 'mousedown') {
      const startX = e.clientX;
      
      const handleMouseMove = (e) => {
        const currentX = e.clientX;
        const deltaX = startX - currentX;
        
        if (deltaX > 30) {
          setSwipedMember(memberId);
        } else if (deltaX < -30) {
          setSwipedMember(null);
        }
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      console.log("🗑️  Üye silme işlemi başlıyor:", { 
        memberId, 
        projectId: id,
        currentUser: user?._id 
      });
      
      // API çağrısı yap
      console.log("📡 API çağrısı yapılıyor:", `/projects/${id}/members/${memberId}`);
      console.log("📡 Full URL:", `${axiosInstance.defaults.baseURL}/projects/${id}/members/${memberId}`);
      
      // Önce UI'dan hemen kaldır
      setProject(prev => ({
        ...prev,
        members: prev.members.filter(member => {
          const memberUserId = member.user?._id || member._id;
          console.log("🔍 Karşılaştırma:", { memberUserId, memberId });
          return memberUserId !== memberId;
        })
      }));
      
      const response = await axiosInstance.delete(`/projects/${id}/members/${memberId}`);
      console.log("✅ API yanıtı:", response.data);
      setSuccessSnackbar({ open: true, message: "Üye başarıyla projeden silindi!" });
      setSwipedMember(null); // Swipe durumunu sıfırla
    } catch (err) {
      console.error("Üye silinemedi:", err);
      console.error("Error response:", err.response?.data);
      
      // Hata durumunda projeyi yeniden yükle
      fetchProject();
      
      setError(err.response?.data?.message || "Üye silinemedi. Lütfen tekrar deneyin.");
    }
  };

  // Proje iptal etme fonksiyonu
  const handleCancelProject = async () => {
    try {
      await axiosInstance.put(`/projects/${id}`, { 
        ...project, 
        status: "cancelled" 
      });
      setProject(prev => ({ ...prev, status: "cancelled" }));
      setCancelDialogOpen(false);
      setSuccessSnackbar({ open: true, message: "Proje başarıyla iptal edildi!" });
    } catch (err) {
      console.error("Proje iptal edilemedi:", err);
      setError("Proje iptal edilemedi. Lütfen tekrar deneyin.");
    }
  };

  // Proje silme fonksiyonu
  const handleDeleteProject = async () => {
    try {
      await axiosInstance.delete(`/projects/${project._id}`);
      setDeleteDialogOpen(false);
      navigate("/projects");
    } catch (err) {
      console.error("Proje silinirken hata:", err);
      setError(err.response?.data?.message || "Proje silinirken bir hata oluştu.");
      setDeleteDialogOpen(false);
    }
  };

  // Proje güncelleme fonksiyonu
  const handleProjectSave = async () => {
    try {
      // Hem proje bilgilerini hem de durumu güncelle
      await axiosInstance.put(`/projects/${id}`, {
        ...editFormData,
        status: editStatusData
      });
      setProject(prev => ({ 
        ...prev, 
        ...editFormData,
        status: editStatusData
      }));
      setIsEditing(false);
      setSuccessSnackbar({ open: true, message: "Proje başarıyla güncellendi!" });
    } catch (err) {
      console.error("Proje güncellenemedi:", err);
      setError("Proje güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (!project) return;

    let targetProgress = 0;
    if (project.status === "completed") {
      targetProgress = 100;
    } else if (project.status === "ongoing") {
      targetProgress = 60;
    } else if (project.status === "cancelled") {
      targetProgress = 0;
    } else {
      targetProgress = 15;
    }

    let current = 0;
    const animationDuration = 2000; // 2 saniye
    const incrementPerFrame = targetProgress / (animationDuration / 16); // 60 FPS için sabit artış

    const step = () => {
      current = Math.min(current + incrementPerFrame, targetProgress);
      setProgress(current);

      if (current < targetProgress) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        // Animasyon tamamlandıktan sonra otomatik durum güncelleme
        let newStatus = project.status;
        if (targetProgress === 0) {
          newStatus = "planned"; // Yeni başladı
        } else if (targetProgress === 100) {
          newStatus = "completed"; // Tamamlandı
        } else if (targetProgress > 0 && targetProgress < 100) {
          newStatus = "ongoing"; // Devam ediyor
        }
        
        // Eğer durum değişmişse güncelle
        if (newStatus !== project.status && project.status !== "cancelled") {
          setProject(prev => ({ ...prev, status: newStatus }));
        }
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationRef.current);
  }, [project]);

  if (loading) {
    return (
      <Box sx={{ 
        padding: "40px", 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: "40px", minHeight: "100vh" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ padding: "40px", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5">Proje bulunamadı!</Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
            Geri Dön
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: { xs: "20px", md: "40px" }, 
      minHeight: "100vh", 
      backgroundColor: "#fafbfc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Geri Dön Butonu */}
      <Box sx={{ width: "100%", maxWidth: "1200px", mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ 
            background: "#4a0d16",
            color: "#fff",
            fontWeight: "600",
            borderRadius: "12px",
            px: 3,
            py: 1.5,
            "&:hover": {
              background: "#5c1119",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(74, 13, 22, 0.3)"
            },
            transition: "all 0.3s ease"
          }}
        >
          Geri Dön
        </Button>
      </Box>

      {/* Ana İçerik - Sol ve Sağ Layout */}
      <Box sx={{ 
        display: "flex", 
        gap: 4, 
        flexDirection: { xs: "column", lg: "row" },
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}>
        
        {/* Sol Taraf - Proje Durumu ve Bilgileri */}
        <Box sx={{ flex: 1, width: "100%" }}>
          <ProjectHeader
            project={project}
            isEditing={isEditing}
            editFormData={editFormData}
            editStatusData={editStatusData}
            currentUser={user}
            onEditToggle={() => setIsEditing(!isEditing)}
            onFormDataChange={setEditFormData}
            onStatusChange={setEditStatusData}
            onSave={handleProjectSave}
            onCancel={() => {
              setIsEditing(false);
              setEditFormData({
                title: project.title,
                description: project.description
              });
              setEditStatusData(project.status);
            }}
            progress={progress}
          />
        </Box>

        {/* Sağ Taraf - Takım Üyeleri */}
        <Box sx={{ flex: 1, width: "100%" }}>
          <TeamMembersList
            project={project}

            swipedMember={swipedMember}
            onSwipeStart={handleSwipeStart}
            onRemoveMember={handleRemoveMember}
            currentUser={user}
            onCancelProject={() => setCancelDialogOpen(true)}
            onDeleteProject={() => setDeleteDialogOpen(true)}
          />
        </Box>
      </Box>

      {/* Dialogs */}
      <ProjectDialogs
        cancelDialogOpen={cancelDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        onCancelDialogClose={() => setCancelDialogOpen(false)}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onConfirmCancel={handleCancelProject}
        onConfirmDelete={handleDeleteProject}
        project={project}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbar({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessSnackbar({ open: false, message: '' })} severity="success">
          {successSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProjectDetail;