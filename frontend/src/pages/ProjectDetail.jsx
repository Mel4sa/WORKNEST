import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Stack, 
  Avatar, 
  LinearProgress, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import axiosInstance from "../lib/axios";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);           
  const [displayProgress, setDisplayProgress] = useState(0); 
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const animationRef = useRef();

  // Backend'den proje detayını getir
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/projects/${id}`);
      console.log("Project API response:", response.data); // Debug için
      setProject(response.data); // Backend'den direkt project objesi geliyor
    } catch (err) {
      console.error("Proje detayı yüklenemedi:", err);
      setError("Proje detayı yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    } else {
      targetProgress = 15;
    }

    let current = 0;

    const step = () => {
      const increment = Math.max(targetProgress / 20, 0.5); 
      current = Math.min(current + increment, targetProgress);
      setProgress(current);

      setDisplayProgress(prev => {
        const diff = current - prev;
        return prev + diff * 0.2; 
      });

      if (current < targetProgress) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setDisplayProgress(targetProgress); 
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
      backgroundColor: "#fafbfc" 
    }}>
      {/* Geri Dön Butonu */}
      <Button 
        variant="contained" 
        onClick={() => navigate(-1)}
        sx={{ 
          mb: 3,
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
        ← Geri Dön
      </Button>

      {/* Ana İçerik - İki Sütunlu Layout */}
      <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", lg: "row" } }}>
        
        {/* Sol Taraf - Ana Proje Bilgileri */}
        <Box sx={{ flex: 2 }}>
          <Card sx={{ borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 4 }}>
              {/* Başlık ve Status */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: "bold", color: "#6b0f1a", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                  {project.title}
                </Typography>
                <Chip
                  label={
                    project.status === "completed" ? "Tamamlandı" :
                    project.status === "ongoing" ? "Devam Ediyor" : "Beklemede"
                  }
                  sx={{
                    background: 
                      project.status === "completed" ? "linear-gradient(45deg, #4caf50, #66bb6a)" :
                      project.status === "ongoing" ? "linear-gradient(45deg, #ff9800, #ffb74d)" : 
                      "linear-gradient(45deg, #9e9e9e, #bdbdbd)",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "0.9rem"
                  }}
                />
              </Box>

              {/* Proje Lideri */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar 
                  src={project.owner?.profileImage}
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    mr: 2,
                    border: "2px solid #6b0f1a"
                  }}
                >
                  {project.owner?.fullname?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "600" }}>
                    {project.owner?.fullname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Proje Lideri
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Açıklama */}
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 2 }}>
                Proje Açıklaması
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, color: "#666" }}>
                {project.description}
              </Typography>

              {/* İlerleme Çubuğu */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: "600", mb: 2 }}>
                  Proje İlerleme Durumu
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                      background: "linear-gradient(90deg, #6b0f1a, #8c1c2b)",
                      transition: "all 0.3s ease-in-out",
                    },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                  %{Math.round(displayProgress)} tamamlandı
                </Typography>
              </Box>

              {/* İstatistikler */}
                   
            </CardContent>
          </Card>
        </Box>

        {/* Sağ Taraf - Takım Üyeleri */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", height: "fit-content" }}>
            <CardContent sx={{ p: 3 }}>
              {/* Takım Başlığı */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "600", color: "#6b0f1a" }}>
                  Takım Üyeleri
                </Typography>
              </Box>

              {/* Üye Sayısı */}
              <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
                {project.members?.length || 0} üye
              </Typography>

              {/* Üyeler Listesi */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Proje Lideri */}
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2,
                  p: 2,
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  border: "2px solid #6b0f1a"
                }}>
                  <Avatar 
                    src={project.owner?.profileImage}
                    sx={{ width: 45, height: 45 }}
                  >
                    {project.owner?.fullname?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "600" }}>
                      {project.owner?.fullname}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b0f1a", fontWeight: "500" }}>
                      Proje Lideri
                    </Typography>
                  </Box>
                </Box>

                {/* Diğer Üyeler */}
                {project.members && project.members.length > 0 ? (
                  project.members.map((member, idx) => (
                    <Box key={idx} sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 2,
                      p: 2,
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <Avatar 
                        src={member.profileImage}
                        sx={{ width: 45, height: 45 }}
                      >
                        {member.fullname?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: "500" }}>
                          {member.fullname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Takım Üyesi
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ 
                    textAlign: "center", 
                    py: 3,
                    border: "2px dashed #e5e7eb",
                    borderRadius: "12px"
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz başka takım üyesi yok
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Proje Silme Butonu */}
              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{
                    borderRadius: "12px",
                    py: 1.5,
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    fontWeight: "600",
                    "&:hover": {
                      borderColor: "#b91c1c",
                      backgroundColor: "rgba(220, 38, 38, 0.04)",
                      transform: "translateY(-1px)"
                    },
                    transition: "all 0.3s ease"
                  }}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Projeyi Sil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Silme Onay Dialog'u */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "20px",
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: "center", 
          fontWeight: "700", 
          color: "#dc2626",
          fontSize: "1.5rem",
          pb: 1
        }}>
          Projeyi Silmek İstediğinize Emin Misiniz?
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: "#666", lineHeight: 1.6 }}>
            <strong>"{project?.title}"</strong> adlı proje kalıcı olarak silinecek.
          </Typography>
          <Typography variant="body2" sx={{ color: "#dc2626", fontWeight: "500" }}>
            Bu işlem geri alınamaz!
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              borderColor: "#6b7280",
              color: "#6b7280",
              "&:hover": {
                borderColor: "#4b5563",
                backgroundColor: "rgba(107, 114, 128, 0.04)"
              }
            }}
          >
            İptal
          </Button>
          
          <Button
            onClick={() => {
              // Silme işlemi burada yapılacak
              console.log("Proje silinecek:", project._id);
              setDeleteDialogOpen(false);
              // navigate("/projects"); // Silme işlemi tamamlandıktan sonra projeler sayfasına yönlendir
            }}
            variant="contained"
            sx={{
              borderRadius: "12px",
              px: 4,
              py: 1,
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c"
              }
            }}
          >
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectDetail;