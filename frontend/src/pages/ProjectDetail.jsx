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
  Divider
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
  const animationRef = useRef();

  // Backend'den proje detayını getir
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/projects/${id}`);
      setProject(response.data);
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
        variant="outlined" 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        ← Geri Dön
      </Button>

      {/* Ana İçerik */}
      <Card sx={{ borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Başlık ve Status */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", color: "#6b0f1a" }}>
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

          {/* Takım Üyeleri */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: "600", mb: 2 }}>
              Takım Üyeleri ({project.members?.length || 0}/{project.maxMembers})
            </Typography>
            {project.members && project.members.length > 0 ? (
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
                {project.members.map((member, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar 
                      src={member.profileImage}
                      sx={{ width: 40, height: 40 }}
                    >
                      {member.fullname?.[0]}
                    </Avatar>
                    <Typography variant="body2">
                      {member.fullname}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Henüz takım üyesi yok
              </Typography>
            )}
          </Box>

          {/* İstatistikler */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#6b0f1a" }}>
                {project.members?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Takım Üyesi
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#6b0f1a" }}>
                {project.maxMembers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maksimum Üye
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "#6b0f1a" }}>
                {Math.round(displayProgress)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tamamlanma
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProjectDetail;