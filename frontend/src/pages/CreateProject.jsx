import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
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
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Proje oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", py: 6, px: 2 }}>
      <Container maxWidth="lg">
        {/* Üst Kısım */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
            sx={{
              color: "#6b0f1a",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              border: "2px solid transparent",
              "&:hover": {
                backgroundColor: "rgba(107,15,26,0.05)",
                border: "2px solid #6b0f1a",
                transform: "translateX(-4px)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Projeler
          </Button>

          {/* Fikrini Hayata Geçir */}
          <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "3rem" }, textAlign: "center", flex: 1 }}>
            Fikrini Hayata <br />
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg,#6b0f1a,#8c1c2b)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Geçir
            </Box>
          </Typography>

          <Box sx={{ width: 120 }} /> {/* Sağ boşluk için */}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
            {/* Sol: Proje Detayları */}
            <Box sx={{ flex: 1, backgroundColor: "#fff", borderRadius: 3, p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Proje Detayları</Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  name="title"
                  label="Proje Adı"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Örn: E-ticaret Web Sitesi"
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#6b0f1a", borderWidth: 2 } },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#6b0f1a" }
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
                  placeholder="Projenizin amacını, hedeflerini ve nasıl çalışacağını detaylı bir şekilde açıklayın..."
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#6b0f1a", borderWidth: 2 } },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#6b0f1a" }
                  }}
                />

                {/* Tag Input */}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Teknolojiler</Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="React, Python, Design..."
                      onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#6b0f1a", borderWidth: 2 } } }}
                    />
                    <Button
                      onClick={handleAddTag}
                      variant="contained"
                      sx={{ borderRadius: 2, px: 3, background: "linear-gradient(135deg,#6b0f1a,#8c1c2b)", "&:hover": { background: "linear-gradient(135deg,#8c1c2b,#a91d2d)" } }}
                    >
                      Ekle
                    </Button>
                  </Box>

                  <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 2, minHeight: 80, border: "1px dashed #cbd5e1" }}>
                    {formData.tags.length > 0 ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {formData.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} onDelete={() => handleRemoveTag(tag)} sx={{ background: "linear-gradient(135deg,#6b0f1a,#8c1c2b)", color: "#fff" }} />
                        ))}
                      </Box>
                    ) : <Typography variant="body2" sx={{ textAlign: "center", py: 2, color: "#64748b" }}>Kullanacağınız teknolojileri ekleyin</Typography>}
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Sağ: Proje Ayarları */}
            <Box sx={{ flex: 1, backgroundColor: "#fff", borderRadius: 3, p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>Proje Ayarları</Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  type="number"
                  name="maxMembers"
                  label="Maksimum Üye Sayısı"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  inputProps={{ min: 1, max: 50 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#6b0f1a", borderWidth: 2 } }, "& .MuiInputLabel-root.Mui-focused": { color: "#6b0f1a" } }}
                />

                <FormControl fullWidth>
                  <InputLabel>Proje Durumu</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Proje Durumu"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="planned">Planlanıyor</MenuItem>
                    <MenuItem value="ongoing">Devam Ediyor</MenuItem>
                    <MenuItem value="completed">Tamamlandı</MenuItem>
                    <MenuItem value="on_hold">Beklemede</MenuItem>
                    <MenuItem value="cancelled">İptal Edildi</MenuItem>
                    <MenuItem value="archived">Arşivlendi</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ backgroundColor: "rgba(107,15,26,0.04)", borderRadius: 2, p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#64748b", display: "flex", alignItems: "flex-start", gap: 1 }}>
                    💡 Detaylı açıklama ve doğru teknolojiler, projenize uygun takım üyelerini bulmanızda yardımcı olur.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Alt Buton */}
          <Box sx={{ mt: 6, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ py: 2.5, px: 6, borderRadius: 3, background: "linear-gradient(135deg,#6b0f1a,#8c1c2b)", fontSize: "1.2rem", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg,#8c1c2b,#a91d2d)" } }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "🚀 Projeyi Oluştur"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProject;