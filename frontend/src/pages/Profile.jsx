import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Chip,
  Stack,
  Paper,
  IconButton,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

export default function ProfilePage() {

  
  const [profilePic, setProfilePic] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setSkills(skills.filter((skill) => skill !== skillToDelete));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 3,
        backgroundColor: "#ffffff", // Sayfa arka planı beyaz
      }}
    >
      <Paper
        sx={{
          maxWidth: 900,
          margin: "0 auto",
          padding: 4,
          borderRadius: 4,
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          "&:hover": { transform: "scale(1.01)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" },
        }}
      >
        {/* Profil Üst Bilgi */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", mb: 4 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={profilePic || "/default-avatar.jpg"}
              alt="Profil Fotoğrafı"
              sx={{
                width: 120,
                height: 120,
                border: "3px solid #915d56", // Kayıt Ol butonuyla aynı renk
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            />
            <IconButton
              component="label"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#915d56",
                color: "#fff",
                "&:hover": { backgroundColor: "#7a4b45" },
              }}
            >
              <PhotoCamera />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setProfilePic(URL.createObjectURL(file));
                }}
              />
            </IconButton>
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Melisa Simsek
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "gray", mt: 0.5, fontWeight: 500 }}>
              Frontend Developer
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mt: 0.5 }}>
              EĞİTİM : Bilgisayar Mühendisliği, XYZ Üniversitesi
            </Typography>
          </Box>
        </Box>

        {/* Bio */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Biyografi
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Kendiniz hakkında kısa bir bio yazın..."
            variant="outlined"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",
                "& fieldset": { borderColor: "#915d56" },
                "&:hover fieldset": { borderColor: "#7a4b45" },
                "&.Mui-focused fieldset": { borderColor: "#7a4b45" },
              },
            }}
          />
        </Box>

        {/* Yetenekler */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Yeteneklerim
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                sx={{
                  mb: 1,
                  backgroundColor: "#915d56",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              />
            ))}
          </Stack>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <TextField
              label="Yeni Yetenek Ekle"
              variant="outlined"
              size="small"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#000",
                  "& fieldset": { borderColor: "#915d56" },
                  "&:hover fieldset": { borderColor: "#7a4b45" },
                  "&.Mui-focused fieldset": { borderColor: "#7a4b45" },
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#915d56",
                color: "#fff",
                "&:hover": { backgroundColor: "#7a4b45" },
              }}
              onClick={handleAddSkill}
            >
              Ekle
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}