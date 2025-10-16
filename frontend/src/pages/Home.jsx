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
  Stack,
  TextField,
  InputAdornment
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from "../lib/axios";

function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]); // Tüm projeler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/projects");
      const projectsData = response.data.projects;
      setAllProjects(projectsData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Projeler yüklenemedi:", err);
      setError("Projeler yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Arama fonksiyonu
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setProjects(allProjects);
      return;
    }

    const filteredProjects = allProjects.filter(project =>
      project.title.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase()) ||
      (project.tags && project.tags.some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )) ||
      project.owner?.fullname.toLowerCase().includes(query.toLowerCase())
    );
    
    setProjects(filteredProjects);
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
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: "center", 
          mb: { xs: 6, md: 8 },
          px: { xs: 2, md: 0 }
        }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: "800", 
              color: "#1a1a1a",
              fontSize: { xs: "2.5rem", md: "4rem" },
              mb: 3,
              letterSpacing: "-0.02em"
            }}
          >
            <Box component="span" sx={{ 
              background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              WORKNEST
            </Box>
          </Typography>
          
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
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: "800", 
              fontSize: { xs: "2rem", md: "2.8rem" },
              mb: 2,
              letterSpacing: "-0.02em"
            }}
          >
            <Box component="span" sx={{ color: "#1e293b" }}>
              Aktif{" "}
            </Box>
            <Box component="span" sx={{ 
              background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Projeler
            </Box>
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#64748b",
              fontWeight: "400",
              fontSize: { xs: "1rem", md: "1.2rem" },
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
              mb: 4
            }}
          >
            Katılabileceğiniz harika projeler keşfedin ve hayalinizdeki takımı bulun
          </Typography>

          {/* Search Bar */}
          <Box sx={{ 
            maxWidth: "500px", 
            mx: "auto", 
            mb: 6 
          }}>
            <TextField
              fullWidth
              placeholder="Proje ara... (başlık, açıklama, teknoloji veya kişi)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  backgroundColor: "#fff",
                  fontSize: "1rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  "&:hover": {
                    borderColor: "#6b0f1a",
                    boxShadow: "0 6px 24px rgba(107, 15, 26, 0.15)"
                  },
                  "&.Mui-focused": {
                    borderColor: "#6b0f1a",
                    borderWidth: "2px",
                    boxShadow: "0 8px 32px rgba(107, 15, 26, 0.2)"
                  }
                },
                "& .MuiOutlinedInput-input": {
                  py: 2
                }
              }}
            />
          </Box>
        </Box>

        {/* Projeler Grid */}
        {projects.length > 0 ? (
          <>
            {/* Arama sonucu bilgisi */}
            {searchQuery && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "#64748b" }}>
                  "{searchQuery}" için {projects.length} proje bulundu
                </Typography>
              </Box>
            )}
            
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { 
                xs: "1fr", 
                sm: "repeat(2, 1fr)", 
                md: "repeat(4, 1fr)" 
              },
              gap: 3,
              justifyContent: "center"
            }}>
              {projects.map((project) => (
                <Box key={project._id} sx={{ display: "flex", justifyContent: "center" }}>
                <Card 
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(226, 232, 240, 0.8)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    height: "400px", // Sabit yükseklik
                    minHeight: "400px",
                    maxHeight: "400px",
                    width: "100%",
                    maxWidth: "280px", // Maksimum genişlik
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                      borderColor: "#6b0f1a"
                    }
                  }}
                  onClick={() => handleProjectClick(project._id)}
                >
                  <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Proje Başlığı */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: "700", 
                        color: "#1e293b",
                        mb: 2,
                        fontSize: "1.2rem",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        height: "62px", // Sabit yükseklik (2 satır için)
                        minHeight: "62px"
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Proje Açıklaması */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#64748b",
                        mb: 2,
                        lineHeight: 1.5,
                        fontSize: "0.9rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        height: "65px", // Sabit yükseklik (3 satır için)
                        minHeight: "65px"
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Teknolojiler */}
                    <Box sx={{ mb: 2, height: "40px", minHeight: "40px" }}>
                      {project.tags && project.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
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
                      )}
                    </Box>

                    {/* Proje Sahibi ve Durum */}
                    <Box sx={{ mt: "auto" }}>
                      {/* Proje Durumu */}
                      <Box sx={{ 
                        display: "flex", 
                        justifyContent: "flex-end", 
                        mb: 2 
                      }}>
                        <Chip
                          label={
                            project.status === "completed" ? "Tamamlandı" :
                            project.status === "ongoing" ? "Devam Ediyor" :
                            project.status === "planned" ? "Planlanıyor" :
                            project.status === "cancelled" ? "İptal Edildi" :
                            project.status === "on_hold" ? "Beklemede" :
                            "Planlanıyor"
                          }
                          size="small"
                          sx={{
                            backgroundColor: 
                              project.status === "completed" ? "#dcfce7" :
                              project.status === "ongoing" ? "#fef3c7" :
                              project.status === "planned" ? "#dbeafe" :
                              project.status === "cancelled" ? "#fecaca" :
                              project.status === "on_hold" ? "#f3f4f6" :
                              "#f3f4f6",
                            color: 
                              project.status === "completed" ? "#166534" :
                              project.status === "ongoing" ? "#92400e" :
                              project.status === "planned" ? "#1e40af" :
                              project.status === "cancelled" ? "#dc2626" :
                              project.status === "on_hold" ? "#374151" :
                              "#374151",
                            fontWeight: "600",
                            fontSize: "0.75rem"
                          }}
                        />
                      </Box>

                      {/* Proje Sahibi */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar 
                          src={project.owner?.profileImage}
                          sx={{ 
                            width: 36, 
                            height: 36,
                            cursor: "pointer",
                            "&:hover": {
                              transform: "scale(1.1)",
                              boxShadow: "0 4px 12px rgba(107, 15, 26, 0.3)"
                            },
                            transition: "all 0.2s ease"
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/${project.owner?._id}`);
                          }}
                        >
                          {project.owner?.fullname?.[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: "600", 
                              color: "#1e293b",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              "&:hover": {
                                color: "#6b0f1a",
                                textDecoration: "underline"
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/user/${project.owner?._id}`);
                            }}
                          >
                            {project.owner?.fullname}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                            Proje Lideri
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
            </Box>
          </>
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
      </Box>
    </Box>
  );
}

export default Home;