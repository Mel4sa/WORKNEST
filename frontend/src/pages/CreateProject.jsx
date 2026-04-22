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
  CircularProgress,
  Autocomplete
} from "@mui/material";
import ProfileSnackbar from "../components/profile/ProfileSnackbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axiosInstance from "../lib/axios";

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: []
  });
  const [allSkills, setAllSkills] = useState([]);
  React.useEffect(() => {
    axiosInstance.get("/skills").then(res => setAllSkills(res.data)).catch(() => setAllSkills([]));
  }, []);

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData((prev) => ({ ...prev, [name]: toTitleCase(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Proje başlığı ve açıklaması gereklidir.");
      setShowError(true);
      return;
    }
    if (!formData.skills || formData.skills.length === 0) {
      setError("En az bir beceri eklemelisiniz.");
      setShowError(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/projects", formData);
      navigate("/projects");
    } catch (err) {
      let msg = err.response?.data?.message || "Proje oluşturulurken bir hata oluştu.";
      if (msg && msg.toLowerCase().includes("teknoloji")) {
        msg = msg.replace(/teknoloji/gi, "beceri");
      }
      setError(msg);
      setShowError(true);
      if (err.response?.data?.errors) {
        let errors = err.response.data.errors.map(e => e.replace(/teknoloji/gi, "beceri"));
        setError(errors.join(', '));
        setShowError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", py: 6, px: 2 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 6 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
            sx={{ transition: "all 0.3s ease" }}
          >
            Projeler
          </Button>

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

          <Box sx={{ width: 120 }} /> 
        </Box>

        <ProfileSnackbar open={showError} message={error} severity="error" onClose={() => setShowError(false)} />

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
            <Box sx={{ backgroundColor: "#fff", borderRadius: 3, p: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
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

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Beceriler</Typography>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={allSkills.filter(skill => !formData.skills.includes(skill))}
                    value={[]}
                    onChange={(e, newValue) => {
                      const last = newValue[newValue.length - 1];
                      if (last && !formData.skills.includes(last)) {
                        setFormData(prev => ({ ...prev, skills: [...prev.skills, last] }));
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Beceri ekle..."
                        placeholder="React, Python, Design..."
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, "&.Mui-focused fieldset": { borderColor: "#6b0f1a", borderWidth: 2 } } }}
                      />
                    )}
                  />
                  <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 2, minHeight: 80, border: "1px dashed #cbd5e1", mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.skills.length === 0 ? (
                      <Typography variant="body2" sx={{ textAlign: "center", py: 2, color: "#64748b" }}>Kullanacağınız becerileri ekleyin</Typography>
                    ) : (
                      formData.skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          color="primary"
                          onDelete={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))}
                          sx={{
                            fontSize: 13,
                            height: 28,
                            borderRadius: 1.5,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: '#6b0f1a',
                            color: '#fff',
                            fontWeight: 500,
                            border: 'none',
                            '.MuiChip-deleteIcon': { color: '#fff', fontSize: 18 },
                          }}
                        />
                      ))
                    )}
                  </Box>
                </Box>

                <Box sx={{ backgroundColor: "rgba(107,15,26,0.04)", borderRadius: 2, p: 2 }}>
                  <Typography variant="body2" sx={{ color: "#64748b", display: "flex", alignItems: "flex-start", gap: 1 }}>
                    💡 Detaylı açıklama ve doğru beceriler, projenize uygun takım üyelerini bulmanızda yardımcı olur.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ mt: 6, textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ py: 2.5, px: 6, borderRadius: 3, background: "linear-gradient(135deg,#6b0f1a,#8c1c2b)", fontSize: "1.2rem", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg,#8c1c2b,#a91d2d)" } }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Projeyi Oluştur"}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProject;