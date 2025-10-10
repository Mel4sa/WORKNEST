import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Container,
  Stack
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axiosInstance from "../lib/axios";

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
    maxMembers: 5,
    status: "planned"
  });
  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Proje başlığı ve açıklaması gereklidir.");
      return;
    }

    if (!formData.tags || formData.tags.length === 0) {
      setError("En az bir teknoloji eklemelisiniz.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/projects", formData);
      navigate("/projects");
    } catch (error) {
      console.error("Proje oluşturma hatası:", error);
      setError(error.response?.data?.message || "Proje oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 5 }}>
          {/* Geri Dön Butonu */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
            sx={{
              mb: 4,
              color: "#6b0f1a",
              textTransform: "none",
              fontWeight: "600",
              borderRadius: "16px",
              px: 4,
              py: 1.5,
              border: "2px solid transparent",
              "&:hover": {
                backgroundColor: "rgba(107, 15, 26, 0.05)",
                border: "2px solid #6b0f1a",
                transform: "translateX(-4px)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Projeler
          </Button>

          {/* Ana Başlık - Temiz ve Basit */}
          <Box sx={{ 
            textAlign: "center", 
            mb: 6,
            px: { xs: 2, md: 0 }
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: "800", 
                color: "#1a1a1a",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                mb: 2,
                letterSpacing: "-0.02em"
              }}
            >
              Fikrini Hayata
              <br />
              <Box component="span" sx={{ 
                background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Geçir
              </Box>
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#64748b",
                fontWeight: "400",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6
              }}
            >
              WORKNEST platformunda proje oluştur, ekibini bul ve birlikte başarıya ulaş
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              backgroundColor: "rgba(254, 242, 242, 0.8)"
            }}
          >
            {error}
          </Alert>
        )}

        {/* Main Form - Eşit İki Sütunlu Layout */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            
            {/* Sol Taraf - Proje Bilgileri */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: "700", 
                  color: "#1e293b",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2
                }}>
                  ✏️ Proje Detayları
                </Typography>

                <Stack spacing={4}>
                    <TextField
                      fullWidth
                      name="title"
                      label="Proje Adı"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Örn: E-ticaret Web Sitesi"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          fontSize: "1.1rem",
                          "&.Mui-focused fieldset": {
                            borderColor: "#6b0f1a",
                            borderWidth: "2px"
                          }
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#6b0f1a"
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      multiline
                      rows={{ xs: 6, md: 8 }}
                      name="description"
                      label="Proje Açıklaması"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Projenizin amacını, hedeflerini ve nasıl çalışacağını detaylı bir şekilde açıklayın. Ne tür bir çözüm sunacak? Hangi problemi çözecek?"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          fontSize: "1rem",
                          lineHeight: 1.6,
                          "&.Mui-focused fieldset": {
                            borderColor: "#6b0f1a",
                            borderWidth: "2px"
                          }
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#6b0f1a"
                        }
                      }}
                    />

                    {/* Teknolojiler Kısmı */}
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: "600", 
                        color: "#1e293b", 
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 2
                      }}>
                        🛠️ Teknolojiler <span style={{ color: "#ef4444" }}>*</span>
                      </Typography>

                      <Box sx={{ display: "flex", gap: 3, mb: 4, flexDirection: { xs: "column", sm: "row" } }}>
                        <TextField
                          fullWidth
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="React, Python, Design, Marketing..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "16px",
                              fontSize: "1rem",
                              "&.Mui-focused fieldset": {
                                borderColor: "#6b0f1a",
                                borderWidth: "2px"
                              }
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddTag}
                          variant="contained"
                          sx={{
                            borderRadius: "16px",
                            px: { xs: 6, sm: 4 },
                            py: { xs: 2, sm: 1.5 },
                            background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                            minWidth: { xs: "auto", sm: "120px" },
                            fontWeight: "600",
                            fontSize: "1rem",
                            boxShadow: "0 4px 16px rgba(107, 15, 26, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #8c1c2b, #a91d2d)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 24px rgba(107, 15, 26, 0.4)"
                            }
                          }}
                        >
                          + Ekle
                        </Button>
                      </Box>

                      <Box sx={{
                        backgroundColor: "rgba(248, 250, 252, 0.8)",
                        borderRadius: "20px",
                        p: 4,
                        minHeight: "140px",
                        border: "2px dashed #cbd5e1",
                        display: "flex",
                        flexDirection: "column"
                      }}>
                        {formData.tags.length > 0 ? (
                          <>
                            <Typography variant="body2" sx={{ 
                              color: "#6b0f1a", 
                              fontWeight: "600", 
                              mb: 3,
                              display: "flex",
                              alignItems: "center",
                              gap: 1
                            }}>
                              🎯 Seçilen Teknolojiler ({formData.tags.length})
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                              {formData.tags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  onDelete={() => handleRemoveTag(tag)}
                                  sx={{
                                    background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                                    color: "white",
                                    fontWeight: "600",
                                    borderRadius: "12px",
                                    fontSize: "0.9rem",
                                    px: 1,
                                    py: 0.5,
                                    "& .MuiChip-deleteIcon": {
                                      color: "rgba(255,255,255,0.8)",
                                      "&:hover": {
                                        color: "white"
                                      }
                                    },
                                    "&:hover": {
                                      transform: "translateY(-1px)",
                                      boxShadow: "0 4px 12px rgba(107, 15, 26, 0.3)"
                                    },
                                    transition: "all 0.2s ease"
                                  }}
                                />
                              ))}
                            </Box>
                          </>
                        ) : (
                          <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            textAlign: "center"
                          }}>
                            <Box sx={{
                              width: 64,
                              height: 64,
                              borderRadius: "50%",
                              backgroundColor: "rgba(107, 15, 26, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 3,
                              fontSize: "1.5rem"
                            }}>
                              🛠️
                            </Box>
                            <Typography variant="h6" sx={{ color: "#6b0f1a", mb: 1, fontWeight: "600" }}>
                              Teknolojiler Ekleyin
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              Projenizde kullanacağınız teknolojileri yukarıdan ekleyin
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
            </Grid>

            {/* Sağ Taraf - Ayarlar */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: "700", 
                  color: "#1e293b",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2
                }}>
                  ⚙️ Proje Ayarları
                </Typography>

                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        type="number"
                        name="maxMembers"
                        label="Maksimum Üye Sayısı"
                        value={formData.maxMembers}
                        onChange={handleInputChange}
                        inputProps={{ min: 1, max: 50 }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "16px",
                            fontSize: "1rem",
                            "&.Mui-focused fieldset": {
                              borderColor: "#6b0f1a",
                              borderWidth: "2px"
                            }
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#6b0f1a"
                          }
                        }}
                      />

                      <FormControl fullWidth>
                        <InputLabel>Proje Durumu</InputLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          label="Proje Durumu"
                          sx={{
                            borderRadius: "16px",
                            fontSize: "1rem",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#6b0f1a",
                              borderWidth: "2px"
                            }
                          }}
                        >
                          <MenuItem value="planned">🔮 Planlanıyor</MenuItem>
                          <MenuItem value="ongoing">⚡ Devam Ediyor</MenuItem>
                          <MenuItem value="completed">✅ Tamamlandı</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
              </Box>
            </Grid>
          </Grid>
          
          {/* Proje Oluştur Butonu - En Altta */}
          <Box sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{
                py: 3,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                fontSize: "1.2rem",
                fontWeight: "700",
                textTransform: "none",
                boxShadow: "0 8px 32px rgba(107, 15, 26, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #8c1c2b, #a91d2d)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 36px rgba(107, 15, 26, 0.5)"
                },
                "&:disabled": {
                  background: "#e2e8f0",
                  color: "#94a3b8"
                },
                transition: "all 0.3s ease"
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                  Oluşturuluyor...
                </Box>
              ) : (
                <>
                  🚀 Projeyi Oluştur
                </>
              )}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProject;
