import { useState, useEffect, useRef } from "react";
import {
  GitHub,
  LinkedIn,
  CameraAlt,
  Settings,
  School,
  Person,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
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
  Dialog,
  Divider,
  InputAdornment,
  List,
  ListItem,
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
  const fetchUser = useAuthStore((state) => state.fetchUser);

  // --- Profil state ---
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Profil fotoğrafı
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState("");

  // Ayarlar popup
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("username");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Snackbar
  const [saveMessageOpen, setSaveMessageOpen] = useState(false);
  const [saveMessageText, setSaveMessageText] = useState("");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setSkills(user.skills || []);
      setBio(user.bio || "");
      setUniversity(user.university || "");
      setDepartment(user.department || "");
      setRole(user.title || "");
      setGithub(user.github || "");
      setLinkedin(user.linkedin || "");
      setPreview(user.profileImage || "");
    }
  }, [user]);

  // --- Profil fotoğrafı değiştirme ---
  const handleChangeProfilePhoto = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axiosInstance.post("/user/upload-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchUser();
    } catch (err) {
      console.error("Profil fotoğrafı yüklenemedi:", err.response?.data || err.message);
    }
  };

  // --- Popup kapanınca input’ları sıfırla ---
  const handleClosePopup = () => {
    setOpen(false);
    setOldPassword("");
    setNewPassword("");
    setNewUsername("");
    setNewEmail("");
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  // --- Yetenek ekle/sil ---
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

  // --- Profil kaydet ---
  const handleSaveProfile = async () => {
    const profileData = { university, department, title: role, skills, bio, github, linkedin };
    try {
      const res = await axiosInstance.put("/user/update", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setSaveMessageText("Profil başarıyla güncellendi!");
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

  // --- Ayarlar fonksiyonları ---
  const handleChangePassword = async () => {
    try {
      await axiosInstance.put("/user/change-password", { oldPassword, newPassword });
      setSaveMessageText("Şifre başarıyla güncellendi!");
      setSaveMessageOpen(true);
      handleClosePopup();
    } catch (err) {
      console.error("Şifre güncellenemedi:", err.response?.data || err.message);
    }
  };

  const handleChangeUsername = async () => {
    try {
      await axiosInstance.put("/user/change-username", { newUsername });
      setSaveMessageText("Kullanıcı adı başarıyla güncellendi!");
      setSaveMessageOpen(true);
      handleClosePopup();
    } catch (err) {
      console.error("Kullanıcı adı güncellenemedi:", err.response?.data || err.message);
    }
  };

  const handleChangeEmail = async () => {
    try {
      await axiosInstance.put("/user/change-email", { newEmail });
      setSaveMessageText("E-posta başarıyla güncellendi!");
      setSaveMessageOpen(true);
      handleClosePopup();
    } catch (err) {
      console.error("E-posta güncellenemedi:", err.response?.data || err.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axiosInstance.delete("/user/delete-account");
      setSaveMessageText("Hesap başarıyla silindi!");
      setSaveMessageOpen(true);
      handleClosePopup();
      // navigate("/login"); // opsiyonel
    } catch (err) {
      console.error("Hesap silinemedi:", err.response?.data || err.message);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 8, px: 4, backgroundColor: "#fafafa" }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: 5,
          borderRadius: "10px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          position: "relative",
        }}
      >
        {/* Ayarlar butonu */}
        <IconButton onClick={() => setOpen(true)} sx={{ position: "absolute", top: 24, right: 24, color: "#003fd3ff" }}>
          <Settings fontSize="large" />
        </IconButton>

        {/* Profil üst kısmı */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", mb: 5 }}>
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
            onClick={handleChangeProfilePhoto}
          >
            <Avatar
              src={preview || undefined}
              sx={{ width: "100%", height: "100%", border: "3px solid #003fd3ff", bgcolor: "#003fd3ff" }}
            >
              {!preview && <Person sx={{ fontSize: 70, color: "#fff" }} />}
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

          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {user?.fullname || "Kullanıcı"}
            </Typography>
            <Box sx={{ mt: 1.5, borderBottom: "2px dotted #003fd3ff", display: "inline-block", minWidth: 220, pb: 0.5 }}>
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

            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
              {university ? (
                <Chip icon={<School />} label={university} onDelete={() => setUniversity("")} sx={{ flex: 1, borderRadius: "10px", backgroundColor: "#f5f5f5", color: "#333", fontWeight: 600, height: 50 }} />
              ) : (
                <Select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  displayEmpty
                  sx={{
                    flex: 1,
                    minWidth: 250,
                    height: 50,
                    borderRadius: "10px",
                    "& .MuiSelect-select": { display: "flex", alignItems: "center", fontSize: "1rem", fontWeight: 500, color: university ? "#000" : "gray", pl: 2 },
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
                sx={{ flex: 1, height: 50, "& .MuiOutlinedInput-root": { height: 50, borderRadius: "10px", "& fieldset": { borderColor: "#003fd3ff" } } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Biyografi, sosyal, yetenekler ve kaydetme */}
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
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#003fd3ff" } } }}
          />

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, mt: 3 }}>
            Sosyal Bağlantılar
          </Typography>
          <Stack spacing={2}>
            <TextField
              placeholder="https://github.com/kullanici"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              variant="outlined"
              InputProps={{ startAdornment: <InputAdornment position="start"><GitHub sx={{ color: "#333" }} /></InputAdornment> }}
              sx={{ "& fieldset": { borderColor: "#003fd3ff" }, borderRadius: "10px" }}
            />
            <TextField
              placeholder="https://linkedin.com/in/kullanici"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              variant="outlined"
              InputProps={{ startAdornment: <InputAdornment position="start"><LinkedIn sx={{ color: "#0A66C2" }} /></InputAdornment> }}
              sx={{ "& fieldset": { borderColor: "#003fd3ff" }, borderRadius: "10px" }}
            />
          </Stack>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, mt: 3 }}>
            Yeteneklerim
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
            {skills.map((skill) => (
              <Chip key={skill} label={skill} onDelete={() => handleDeleteSkill(skill)} sx={{ mb: 1, borderRadius: "10px", backgroundColor: "#003fd3ff", color: "#fff" }} />
            ))}
          </Stack>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <TextField label="Yeni Yetenek Ekle" variant="outlined" size="small" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", "& fieldset": { borderColor: "#003fd3ff" } } }} />
            <Button variant="contained" sx={{ backgroundColor: "#003fd3ff", borderRadius: "10px", "&:hover": { backgroundColor: "#002fa0" } }} onClick={handleAddSkill}>
              Ekle
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: isProfileChanged ? "#003fd3ff" : "#ccc", borderRadius: "10px", px: 4, py: 1, fontSize: "1rem", "&:hover": { backgroundColor: isProfileChanged ? "#002fa0" : "#ccc" } }}
              disabled={!isProfileChanged}
              onClick={handleSaveProfile}
            >
              Profili Kaydet
            </Button>
          </Box>
        </Box>

        {/* Snackbar */}
        <Snackbar open={saveMessageOpen} autoHideDuration={3000} onClose={() => setSaveMessageOpen(false)}>
          <Alert severity="success">{saveMessageText}</Alert>
        </Snackbar>

        {/* Ayarlar popup */}
        <Dialog open={open} onClose={handleClosePopup} PaperProps={{ sx: { width: 420, borderRadius: 4, p: 3, backgroundColor: "#fff" } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center", mb: 2 }}>
            Hesap Ayarları
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Tab menüsü */}
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
                  color: activeTab === tab.key ? "#003fd3ff" : "#777",
                  cursor: "pointer",
                  borderBottom: activeTab === tab.key ? "2px solid #003fd3ff" : "none",
                  pb: 0.5,
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </Typography>
            ))}
          </Box>

          {/* Tab içerikleri */}
          {activeTab === "username" && (
            <Box>
              <TextField fullWidth label="Yeni Kullanıcı Adı" sx={{ mb: 2 }} variant="outlined" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
              <Button fullWidth variant="contained" sx={{ background: "#003fd3ff" }} onClick={handleChangeUsername}>
                Kaydet
              </Button>
            </Box>
          )}

          {activeTab === "email" && (
            <Box>
              <TextField fullWidth label="Yeni E-posta" sx={{ mb: 2 }} variant="outlined" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <Button fullWidth variant="contained" sx={{ background: "#003fd3ff" }} onClick={handleChangeEmail}>
                Güncelle
              </Button>
            </Box>
          )}

          {activeTab === "password" && (
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
              <TextField fullWidth label="Eski Şifre" type={showOldPassword ? "text" : "password"} sx={{ mb: 2 }} variant="outlined" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowOldPassword(!showOldPassword)}>{showOldPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
              <TextField fullWidth label="Yeni Şifre" type={showNewPassword ? "text" : "password"} sx={{ mb: 2 }} variant="outlined" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

              <List dense sx={{ color: "#424242", fontSize: "0.9rem", mb: 2 }}>
                <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {newPassword.length >= 8 && newPassword.length <= 20 ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />} 8–20 karakter
                </ListItem>
                <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  {/[A-Z]/.test(newPassword) ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
  En az bir büyük harf içermeli
</ListItem>

<ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
  En az bir özel karakter içermeli (!@#$%^&*)
</ListItem>
              </List>
              <Button fullWidth type="submit" variant="contained"
                disabled={!(newPassword.length >= 8 && newPassword.length <= 20 && /[A-Z]/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword))}
                sx={{ background: "#003fd3ff", borderRadius: 2, py: 1.2, fontWeight: "bold", "&:hover": { background: "#002fa0" }, "&:disabled": { background: "#ccc", color: "#666" }, mb: 2 }}
              >
                Şifreyi Değiştir
              </Button>
            </Box>
          )}

          {activeTab === "delete" && (
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ mb: 2, color: "#a33" }}>Hesabınızı silmek istediğinize emin misiniz?</Typography>
              <Button variant="contained" color="error" fullWidth sx={{ borderRadius: 2, mb: 2 }} onClick={handleDeleteAccount}>
                Hesabı Sil
              </Button>
            </Box>
          )}
        </Dialog>
      </Box>
    </Box>
  );
}