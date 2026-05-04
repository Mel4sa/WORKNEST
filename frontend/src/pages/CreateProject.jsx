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
  Autocomplete,
  Divider
} from "@mui/material";
import ProfileSnackbar from "../components/profile/ProfileSnackbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
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
    return str.replace(/\w\S*/g, (txt) => txt.charAt((0)).toUpperCase() + txt.substr(1).toLowerCase());
  }

function toTitleCaseWords(str) {
    if (!str) return "";
    return str
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  const saveSkillToDatabase = async (skillNames) => {
    try {
      const skillsToSave = Array.isArray(skillNames) ? skillNames : [skillNames];
      await Promise.all(skillsToSave.map(skill => axiosInstance.post("/skills", { name: skill })));
      const res = await axiosInstance.get("/skills");
      setAllSkills(res.data);
    } catch (err) {
      console.error("Skill could not be saved:", err);
    }
  };

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
    <Box sx={{ 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc",
      py: { xs: 3, md: 5 },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ 
          mb: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 4,
          flexWrap: "wrap"
        }}>
          <Box sx={{ flex: 1, minWidth: "200px" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/projects")}
              sx={{ 
                color: "#64748b",
                mb: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "#6b0f1a",
                  backgroundColor: "transparent"
                }
              }}
            >
              Projelere Dön
            </Button>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: "800", 
                fontSize: { xs: "2rem", md: "2.5rem" },
                color: "#1a1a1a",
                letterSpacing: "-0.02em",
                mb: 1.5
              }}
            >
              Yeni Proje Oluştur
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: "#64748b",
                fontWeight: "400",
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: 1.7,
                maxWidth: "500px"
              }}
            >
              Fikrinizi hayata geçirin, yetenekli takım arkadaşları bulun ve birlikte başarıya ulaşın
            </Typography>
          </Box>
        </Box>

        {/* Decorative Line */}
        <Box sx={{
          width: "100px",
          height: "4px",
          background: "linear-gradient(90deg, #6b0f1a, #8c1c2b)",
          mb: 5,
          borderRadius: "2px"
        }} />

        <ProfileSnackbar open={showError} message={error} severity="error" onClose={() => setShowError(false)} />

        <Box component="form" onSubmit={handleSubmit}>
          {/* Project Details Section */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "700",
                color: "#1f2937",
                fontSize: "1.1rem",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: "#6b0f1a" 
              }} />
              Proje Detayları
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                name="title"
                label="Proje Adı"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Örn: E-ticaret Web Sitesi"
                variant="outlined"
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { 
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6b0f1a"
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#6b0f1a", 
                      borderWidth: 2 
                    } 
                  },
                  "& .MuiInputLabel-root.Mui-focused": { 
                    color: "#6b0f1a",
                    fontWeight: "600"
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0"
                  }
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={5}
                name="description"
                label="Proje Açıklaması"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Projenizin amacını, hedeflerini ve nasıl çalışacağını detaylı bir şekilde açıklayın..."
                variant="outlined"
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { 
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6b0f1a"
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                      borderColor: "#6b0f1a", 
                      borderWidth: 2 
                    } 
                  },
                  "& .MuiInputLabel-root.Mui-focused": { 
                    color: "#6b0f1a",
                    fontWeight: "600"
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0"
                  }
                }}
              />
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Skills Section */}
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "700",
                color: "#1f2937",
                fontSize: "1.1rem",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                backgroundColor: "#6b0f1a" 
              }} />
              Gerekli Beceriler
            </Typography>
            
            <Autocomplete
              multiple
              freeSolo
              options={allSkills.filter(skill => !formData.skills.includes(skill))}
              value={[]}
onChange={async (e, newValue) => {
                const last = newValue[newValue.length - 1];
                if (last && !formData.skills.includes(last)) {
                  const formattedSkill = toTitleCaseWords(last);
                  if (!allSkills.includes(formattedSkill)) {
                    await saveSkillToDatabase(formattedSkill);
                  }
                  setFormData(prev => ({ ...prev, skills: [...prev.skills, formattedSkill] }));
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Beceri ekle..."
                  placeholder="React, Python, Tasarım..."
                  sx={{
                    "& .MuiOutlinedInput-root": { 
                      borderRadius: "12px",
                      backgroundColor: "#fff",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6b0f1a"
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { 
                        borderColor: "#6b0f1a", 
                        borderWidth: 2 
                      } 
                    },
                    "& .MuiInputLabel-root.Mui-focused": { 
                      color: "#6b0f1a",
                      fontWeight: "600"
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e2e8f0"
                    }
                  }}
                />
              )}
            />
            
            {/* Skills Chips Container */}
            <Box sx={{ 
              backgroundColor: "#fff", 
              borderRadius: "12px", 
              p: 2.5, 
              minHeight: 80, 
              border: "1px dashed #cbd5e1", 
              mt: 2,
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5,
              alignItems: "flex-start"
            }}>
              {formData.skills.length === 0 ? (
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  color: "#94a3b8",
                  py: 1,
                  px: 2
                }}>
                  <LightbulbIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                    Kullanacağınız becerileri ekleyin
                  </Typography>
                </Box>
              ) : (
                formData.skills.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    size="small"
                    onDelete={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))}
                    sx={{
                      fontSize: "0.875rem",
                      height: "32px",
                      borderRadius: "8px",
                      px: 1,
                      py: 0.5,
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      fontWeight: "600",
                      border: '1px solid #bae6fd',
                      '.MuiChip-deleteIcon': { 
                        color: '#0369a1',
                        fontSize: 20,
                        '&:hover': {
                          color: '#6b0f1a'
                        }
                      },
                      '&:hover': {
                        backgroundColor: '#bae6fd'
                      }
                    }}
                  />
                ))
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

{/* Tips Section */}
          <Box sx={{ 
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            backgroundColor: "#f0fdf4", 
            borderRadius: "8px", 
            p: 1.5,
            border: "1px solid #bbf7d0",
            mb: 3
          }}>
            <LightbulbIcon sx={{ color: "#16a34a", fontSize: 18, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: "#166534", fontSize: "0.85rem" }}>
              <Box component="span" sx={{ fontWeight: 700 }}>İpucu: </Box>
              Detaylı açıklama ve doğru beceriler, projenize uygun takım üyelerini bulmanızda yardımcı olur.
            </Typography>
          </Box>

          {/* Submit Button */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ 
                py: 1.8, 
                borderRadius: "30px", 
                background: "linear-gradient(135deg, #6b0f1a 0%, #8c1c2b 50%, #a91d2d 100%)", 
                fontSize: "1rem", 
                fontWeight: "600",
                textTransform: "none",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 15px rgba(107, 15, 26, 0.3)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #8c1c2b 0%, #a91d2d 50%, #c42a3d 100%)",
                  boxShadow: "0 6px 20px rgba(107, 15, 26, 0.4)",
                  transform: "translateY(-1px)"
                },
                transition: "all 0.3s ease"
              }}
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
