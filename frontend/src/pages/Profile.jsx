import { useState } from "react";
import { GitHub, LinkedIn, CameraAlt } from "@mui/icons-material";

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
  Dialog,
  Divider,
  InputAdornment,
} from "@mui/material";
import { School, Person, Settings } from "@mui/icons-material";
import universities from "../data/universities.json";
import useAuthStore from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  // Profil state
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [role, setRole] = useState(user?.title || "");
  const [github, setGithub] = useState(user?.github || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");

  // Ayarlar popup state
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("username");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Yetenek ekleme
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

  // Profil kaydetme
  const handleSaveProfile = async () => {
    const { token, setUser } = useAuthStore.getState();
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
      console.log("Profil güncellendi:", res.data);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err.response?.data || err.message);
    }
  };

  // Ayarlar fonksiyonları
  const handleChangePassword = () => console.log("Yeni şifre:", newPassword);
  const handleChangeUsername = () => console.log("Yeni kullanıcı adı:", newUsername);
  const handleChangeEmail = () => console.log("Yeni email:", newEmail);
  const handleDeleteAccount = () => console.log("Hesap silme isteği");

  // Profil fotoğrafını değiştirme
  const handleChangeProfilePhoto = () => {
    console.log("Profil fotoğrafını değiştir");
    // Buraya file picker veya modal açma fonksiyonunu ekleyebilirsin
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 8, px: 4, backgroundColor: "#fafafa" }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 5,
          borderRadius: 5,
          boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          position: "relative",
        }}
      >
        {/* ⚙️ Ayarlar ikonu */}
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            color: "#d35400",
            "&:hover": { color: "#a84300" },
          }}
        >
          <Settings fontSize="large" />
        </IconButton>

        {/* Profil üst kısmı */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", mb: 5 }}>
          
          {/* Avatar ve Kamera Overlay */}
          <Box
  sx={{
    position: "relative",
    width: 140,
    height: 140,
    borderRadius: "50%",
    overflow: "hidden", // daireyi tamamen keser ve overlay tam oturur
    "&:hover .cameraOverlay": { opacity: 1 },
    cursor: "pointer",
  }}
  onClick={handleChangeProfilePhoto}
>
  <Avatar
    sx={{
      width: "100%",
      height: "100%",
      border: "3px solid #d35400",
      bgcolor: "#d35400",
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

            {/* Role / Title */}
            <Box sx={{ mt: 1.5, borderBottom: "2px dotted #d35400", display: "inline-block", minWidth: "220px", pb: 0.5 }}>
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
                  textAlign: "left",
                }}
              />
            </Box>

            {/* Üniversite & Bölüm */}
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
                    "& fieldset": { borderColor: "#d35400" },
                  }}
                >
                  <MenuItem value="" disabled>Üniversite</MenuItem>
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
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
                    borderRadius: "28px",
                    "& fieldset": { borderColor: "#d35400" },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Biyografi */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Biyografi</Typography>
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
                borderRadius: "20px",
                "& fieldset": { borderColor: "#d35400" },
              },
            }}
          />
        </Box>

        {/* Sosyal Linkler */}
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
        "& fieldset": { borderColor: "#d35400" },
        borderRadius: "20px",
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
        "& fieldset": { borderColor: "#d35400" },
        borderRadius: "20px",
      }}
    />
  </Stack>
</Box>

        {/* Yetenekler */}
        <Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Yeteneklerim</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                sx={{ mb: 1, borderRadius: "20px", backgroundColor: "#d35400", color: "#fff" }}
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
                  borderRadius: "20px",
                  "& fieldset": { borderColor: "#d35400" },
                },
              }}
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: "#d35400", borderRadius: "20px", "&:hover": { backgroundColor: "#a84300" } }}
              onClick={handleAddSkill}
            >
              Ekle
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#d35400",
                borderRadius: "25px",
                px: 4,
                py: 1,
                fontSize: "1rem",
                "&:hover": { backgroundColor: "#a84300" },
              }}
              onClick={handleSaveProfile}
            >
              Profili Kaydet
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ⚙️ Ayarlar Popup */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 420, borderRadius: 4, p: 3, backgroundColor: "#fff" } }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center", mb: 2 }}>
          Hesap Ayarları
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Sekmeler */}
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
          {[
            { key: "username", label: "Kullanıcı Adı" },
            { key: "email", label: "E-posta" },
            { key: "password", label: "Şifre" },
            { key: "delete", label: "Sil" },
          ].map((tab) => (
            <Typography
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                fontWeight: 600,
                color: activeTab === tab.key ? "#d35400" : "#777",
                cursor: "pointer",
                borderBottom: activeTab === tab.key ? "2px solid #d35400" : "none",
                pb: 0.5,
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </Typography>
          ))}
        </Box>

        {/* Sekme içerikleri */}
        {activeTab === "username" && (
          <Box>
            <TextField fullWidth label="Yeni Kullanıcı Adı" sx={{ mb: 2 }} variant="outlined" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#d35400" }} onClick={handleChangeUsername}>Kaydet</Button>
          </Box>
        )}

        {activeTab === "email" && (
          <Box>
            <TextField fullWidth label="Yeni E-posta" sx={{ mb: 2 }} variant="outlined" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#d35400" }} onClick={handleChangeEmail}>Güncelle</Button>
          </Box>
        )}

        {activeTab === "password" && (
          <Box>
            <TextField fullWidth label="Eski Şifre" type="password" sx={{ mb: 2 }} variant="outlined" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <TextField fullWidth label="Yeni Şifre" type="password" sx={{ mb: 2 }} variant="outlined" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#d35400" }} onClick={handleChangePassword}>Şifreyi Değiştir</Button>
          </Box>
        )}

        {activeTab === "delete" && (
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ mb: 2, color: "#a33" }}>Hesabınızı silmek istediğinize emin misiniz?</Typography>
            <Button variant="contained" color="error" fullWidth sx={{ borderRadius: 2 }} onClick={handleDeleteAccount}>Hesabı Sil</Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}