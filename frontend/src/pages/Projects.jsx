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
  Fab
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from "../lib/axios";

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/projects");
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
    navigate("/projects/create");
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh",
      background: "#fafbfc",
      pt: 4,
      pb: 8
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: "center", 
        mb: 6,
        px: 3,
        py: 8
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: "900", 
            color: "#6b0f1a",
            mb: 2,
            fontSize: { xs: "2rem", md: "3rem" },
            textShadow: "0 2px 4px rgba(107, 15, 26, 0.2)"
          }}
        >
          PROJELER
        </Typography>
        
        {/* Decorative Line */}
        <Box sx={{
          width: "80px",
          height: "4px",
          background: "linear-gradient(90deg, #6b0f1a, #8c1c2b)",
          mx: "auto",
          mb: 3,
          borderRadius: "2px"
        }} />
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: "#666",
            lineHeight: 1.6,
            fontSize: { xs: "1.2rem", md: "1.4rem" },
            fontWeight: "300",
            textAlign: "center",
            maxWidth: "600px",
            mx: "auto",
            letterSpacing: "0.3px"
          }}
        >
          Takım çalışması ve inovasyon burada başlıyor
        </Typography>
      </Box>

      {/* Hata mesajı */}
      {error && (
        <Box sx={{ px: 3, mb: 3, maxWidth: 1200, mx: "auto" }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Content Container */}
      <Box sx={{ px: 3, maxWidth: 1400, mx: "auto" }}>
        {/* Projeler Grid */}
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
                    borderColor: "#6b0f1a"
                  },
                  height: "450px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Header Section */}
                <Box sx={{ 
                  background: "#6b0f1a",
                  p: 3,
                  position: "relative",
                  minHeight: "100px",
                  display: "flex",
                  alignItems: "center"
                }}>
                  {/* Status Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "20px",
                      background: 
                        project.status === "completed" ? "linear-gradient(45deg, #4caf50, #66bb6a)" :
                        project.status === "ongoing" ? "linear-gradient(45deg, #ff9800, #ffb74d)" : 
                        "linear-gradient(45deg, #9e9e9e, #bdbdbd)",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      zIndex: 10
                    }}
                  >
                    {project.status === "completed" ? "Tamamlandı" :
                     project.status === "ongoing" ? "Devam Ediyor" : "Beklemede"}
                  </Box>

                  {/* Project Title */}
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: "#fff", 
                      fontWeight: "700",
                      textAlign: "center",
                      fontSize: "1.3rem",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      width: "100%",
                      pr: "80px" // Status badge için boşluk
                    }}
                  >
                    {project.title}
                  </Typography>
                </Box>

                <CardContent sx={{ 
                  flex: 1, 
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}>
                  {/* Proje Lideri */}
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    p: 2.5,
                    border: "1px solid #e9ecef"
                  }}>
                    <Avatar 
                      src={project.owner?.profileImage} 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        border: "2px solid #6b0f1a"
                      }}
                    >
                      {project.owner?.fullname?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ 
                        fontWeight: "600", 
                        color: "#1f2937",
                        fontSize: "1rem"
                      }}>
                        {project.owner?.fullname}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: "#6b7280",
                        fontWeight: "500"
                      }}>
                        Proje Lideri
                      </Typography>
                    </Box>
                  </Box>

                  {/* Üye Sayısı */}
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    p: 2.5,
                    border: "1px solid #e9ecef"
                  }}>
                    <Typography variant="body1" sx={{ 
                      color: "#1f2937", 
                      fontWeight: "600",
                      fontSize: "1rem"
                    }}>
                      Takım Üyeleri
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: "#6b0f1a", 
                      fontWeight: "700",
                      fontSize: "1.4rem"
                    }}>
                      {project.members?.length || 0}/{project.maxMembers}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ 
                  p: 3,
                  pt: 1
                }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleDetailClick(project._id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "600",
                      borderRadius: "12px",
                      py: 2,
                      background: "#6b0f1a",
                      color: "#fff",
                      fontSize: "1rem",
                      boxShadow: "0 4px 15px rgba(107, 15, 26, 0.3)",
                      "&:hover": {
                        background: "#8c1c2b",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(107, 15, 26, 0.4)",
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Projeyi İncele
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Boş durum */}
        {projects.length === 0 && !loading && !error && (
          <Box sx={{ 
            textAlign: "center", 
            mt: 8,
            background: "#6b0f1a",
            borderRadius: "20px",
            p: 6,
            boxShadow: "0 8px 32px rgba(107, 15, 26, 0.15)",
            border: "none",
            color: "#fff"
          }}>
            <Typography variant="h4" sx={{ color: "#fff", mb: 2, fontWeight: "700" }}>
              Henüz proje bulunmuyor
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 4, fontSize: "1.1rem" }}>
              İlk projeyi sen oluştur ve topluluğu büyütmeye başla!
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              sx={{
                borderRadius: "15px",
                px: 4,
                py: 1.5,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                fontWeight: "700",
                textTransform: "none",
                fontSize: "1.1rem",
                color: "#fff",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                "&:hover": {
                  background: "rgba(255,255,255,0.3)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                }
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
          bottom: 32,
          right: 32,
          width: 70,
          height: 70,
          background: "#6b0f1a",
          color: "#fff",
          boxShadow: "0 8px 25px rgba(107, 15, 26, 0.4)",
          border: "3px solid rgba(255,255,255,0.2)",
          "&:hover": {
            background: "#8c1c2b",
            transform: "scale(1.1) rotate(90deg)",
            boxShadow: "0 12px 35px rgba(107, 15, 26, 0.6)",
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