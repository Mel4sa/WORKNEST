import { useState, useEffect } from "react";
import {
  GitHub,
  LinkedIn,
  CameraAlt,
  Settings,
  School,
  Person,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Chip,
  Stack,
  MenuItem,
  Select,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import universities from "../data/universities.json";
import useAuthStore from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [saveMessageOpen, setSaveMessageOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setSkills(user.skills || []);
      setBio(user.bio || "");
      setUniversity(user.university || "");
      setDepartment(user.department || "");
      setRole(user.title || "");
      setGithub(user.github || "");
      setLinkedin(user.linkedin || "");
    }
  }, [user]);

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setSkills(skills.filter((skill) => skill !== skillToDelete));
  };

  const handleSaveProfile = async () => {
    const profileData = {
      university,
      department,
      title: role,
      skills,
      bio,
      github,
      linkedin,
    };
    try {
      const res = await axiosInstance.put("/user/update", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setSaveMessageOpen(true);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err.response?.data || err.message);
    }
  };

  const isProfileChanged =
    bio !== (user?.bio || "") ||
    university !== (user?.university || "") ||
    department !== (user?.department || "") ||
    role !== (user?.title || "") ||
    github !== (user?.github || "") ||
    linkedin !== (user?.linkedin || "") ||
    skills.join(",") !== (user?.skills || []).join(",");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 8,
        px: 4,
        backgroundColor: "#fafafa",
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 5,
          borderRadius: "50px", // 🔸 Daha yuvarlak kenarlık
          boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          position: "relative",
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            color: "#003fd3ff",
          }}
        >
          <Settings fontSize="large" />
        </IconButton>

        {/* Profil Üst Kısmı */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
            mb: 5,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 140,
              height: 140,
              borderRadius: "50%",
              overflow: "hidden",
              "&:hover .cameraOverlay": { opacity: 1 },
              cursor: "pointer",
            }}
          >
            <Avatar
              sx={{
                width: "100%",
                height: "100%",
                border: "3px solid #003fd3ff",
                bgcolor: "#003fd3ff",
              }}
            >
              <Person sx={{ fontSize: 70, color: "#fff" }} />
            </Avatar>
            <Box
              className="cameraOverlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.3s",
              }}
            >
              <CameraAlt sx={{ color: "#fff", fontSize: 40 }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {user?.fullname || "Kullanıcı"}
            </Typography>

            <Box
              sx={{
                mt: 1.5,
                borderBottom: "2px dotted #003fd3ff",
                display: "inline-block",
                minWidth: 220,
                pb: 0.5,
              }}
            >
              <input
                type="text"
                placeholder="Title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "#333",
                  fontFamily: "inherit",
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              {university ? (
                <Chip
                  icon={<School />}
                  label={university}
                  onDelete={() => setUniversity("")}
                  sx={{
                    flex: 1,
                    borderRadius: "50px",
                    backgroundColor: "#f5f5f5",
                    color: "#333",
                    fontWeight: 600,
                    height: 50,
                  }}
                />
              ) : (
                <Select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  displayEmpty
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    height: 50,
                    borderRadius: "50px",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: university ? "#000" : "gray",
                      pl: 2,
                    },
                    "& fieldset": { borderColor: "#003fd3ff" },
                  }}
                >
                  <MenuItem value="" disabled>
                    Üniversite
                  </MenuItem>
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>
                      {uni}
                    </MenuItem>
                  ))}
                </Select>
              )}
              <TextField
                placeholder="Bölüm"
                variant="outlined"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                sx={{
                  flex: 1,
                  height: 50,
                  "& .MuiOutlinedInput-root": {
                    height: 50,
                    borderRadius: "50px",
                    "& fieldset": { borderColor: "#003fd3ff" },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Biyografi */}
        <Box sx={{ mb: 3 }}>
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
                borderRadius: "50px", // 🔸 Sosyal bağlantılarla aynı
                "& fieldset": { borderColor: "#003fd3ff" },
              },
            }}
          />
        </Box>

        {/* Sosyal Bağlantılar */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Sosyal Bağlantılar
          </Typography>
          <Stack spacing={2}>
            <TextField
              placeholder="https://github.com/kullanici"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHub sx={{ color: "#333" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& fieldset": { borderColor: "#003fd3ff" },
                borderRadius: "50px",
              }}
            />
            <TextField
              placeholder="https://linkedin.com/in/kullanici"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkedIn sx={{ color: "#0A66C2" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& fieldset": { borderColor: "#003fd3ff" },
                borderRadius: "50px",
              }}
            />
          </Stack>
        </Box>

        {/* Yetenekler */}
        <Box>
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
                  borderRadius: "50px",
                  backgroundColor: "#003fd3ff",
                  color: "#fff",
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
                  borderRadius: "50px",
                  "& fieldset": { borderColor: "#003fd3ff" },
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#003fd3ff",
                borderRadius: "50px",
                "&:hover": { backgroundColor: "#002fa0" },
              }}
              onClick={handleAddSkill}
            >
              Ekle
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: isProfileChanged ? "#003fd3ff" : "#ccc",
                borderRadius: "50px",
                px: 4,
                py: 1,
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: isProfileChanged ? "#002fa0" : "#ccc",
                },
              }}
              disabled={!isProfileChanged}
              onClick={handleSaveProfile}
            >
              Profili Kaydet
            </Button>
          </Box>
        </Box>

        <Snackbar
          open={saveMessageOpen}
          autoHideDuration={3000}
          onClose={() => setSaveMessageOpen(false)}
        >
          <Alert severity="success">Profil başarıyla güncellendi!</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}