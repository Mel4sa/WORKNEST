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
      <Box sx={{ px: 3, maxWidth: 1200, mx: "auto" }}>
        {/* Projeler List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {projects.map((project) => (
            <Box
              key={project._id}
              onClick={() => handleDetailClick(project._id)}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 3,
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateX(8px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                  borderColor: "#6b0f1a"
                }
              }}
            >
              {/* Proje Avatar/Icon */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 3,
                  flexShrink: 0
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: "#fff", 
                    fontWeight: "bold" 
                  }}
                >
                  {project.title?.[0]?.toUpperCase()}
                </Typography>
              </Box>

              {/* Proje Bilgileri */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: "700", 
                      color: "#1f2937",
                      fontSize: "1.3rem"
                    }}
                  >
                    {project.title}
                  </Typography>
                  
                  {/* Status Badge */}
                  <Chip
                    label={
                      project.status === "completed" ? "Tamamlandı" :
                      project.status === "ongoing" ? "Devam Ediyor" : "Beklemede"
                    }
                    size="small"
                    sx={{
                      background: 
                        project.status === "completed" ? "linear-gradient(45deg, #4caf50, #66bb6a)" :
                        project.status === "ongoing" ? "linear-gradient(45deg, #ff9800, #ffb74d)" : 
                        "linear-gradient(45deg, #9e9e9e, #bdbdbd)",
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "0.7rem"
                    }}
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {/* Proje Lideri */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar 
                      src={project.owner?.profileImage}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: "2px solid #6b0f1a"
                      }}
                    >
                      {project.owner?.fullname?.[0]}
                    </Avatar>
                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: "500" }}>
                      {project.owner?.fullname}
                    </Typography>
                  </Box>

                  {/* Üye Sayısı */}
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    {project.members?.length || 0}/{project.maxMembers} üye
                  </Typography>
                </Box>
              </Box>

              {/* Sağ taraf - İncele Butonu */}
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDetailClick(project._id);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: "600",
                  borderRadius: "12px",
                  px: 3,
                  py: 1.5,
                  background: "#6b0f1a",
                  color: "#fff",
                  "&:hover": {
                    background: "#8c1c2b",
                    transform: "scale(1.05)"
                  },
                  transition: "all 0.3s ease",
                  flexShrink: 0
                }}
              >
                İncele
              </Button>
            </Box>
          ))}
        </Box>

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