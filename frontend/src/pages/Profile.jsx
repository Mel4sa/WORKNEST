import { useState} from "react";
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
} from "@mui/material";
import { School, Person, Check } from "@mui/icons-material";
import universities from "../data/universities.json";
import useAuthStore from "../store/useAuthStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState(user?.role || "Frontend Developer");

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

  const handleRoleSave = () => {
    // Opsiyonel: backend'e güncelleme isteği atabilirsiniz
    console.log("Saved role:", role);
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 8, px: 4, backgroundColor: "#fefefe" }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 5,
          borderRadius: 5,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          backgroundColor: "#fff",
        }}
      >
        {/* Profil üst kısmı */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
            mb: 5,
          }}
        >
          <Avatar
            sx={{
              width: 140,
              height: 140,
              border: "3px solid #915d56",
              bgcolor: "#915d56",
            }}
          >
            <Person sx={{ fontSize: 70, color: "#fff" }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            {/* Fullname */}
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {user?.fullname || "Kullanıcı"}
            </Typography>

            {/* Editable role/job */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
              <TextField
                placeholder="Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  maxWidth: 300,
                  "& .MuiOutlinedInput-root": {
                    fontWeight: 500,
                    color: "#333",
                    borderRadius: "16px",
                    backgroundColor: "#f5f5f5",
                    "& fieldset": { borderColor: "#ccc" },
                    "&:hover fieldset": { borderColor: "#915d56" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#915d56",
                      boxShadow: "0 0 8px rgba(145,93,86,0.3)",
                    },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleRoleSave}
                sx={{
                  bgcolor: "#915d56",
                  "&:hover": { bgcolor: "#7a4b45" },
                  color: "#fff",
                  borderRadius: "12px",
                  p: 1,
                }}
              >
                <Check />
              </IconButton>
            </Box>

            {/* Üniversite & bölüm */}
            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
              {university ? (
                <Chip
                  icon={<School />}
                  label={university}
                  onDelete={() => setUniversity("")}
                  sx={{
                    flex: 1,
                    borderRadius: "28px",
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
                    borderRadius: "28px",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: university ? "#000" : "gray",
                      pl: 2,
                    },
                    "& fieldset": { borderColor: "#915d56" },
                    "&:hover fieldset": { borderColor: "#7a4b45" },
                    "&.Mui-focused fieldset": { borderColor: "#7a4b45" },
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
                    color: "#000",
                    borderRadius: "28px",
                    "& fieldset": { borderColor: "#915d56" },
                    "&:hover fieldset": { borderColor: "#7a4b45" },
                    "&.Mui-focused fieldset": { borderColor: "#7a4b45" },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Biyografi */}
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
                borderRadius: "20px",
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
                  borderRadius: "20px",
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
                  borderRadius: "20px",
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
                borderRadius: "20px",
                "&:hover": { backgroundColor: "#7a4b45" },
              }}
              onClick={handleAddSkill}
            >
              Ekle
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}