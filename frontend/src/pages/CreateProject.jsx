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
      backgroundColor: "#ffffff",
      py: 3
    }}>
      <Container maxWidth="lg">
        {/* Header Card */}
        <Card sx={{
          mb: 3,
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/projects")}
                  sx={{
                    color: "#6366f1",
                    textTransform: "none",
                    fontWeight: "600",
                    "&:hover": { backgroundColor: "#eef2ff" }
                  }}
                >
                  Projeler
                </Button>
                <Box>
                  <Typography variant="h4" sx={{
                    fontWeight: "800",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1
                  }}>
                    Yeni Proje Oluştur
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#64748b" }}>
                    Fikrini hayata geçir, ekibini oluştur 🚀
                  </Typography>
                </Box>
              </Box>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem"
              }}>
                💡
              </Box>
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)"
            }}
          >
            {error}
          </Alert>
        )}

        {/* Main Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Step 1 - Basic Info */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                height: "100%"
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold"
                    }}>
                      1
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "700", color: "#1f2937" }}>
                      Proje Bilgileri
                    </Typography>
                  </Box>

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
                        backgroundColor: "#f8fafc",
                        "&.Mui-focused fieldset": {
                          borderColor: "#10b981",
                          borderWidth: "2px"
                        }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    name="description"
                    label="Proje Açıklaması"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Projenizin amacını, hedeflerini ve nasıl çalışacağını detaylı bir şekilde açıklayın..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        "&.Mui-focused fieldset": {
                          borderColor: "#10b981",
                          borderWidth: "2px"
                        }
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Step 2 - Technologies */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                height: "100%"
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold"
                    }}>
                      2
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "700", color: "#1f2937" }}>
                      Teknolojiler <span style={{ color: "#ef4444" }}>*</span>
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
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
                          backgroundColor: "#fef3c7",
                          "&.Mui-focused fieldset": {
                            borderColor: "#f59e0b",
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
                        px: 3,
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #d97706, #b45309)"
                        }
                      }}
                    >
                      +
                    </Button>
                  </Box>

                  <Box sx={{
                    backgroundColor: "#fef3c7",
                    borderRadius: "16px",
                    p: 3,
                    minHeight: "160px",
                    border: "2px dashed #f59e0b",
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
                              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
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
                        <Typography variant="h6" sx={{ color: "#92400e", mb: 1 }}>
                          🛠️ Teknolojiler Ekleyin (Zorunlu)
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#a16207" }}>
                          En az bir teknoloji eklemelisiniz: React, Python, Design, Marketing vb.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Step 3 - Settings & Action */}
            <Grid item xs={12}>
              <Card sx={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold"
                    }}>
                      3
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "700", color: "#1f2937" }}>
                      Son Ayarlar
                    </Typography>
                  </Box>

                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        name="maxMembers"
                        label="Takım Boyutu"
                        value={formData.maxMembers}
                        onChange={handleInputChange}
                        inputProps={{ min: 1, max: 50 }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "#faf5ff",
                            "&.Mui-focused fieldset": {
                              borderColor: "#8b5cf6",
                              borderWidth: "2px"
                            }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Proje Durumu</InputLabel>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          label="Proje Durumu"
                          sx={{
                            borderRadius: "12px",
                            backgroundColor: "#faf5ff",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#8b5cf6",
                              borderWidth: "2px"
                            }
                          }}
                        >
                          <MenuItem value="planned">🔮 Planlanıyor</MenuItem>
                          <MenuItem value="ongoing">⚡ Devam Ediyor</MenuItem>
                          <MenuItem value="completed">✅ Tamamlandı</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          sx={{
                            py: 2,
                            px: 6,
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            textTransform: "none",
                            boxShadow: "0 8px 25px rgba(99, 102, 241, 0.3)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 12px 35px rgba(99, 102, 241, 0.4)"
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

                      </Box>
                    </Grid>
                  </Grid>
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
