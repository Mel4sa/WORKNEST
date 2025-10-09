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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
          sx={{ mb: 2 }}
        >
          Projelere Dön
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333", mb: 1 }}>
          Yeni Proje Oluştur
        </Typography>
        <Typography variant="body1" sx={{ color: "#666" }}>
          Harika bir proje fikrin var mı? Topluluğa paylaş!
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Proje Başlığı */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proje Başlığı"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Projenin ismini girin..."
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>

              {/* Proje Açıklaması */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Proje Açıklaması"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Projen hakkında detaylı bilgi ver..."
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>

              {/* Etiketler */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Etiketler
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    label="Etiket Ekle"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="React, Node.js, vb."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddTag}
                    sx={{ px: 3 }}
                  >
                    Ekle
                  </Button>
                </Stack>
                
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Maksimum Üye Sayısı ve Durum */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maksimum Üye Sayısı"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, max: 50 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Proje Durumu</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Proje Durumu"
                    onChange={handleInputChange}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="planned">Planlandı</MenuItem>
                    <MenuItem value="ongoing">Devam Ediyor</MenuItem>
                    <MenuItem value="completed">Tamamlandı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    width: "100%",
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5a0fb1 0%, #1e5fcf 100%)",
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Proje Oluştur"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateProject;
