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
} from "@mui/material";

export default function ProfilePage() {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

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
    <Box sx={{ maxWidth: 900, margin: "40px auto", padding: 3 }}>
      <Paper sx={{ padding: 4, borderRadius: 3, boxShadow: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
            marginBottom: 3,
          }}
        >
          <Avatar
            src="/path/to/profile.jpg"
            alt="Profil Fotoğrafı"
            sx={{ width: 100, height: 100 }}
          />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Melisa Simsek
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "gray", mt: 0.5 }}>
              Frontend Developer
            </Typography>
            <Typography variant="body2" sx={{ color: "gray", mt: 0.5 }}>
              EĞİTİM : Bilgisayar Mühendisliği, XYZ Üniversitesi
            </Typography>
          </Box>
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Biyografi
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Kendiniz hakkında kısa bir bio yazın..."
            variant="outlined"
          />
        </Box>

        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Yeteneklerim
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                color="primary"
                sx={{ marginBottom: 1 }}
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
            />
            <Button variant="contained" onClick={handleAddSkill}>
              Ekle
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}