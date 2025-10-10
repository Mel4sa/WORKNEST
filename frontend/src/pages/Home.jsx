import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Button,
  Container,
  Grid,
  Stack
} from "@mui/material";
import axiosInstance from "../lib/axios";

function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllProjects = async () => {
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
    fetchAllProjects();
  }, []);

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}`);
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
      backgroundColor: "#f8fafc",
      py: { xs: 3, md: 5 }
    }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: "center", 
          mb: { xs: 6, md: 8 },
          px: { xs: 2, md: 0 }
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: "#64748b",
              fontWeight: "400",
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6,
              mb: 3
            }}
          >
            Hayallerinizdeki projeleri gerçeğe dönüştürün, yetenekli takım arkadaşları bulun ve birlikte başarıya ulaşın
          </Typography>

          {/* Çizgi */}
          <Box sx={{
            width: "80px",
            height: "4px",
            background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
            mx: "auto",
            mb: 4,
            borderRadius: "2px"
          }} />

          <Button
            variant="contained"
            onClick={() => navigate("/create-project")}
            sx={{
              py: 2,
              px: 6,
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
              fontSize: "1.1rem",
              fontWeight: "700",
              textTransform: "none",
              boxShadow: "0 8px 32px rgba(107, 15, 26, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #8c1c2b, #a91d2d)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 36px rgba(107, 15, 26, 0.5)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Yeni Proje Oluştur
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: "20px",
              boxShadow: "0 4px 20px rgba(220, 38, 38, 0.15)"
            }}
          >
            {error}
          </Alert>
        )}

        {/* Projeler Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: "700", 
              color: "#1e293b",
              mb: 1,
              textAlign: "center"
            }}
          >
            Aktif Projeler
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: "#64748b",
              textAlign: "center",
              mb: 5,
              fontSize: "1.1rem"
            }}
          >
            Katılabileceğiniz harika projeler keşfedin
          </Typography>
        </Box>

        {/* Projeler Grid */}
        {projects.length > 0 ? (
          <Grid container spacing={4}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} lg={4} key={project._id}>
                <Card 
                  sx={{
                    borderRadius: "24px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                      borderColor: "#6b0f1a"
                    }
                  }}
                  onClick={() => handleProjectClick(project._id)}
                >
                  <CardContent sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Proje Başlığı */}
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: "700", 
                        color: "#1e293b",
                        mb: 2,
                        fontSize: "1.3rem",
                        lineHeight: 1.3
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Proje Açıklaması */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#64748b",
                        mb: 3,
                        lineHeight: 1.6,
                        flex: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Teknolojiler */}
                    {project.tags && project.tags.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(107, 15, 26, 0.1)",
                                color: "#6b0f1a",
                                fontWeight: "600",
                                fontSize: "0.75rem"
                              }}
                            />
                          ))}
                          {project.tags.length > 3 && (
                            <Chip
                              label={`+${project.tags.length - 3}`}
                              size="small"
                              sx={{
                                backgroundColor: "#e2e8f0",
                                color: "#64748b",
                                fontWeight: "600",
                                fontSize: "0.75rem"
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Proje Sahibi ve Durum */}
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      mt: "auto"
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar 
                          src={project.owner?.profileImage}
                          sx={{ width: 40, height: 40 }}
                        >
                          {project.owner?.fullname?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b" }}>
                            {project.owner?.fullname}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Proje Lideri
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={
                          project.status === "completed" ? "Tamamlandı" :
                          project.status === "ongoing" ? "Devam Ediyor" : "Planlanıyor"
                        }
                        size="small"
                        sx={{
                          backgroundColor: 
                            project.status === "completed" ? "#dcfce7" :
                            project.status === "ongoing" ? "#fef3c7" : "#f3f4f6",
                          color: 
                            project.status === "completed" ? "#166534" :
                            project.status === "ongoing" ? "#92400e" : "#374151",
                          fontWeight: "600",
                          fontSize: "0.75rem"
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : !loading && (
          <Box sx={{ 
            textAlign: "center", 
            py: 8,
            backgroundColor: "#fff",
            borderRadius: "24px",
            border: "2px dashed #e2e8f0"
          }}>
            <Typography variant="h5" sx={{ color: "#64748b", mb: 2, fontWeight: "600" }}>
              Henüz Proje Yok
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8", mb: 4 }}>
              İlk projeyi oluşturun ve WORKNEST topluluğunu büyütmeye başlayın!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/create-project")}
              sx={{
                py: 2,
                px: 4,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                fontWeight: "600",
                "&:hover": {
                  background: "linear-gradient(135deg, #8c1c2b, #a91d2d)"
                }
              }}
            >
              İlk Projeyi Oluştur
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Home;