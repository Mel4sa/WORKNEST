import { useState } from "react";
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
} from "@mui/material";
import { School, Person, Settings } from "@mui/icons-material";
import universities from "../data/universities.json";
import useAuthStore from "../store/useAuthStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  // Profil state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState(user?.role || "");

  // Ayarlar popup state
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("username");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Yetenekler
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

  // Popup işlemleri
  const handleChangePassword = () => {
    console.log("Eski şifre:", oldPassword);
    console.log("Yeni şifre:", newPassword);
    // API isteği ile şifre değiştirme
  };

  const handleChangeUsername = () => {
    console.log("Yeni kullanıcı adı:", newUsername);
    // API isteği
  };

  const handleChangeEmail = () => {
    console.log("Yeni email:", newEmail);
    // API isteği
  };

  const handleDeleteAccount = () => {
    console.log("Hesap silme isteği");
    // API isteği
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
            color: "#915d56",
            "&:hover": { color: "#7a4b45" },
          }}
        >
          <Settings fontSize="large" />
        </IconButton>

        {/* Profil üst kısmı */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", mb: 5 }}>
          <Avatar
            sx={{ width: 140, height: 140, border: "3px solid #915d56", bgcolor: "#915d56" }}
          >
            <Person sx={{ fontSize: 70, color: "#fff" }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {user?.fullname || "Kullanıcı"}
            </Typography>

            {/* Role / Title */}
            <Box sx={{ mt: 1.5, borderBottom: "2px dotted #915d56", display: "inline-block", minWidth: "220px", pb: 0.5 }}>
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
                  sx={{ flex: 1, borderRadius: "28px", backgroundColor: "#f5f5f5", color: "#333", fontWeight: 600, height: 50 }}
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
                    "& .MuiSelect-select": { display: "flex", alignItems: "center", fontSize: "1rem", fontWeight: 500, color: university ? "#000" : "gray", pl: 2 },
                    "& fieldset": { borderColor: "#915d56" },
                    "&:hover fieldset": { borderColor: "#7a4b45" },
                    "&.Mui-focused fieldset": { borderColor: "#7a4b45" },
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
                  "& .MuiOutlinedInput-root": { height: 50, color: "#000", borderRadius: "28px", "& fieldset": { borderColor: "#915d56" }, "&:hover fieldset": { borderColor: "#7a4b45" }, "&.Mui-focused fieldset": { borderColor: "#7a4b45" } },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Biyografi */}
        <Box sx={{ mb: 4 }}>
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
              "& .MuiOutlinedInput-root": { color: "#000", borderRadius: "20px", "& fieldset": { borderColor: "#915d56" }, "&:hover fieldset": { borderColor: "#7a4b45" }, "&.Mui-focused fieldset": { borderColor: "#7a4b45" } },
            }}
          />
        </Box>

        {/* Yetenekler */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Yeteneklerim</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleDeleteSkill(skill)}
                sx={{ mb: 1, borderRadius: "20px", backgroundColor: "#915d56", color: "#fff", fontWeight: "bold" }}
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
              sx={{ "& .MuiOutlinedInput-root": { color: "#000", borderRadius: "20px", "& fieldset": { borderColor: "#915d56" }, "&:hover fieldset": { borderColor: "#7a4b45" }, "&.Mui-focused fieldset": { borderColor: "#7a4b45" } } }}
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: "#915d56", color: "#fff", borderRadius: "20px", "&:hover": { backgroundColor: "#7a4b45" } }}
              onClick={handleAddSkill}
            >
              Ekle
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ⚙️ Ayarlar Popup */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 420, borderRadius: 4, p: 3, backgroundColor: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" } }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#915d56", textAlign: "center", mb: 2 }}>
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
                color: activeTab === tab.key ? "#915d56" : "#777",
                cursor: "pointer",
                borderBottom: activeTab === tab.key ? "2px solid #915d56" : "none",
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
            <Button fullWidth variant="contained" sx={{ background: "#915d56" }} onClick={handleChangeUsername}>Kaydet</Button>
          </Box>
        )}

        {activeTab === "email" && (
          <Box>
            <TextField fullWidth label="Yeni E-posta" sx={{ mb: 2 }} variant="outlined" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#915d56" }} onClick={handleChangeEmail}>Güncelle</Button>
          </Box>
        )}

        {activeTab === "password" && (
          <Box>
            <TextField fullWidth label="Eski Şifre" type="password" sx={{ mb: 2 }} variant="outlined" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <TextField fullWidth label="Yeni Şifre" type="password" sx={{ mb: 2 }} variant="outlined" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#915d56" }} onClick={handleChangePassword}>Şifreyi Değiştir</Button>
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