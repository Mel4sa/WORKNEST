import React, { useState, useEffect } from "react";
import ProfileSnackbar from "../components/profile/ProfileSnackbar";
import { useNavigate } from "react-router-dom";
import { 
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Button,
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
  const [showError, setShowError] = useState(false);

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
      setShowError(true);
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
        {/* Projeler Section Title */}
        <Box sx={{ 
          mb: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 4
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: "600", 
                fontSize: { xs: "2rem", md: "2.5rem" },
                color: "#1a1a1a",
                mb: 2,
                letterSpacing: "-0.02em"
              }}
            >
              Aktif Projeler
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: "#64748b",
                fontWeight: "400",
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: 1.7,
                maxWidth: "550px"
              }}
            >
              Hayallerinizdeki projeleri gerçeğe dönüştürün, yetenekli takım arkadaşları bulun ve birlikte başarıya ulaşın
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate("/create-project")}
            sx={{
              py: 1.25,
              px: 3.5,
              borderRadius: "6px",
              backgroundColor: "#6b0f1a",
              fontSize: "0.95rem",
              fontWeight: "600",
              textTransform: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "#8c1c2b"
              }
            }}
          >
            Yeni Proje Oluştur
          </Button>
        </Box>


        <ProfileSnackbar open={showError} message={error} severity="error" onClose={() => setShowError(false)} />

        {/* Search Bar */}
        <Box sx={{ 
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

        {/* Projeler Listesi */}
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
            
            <Stack spacing={2}>
              {projects.map((project) => (
                <Box
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 3,
                    p: 3,
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#6b0f1a",
                      backgroundColor: "#fafbfc",
                      boxShadow: "0 4px 12px rgba(107, 15, 26, 0.1)"
                    }
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    src={project.owner?.profileImage}
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: "#6b0f1a",
                      flexShrink: 0,
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.05)"
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${project.owner?._id}`);
                    }}
                  >
                    {project.owner?.fullname?.[0]}
                  </Avatar>

                  {/* İçerik */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Başlık */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "700",
                        color: "#2c3e50",
                        mb: 0.5,
                        fontSize: "1.05rem"
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Sahibi */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        mb: 1,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        "&:hover": {
                          color: "#6b0f1a"
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${project.owner?._id}`);
                      }}
                    >
                      {project.owner?.fullname || "Bilinmeyen Kullanıcı"}
                    </Typography>

                    {/* Açıklama */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        mb: 1.5,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Teknolojiler */}
                    {project.tags && project.tags.length > 0 && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {project.tags.slice(0, 4).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              height: "24px",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              fontWeight: "500",
                              fontSize: "0.75rem",
                              "& .MuiChip-label": {
                                px: 1
                              }
                            }}
                          />
                        ))}
                        {project.tags.length > 4 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              alignSelf: "center",
                              fontSize: "0.75rem"
                            }}
                          >
                            +{project.tags.length - 4} daha
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Status */}
                  <Box sx={{ flexShrink: 0, textAlign: "right" }}>
                    <Chip
                      label={
                        project.status === "completed" ? "Tamamlandı" :
                        project.status === "ongoing" ? "Devam Ediyor" :
                        project.status === "planned" ? "Planlanıyor" :
                        project.status === "cancelled" ? "İptal" :
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
                </Box>
              ))}
            </Stack>
          </>
        ) : !loading && (
          <Box sx={{ 
            textAlign: "center", 
            py: 8,
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
          }}>
            <Typography variant="h6" sx={{ color: "#2c3e50", mb: 1, fontWeight: "600" }}>
              Henüz Proje Yok
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 4 }}>
              İlk projeyi oluşturun ve başlayın
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/create-project")}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: "8px",
                backgroundColor: "#6b0f1a",
                fontWeight: "600",
                "&:hover": {
                  backgroundColor: "#8c1c2b"
                }
              }}
            >
              Proje Oluştur
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Home;