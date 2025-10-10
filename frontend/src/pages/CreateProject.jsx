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
      backgroundColor: "#fafbfc",
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          {/* Geri Dön Butonu */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
            sx={{
              mb: 3,
              color: "#6b0f1a",
              textTransform: "none",
              fontWeight: "600",
              borderRadius: "12px",
              px: 3,
              py: 1,
              "&:hover": {
                backgroundColor: "rgba(107, 15, 26, 0.04)",
                transform: "translateX(-4px)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Projeler
          </Button>

          {/* Ana Başlık */}
          <Box sx={{ 
            textAlign: "center", 
            mb: 4,
            px: { xs: 2, md: 0 }
          }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: "bold", 
                color: "#6b0f1a",
                fontSize: { xs: "2rem", md: "3rem" },
                mb: 2
              }}
            >
              Yeni Proje Oluştur
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#666",
                fontWeight: "300",
                fontSize: { xs: "1rem", md: "1.2rem" }
              }}
            >
              Fikrini hayata geçir, ekibini oluştur 🚀
            </Typography>
            
            {/* Decorative Line */}
            <Box sx={{
              width: "100px",
              height: "4px",
              background: "linear-gradient(90deg, #6b0f1a, #8c1c2b)",
              mx: "auto",
              mt: 3,
              borderRadius: "2px"
            }} />
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            {error}
          </Alert>
        )}

        {/* Main Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            
            {/* Proje Bilgileri Card */}
            <Grid item xs={12} lg={8}>
              <Card sx={{
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                mb: { xs: 3, lg: 0 }
              }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: "700", 
                    color: "#6b0f1a", 
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                  }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#6b0f1a",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: "bold"
                    }}>
                      1
                    </Box>
                    Proje Bilgileri
                  </Typography>

                  <TextField
                    fullWidth
                    name="title"
                    label="Proje Adı"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
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
                    rows={{ xs: 4, md: 6 }}
                    name="description"
                    label="Proje Açıklaması"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Projenizin amacını, hedeflerini ve nasıl çalışacağını detaylı bir şekilde açıklayın..."
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
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
                  <Typography variant="h6" sx={{ 
                    fontWeight: "600", 
                    color: "#6b0f1a", 
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                  }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#6b0f1a",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: "bold"
                    }}>
                      2
                    </Box>
                    Teknolojiler <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
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
                          borderRadius: "12px",
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
                        borderRadius: "12px",
                        px: { xs: 4, sm: 3 },
                        py: { xs: 1.5, sm: 1 },
                        background: "#6b0f1a",
                        minWidth: { xs: "auto", sm: "80px" },
                        "&:hover": {
                          background: "#8c1c2b"
                        }
                      }}
                    >
                      Ekle
                    </Button>
                  </Box>

                  <Box sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "16px",
                    p: 3,
                    minHeight: "120px",
                    border: "2px dashed #6b0f1a",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    {formData.tags.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {formData.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            onDelete={() => handleRemoveTag(tag)}
                            sx={{
                              background: "#6b0f1a",
                              color: "white",
                              fontWeight: "600",
                              borderRadius: "8px",
                              "& .MuiChip-deleteIcon": {
                                color: "white"
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        textAlign: "center"
                      }}>
                        <Typography variant="h6" sx={{ color: "#6b0f1a", mb: 1 }}>
                          🛠️ Teknolojiler Ekleyin
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          En az bir teknoloji eklemelisiniz
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Ayarlar ve Oluştur Card */}
            <Grid item xs={12} lg={4}>
              <Card sx={{
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                height: "fit-content",
                position: { lg: "sticky" },
                top: { lg: "20px" }
              }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: "700", 
                    color: "#6b0f1a", 
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                  }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#6b0f1a",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      fontWeight: "bold"
                    }}>
                      3
                    </Box>
                    Ayarlar
                  </Typography>

                  <TextField
                    fullWidth
                    type="number"
                    name="maxMembers"
                    label="Maksimum Üye Sayısı"
                    value={formData.maxMembers}
                    onChange={handleInputChange}
                    inputProps={{ min: 1, max: 50 }}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
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

                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel>Proje Durumu</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Proje Durumu"
                      sx={{
                        borderRadius: "12px",
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

                  {/* Oluştur Butonu */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth
                    sx={{
                      py: 2,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      textTransform: "none",
                      boxShadow: "0 8px 25px rgba(107, 15, 26, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #8c1c2b, #a91d2d)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 35px rgba(107, 15, 26, 0.4)"
                      },
                      "&:disabled": {
                        background: "#ccc"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <CircularProgress size={20} sx={{ color: "#fff" }} />
                        Oluşturuluyor...
                      </Box>
                    ) : (
                      "🚀 Projeyi Oluştur"
                    )}
                  </Button>

                  {/* Bilgi Kutusu */}
                  <Box sx={{
                    mt: 3,
                    p: 3,
                    backgroundColor: "rgba(107, 15, 26, 0.04)",
                    borderRadius: "12px",
                    border: "1px solid rgba(107, 15, 26, 0.1)"
                  }}>
                    <Typography variant="body2" sx={{ color: "#6b0f1a", fontWeight: "500", mb: 1 }}>
                      💡 İpucu
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", fontSize: "0.875rem" }}>
                      Detaylı açıklama ve doğru teknolojiler, projenize uygun takım üyelerini bulmanızda yardımcı olur.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProject;
