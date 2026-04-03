import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  CardActions, 
  Box,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Fab,
  Divider
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import axiosInstance from "../lib/axios";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/projects/my-projects");
      setProjects(response.data.projects);
    } catch (err) {
      console.error("Projeler yüklenemedi:", err);
      setError("Projeler yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDetailClick = (id) => {
    navigate(`/projects/${id}`);
  };

  const handleCreateProject = () => {
    navigate("/create-project");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress sx={{ color: "#6b0f1a" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#f4f6f8", pt: 4, pb: 10 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 5, px: 3 }}>
         <Typography 
          variant="h5" 
          sx={{ 
            color: "#637381",
            fontSize: { xs: "1.1rem", md: "1.3rem" },
            fontWeight: 500,
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          Takım çalışması ve inovasyon burada başlıyor
        </Typography>
        <Box sx={{
          width: "80px",
          height: "4px",
          background: "linear-gradient(90deg, #6b0f1a, #a82936)",
          mx: "auto",
          mt: 2,
          borderRadius: "4px"
        }} />
      </Box>

      {/* Hata mesajı */}
      {error && (
        <Box sx={{ px: 3, mb: 4, maxWidth: 1200, mx: "auto" }}>
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Content Container */}
      <Box sx={{ px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
        <Grid container spacing={3}>
          {projects.map((project) => {
            // Üye sayısı hesaplama
            const regularMembers = project.members?.filter(member => {
              const memberUserId = member.user?._id || member._id;
              return memberUserId !== project.owner?._id;
            }).length || 0;
            const totalMembers = regularMembers + 1;

            return (
              <Grid item xs={12} sm={6} md={4} key={project._id}>
                <Card
                  onClick={() => handleDetailClick(project._id)}
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    border: "1px solid rgba(145, 158, 171, 0.2)",
                    bgcolor: "#fff",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    '&:hover': {
                      boxShadow: "0 12px 24px -4px rgba(107, 15, 26, 0.12)",
                      borderColor: "rgba(107, 15, 26, 0.3)",
                      transform: "translateY(-4px)"
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
                    {/* Kart Üst Kısım: İkon ve Durum */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          background: "rgba(107, 15, 26, 0.08)",
                          color: "#6b0f1a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.4rem"
                        }}
                      >
                        {project.title?.[0]?.toUpperCase()}
                      </Box>
                      
                      <Chip
                        label={
                          project.status === "completed" ? "Tamamlandı" :
                          project.status === "ongoing" ? "Devam Ediyor" :
                          project.status === "planned" ? "Planlanıyor" :
                          project.status === "cancelled" ? "İptal Edildi" :
                          project.status === "on_hold" ? "Beklemede" : "Beklemede"
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          borderRadius: "8px",
                          px: 1,
                          // Duruma göre renkler
                          ...(project.status === "completed" && { bgcolor: "rgba(76, 175, 80, 0.1)", color: "#2e7d32" }),
                          ...(project.status === "ongoing" && { bgcolor: "rgba(255, 152, 0, 0.1)", color: "#ed6c02" }),
                          ...(project.status === "planned" && { bgcolor: "rgba(33, 150, 243, 0.1)", color: "#1565c0" }),
                          ...(project.status === "cancelled" && { bgcolor: "rgba(244, 67, 54, 0.1)", color: "#c62828" }),
                          ...((project.status === "on_hold" || !project.status) && { bgcolor: "rgba(158, 158, 158, 0.1)", color: "#616161" }),
                        }}
                      />
                    </Box>

                    {/* Proje Başlığı */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: "#212b36", 
                        mb: 2,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Proje Sahibi ve Üye Sayısı */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
                      <Box 
                        sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${project.owner?._id}`);
                        }}
                      >
                        <Avatar 
                          src={project.owner?.profileImage}
                          sx={{ width: 34, height: 34, border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        >
                          {project.owner?.fullname?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#212b36", lineHeight: 1.2, '&:hover': { color: "#6b0f1a" } }}>
                            {project.owner?.fullname}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#919eab", fontWeight: 500 }}>
                            Proje Sahibi
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#637381' }}>
                        <GroupOutlinedIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {totalMembers}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider sx={{ borderStyle: 'dashed' }} />

                  {/* İncele Butonu */}
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDetailClick(project._id);
                      }}
                      sx={{
                        color: "#6b0f1a",
                        fontWeight: 700,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1,
                        borderRadius: "10px",
                        '&:hover': {
                          bgcolor: "rgba(107, 15, 26, 0.08)"
                        }
                      }}
                    >
                      Projeyi İncele
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Boş durum (Hiç proje yoksa) */}
        {projects.length === 0 && !loading && !error && (
          <Box sx={{ 
            textAlign: "center", 
            mt: 6,
            background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
            borderRadius: "24px",
            p: { xs: 4, md: 8 },
            boxShadow: "0 12px 32px rgba(107, 15, 26, 0.2)",
            color: "#fff"
          }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>
              Henüz proje bulunmuyor
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 4, fontSize: "1.1rem" }}>
              İlk projeyi sen oluştur ve topluluğu büyütmeye başla!
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              sx={{
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                bgcolor: "#fff",
                color: "#6b0f1a",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "#f4f6f8",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                },
                transition: "all 0.2s"
              }}
            >
              İlk Projeyi Oluştur
            </Button>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        onClick={handleCreateProject}
        sx={{
          position: "fixed",
          bottom: { xs: 24, md: 40 },
          right: { xs: 24, md: 40 },
          width: 64,
          height: 64,
          background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
          color: "#fff",
          boxShadow: "0 8px 20px rgba(107, 15, 26, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #8c1c2b, #a82936)",
            transform: "scale(1.08)",
            boxShadow: "0 12px 28px rgba(107, 15, 26, 0.5)",
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1000
        }}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </Fab>
    </Box>
  );
}

export default Projects;