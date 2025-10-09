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

  // Backend'den projeleri getir
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
    <Box sx={{ padding: "30px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Başlık */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
          Projeler
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          Topluluktan projeler keşfedin ve katılın!
        </Typography>
      </Box>

      {/* Hata mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Projeler Grid */}
      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project._id}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                color: "#fff",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                },
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Proje başlığı */}
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  {project.title}
                </Typography>

                {/* Proje açıklaması */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2, 
                    opacity: 0.9,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {project.description}
                </Typography>

                {/* Etiketler */}
                <Box sx={{ mb: 2 }}>
                  {project.tags?.slice(0, 2).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        mr: 1,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "& .MuiChip-label": { fontSize: "0.75rem" }
                      }}
                    />
                  ))}
                  {project.tags?.length > 2 && (
                    <Chip
                      label={`+${project.tags.length - 2}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white"
                      }}
                    />
                  )}
                </Box>

                {/* Proje sahibi */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar 
                    src={project.owner?.profileImage} 
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {project.owner?.fullname?.[0]}
                  </Avatar>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {project.owner?.fullname}
                  </Typography>
                </Box>

                {/* Üye sayısı */}
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {project.members?.length || 0}/{project.maxMembers} üye
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", padding: "16px" }}>
                <Chip
                  label={project.status}
                  size="small"
                  sx={{
                    backgroundColor: 
                      project.status === "completed" ? "#4caf50" :
                      project.status === "ongoing" ? "#ff9800" : "#9e9e9e",
                    color: "white"
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleDetailClick(project._id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    backgroundColor: "#fff",
                    color: "#2575fc",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  Detay Gör
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Boş durum */}
      {projects.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
            Henüz proje bulunmuyor
          </Typography>
          <Typography variant="body2" sx={{ color: "#999" }}>
            İlk projeyi sen oluştur!
          </Typography>
        </Box>
      )}

      {/* Yeni Proje Oluştur FAB */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreateProject}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          backgroundColor: "#2575fc",
          "&:hover": {
            backgroundColor: "#1e5fcf",
          },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Projects;