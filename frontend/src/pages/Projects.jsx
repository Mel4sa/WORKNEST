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
        px: 3
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: "700", 
            color: "#6b0f1a",
            mb: 2,
            fontSize: { xs: "2rem", md: "3rem" }
          }}
        >
          Projeler
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: "#6b7280", 
            maxWidth: 600, 
            mx: "auto",
            lineHeight: 1.6,
            fontSize: { xs: "1rem", md: "1.25rem" }
          }}
        >
          Yaratıcı fikirler burada hayat buluyor. Takımını oluştur, projeni büyüt!
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
        <Grid container spacing={4}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} lg={4} key={project._id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "2px solid #e5e7eb",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                    borderColor: "#d1d5db",
                    "& .project-header": {
                      background: "#3b82f6",
                    }
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Gradient Header */}
                <Box 
                  className="project-header"
                  sx={{
                    background: "#4f46e5",
                    height: "120px",
                    position: "relative",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: "#fff", 
                      fontWeight: "bold",
                      textAlign: "center",
                      px: 2
                    }}
                  >
                    {project.title}
                  </Typography>
                  
                  {/* Status Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      px: 2,
                      py: 0.5,
                      borderRadius: "12px",
                      backgroundColor: 
                        project.status === "completed" ? "#4caf50" :
                        project.status === "ongoing" ? "#ff9800" : "#9e9e9e",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}
                  >
                    {project.status === "completed" ? "Tamamlandı" :
                     project.status === "ongoing" ? "Devam Ediyor" : "Beklemede"}
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Proje açıklaması */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3, 
                      color: "#6b7280",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "72px"
                    }}
                  >
                    {project.description}
                  </Typography>

                  {/* Etiketler */}
                  <Box sx={{ mb: 3 }}>
                    {project.tags?.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          mr: 1,
                          mb: 1,
                          backgroundColor: "#f3f4f6",
                          color: "#4b5563",
                          fontWeight: "500",
                          border: "1px solid #e5e7eb",
                          "& .MuiChip-label": { fontSize: "0.75rem" }
                        }}
                      />
                    ))}
                    {project.tags?.length > 3 && (
                      <Chip
                        label={`+${project.tags.length - 3}`}
                        size="small"
                        sx={{
                          backgroundColor: "#4f46e5",
                          color: "#fff",
                          fontWeight: "bold"
                        }}
                      />
                    )}
                  </Box>

                  {/* Proje sahibi */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar 
                      src={project.owner?.profileImage} 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 2,
                        border: "2px solid #f3f4f6"
                      }}
                    >
                      {project.owner?.fullname?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "600", color: "#1f2937" }}>
                        {project.owner?.fullname}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Proje Lideri
                      </Typography>
                    </Box>
                  </Box>

                  {/* Üye sayısı */}
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                    p: 2
                  }}>
                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: "500" }}>
                      Takım Üyeleri
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: "#4f46e5", 
                      fontWeight: "bold" 
                    }}>
                      {project.members?.length || 0}/{project.maxMembers}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleDetailClick(project._id)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "600",
                      borderRadius: "8px",
                      py: 1.5,
                      background: "#4f46e5",
                      color: "#fff",
                      fontSize: "1rem",
                      "&:hover": {
                        background: "#3b82f6",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                      },
                      transition: "all 0.2s ease"
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
            backgroundColor: "#fff",
            borderRadius: "16px",
            p: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "2px solid #e5e7eb"
          }}>
            <Typography variant="h5" sx={{ color: "#1f2937", mb: 2, fontWeight: "600" }}>
              Henüz proje bulunmuyor
            </Typography>
            <Typography variant="body1" sx={{ color: "#6b7280", mb: 4 }}>
              İlk projeyi sen oluştur ve topluluğu büyütmeye başla!
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreateProject}
              sx={{
                borderRadius: "8px",
                px: 4,
                py: 1.5,
                background: "#4f46e5",
                fontWeight: "600",
                textTransform: "none",
                fontSize: "1.1rem",
                "&:hover": {
                  background: "#3b82f6"
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
          width: 64,
          height: 64,
          background: "#4f46e5",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
          "&:hover": {
            background: "#3b82f6",
            transform: "scale(1.05)",
            boxShadow: "0 6px 20px rgba(79,70,229,0.4)",
          },
          transition: "all 0.2s ease",
          zIndex: 1000
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
    </Box>
  );
}

export default Projects;