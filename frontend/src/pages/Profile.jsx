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
  Add,
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
  Snackbar,
  Alert,
  List,
  ListItem,
} from "@mui/material";
import universities from "../data/universities.json";
import useAuthStore from "../store/useAuthStore";
import axiosInstance from "../lib/axios";
import { useNavigate } from "react-router-dom";


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
  const [preview, setPreview] = useState("");

  const fileInputRef = useRef(null);

  // --- Ayarlar popup ---
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("username");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // --- Snackbar ---
  const [saveMessageOpen, setSaveMessageOpen] = useState(false);
  const [saveMessageText, setSaveMessageText] = useState("");

  useEffect(() => {
    fetchUser();
    
    // HEIC formatlarını otomatik JPG'ye çevir
    const convertHeic = async () => {
      try {
        const response = await axiosInstance.post("/user/convert-heic", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Eğer format değiştiyse user'ı tekrar fetch et
        if (response.data.success) {
          await fetchUser();
        }
      } catch {
        // Sessizce devam et
      }
    };
    
    if (token) {
      convertHeic();
    }
  }, [fetchUser, token]);

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

  // --- Profil fotoğrafı ---
  const handleChangeProfilePhoto = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Geçici preview göster
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axiosInstance.post("/user/upload-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      
      // User'ı tekrar fetch et - bu otomatik olarak useEffect'i tetikler
      const updatedUser = await fetchUser();
      if (updatedUser && updatedUser.profileImage) {
        setPreview(updatedUser.profileImage);
      }
      
      setSaveMessageText("Profil fotoğrafı başarıyla güncellendi!");
      setSaveMessageOpen(true);
      
    } catch (err) {
      console.error("Profil fotoğrafı yükleme hatası:", err.response?.data?.message || err.message);
      
      setSaveMessageText("Profil fotoğrafı yüklenirken hata oluştu!");
      setSaveMessageOpen(true);
      
      // Hata durumunda preview'i geri al
      setPreview(user?.profileImage || "");
    }
  };

  // --- Skills ekle/sil ---
  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setSkills(skills.filter((s) => s !== skillToDelete));
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

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleDeleteAccount = async () => {
    if (!confirm("Hesabını silmek istediğine emin misin? 🫣")) return;

    try {
      await axiosInstance.delete("/user/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      logout();            // ✅ Token ve user bilgisini temizle
      navigate("/login");  // ✅ Giriş ekranına yönlendir
    } catch (err) {
      console.error("Hesap silme hatası:", err.response?.data || err.message);
      alert("Hesap silinirken bir hata oluştu.");
    }
  };

  const handleClosePopup = () => {
    setOpen(false);
    setOldPassword("");
    setNewPassword("");
    setNewUsername("");
    setNewEmail("");
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 8, px: 4, bgcolor: "#fafafa" }}>
      <Box sx={{ maxWidth: 900, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "300px 1fr" }, gap: 6 }}>
        
        {/* Sol panel */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Box sx={{ position: "relative", width: 140, height: 140, borderRadius: "50%", overflow: "hidden", cursor: "pointer", "&:hover .cameraOverlay": { opacity: 1 }}} onClick={handleChangeProfilePhoto}>
            <Avatar src={preview || undefined} sx={{ width: "100%", height: "100%", border: "3px solid #003fd3ff", bgcolor: "#003fd3ff" }}>
              {!preview && <Person sx={{ fontSize: 70, color: "#fff" }} />}
            </Avatar>
            <Box className="cameraOverlay" sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", bgcolor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s" }}>
              <CameraAlt sx={{ color: "#fff", fontSize: 40 }} />
            </Box>
          </Box>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{user?.fullname || "Kullanıcı"}</Typography>
            <IconButton onClick={() => setOpen(true)} sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}>
              <Settings />
            </IconButton>
          </Box>
          <TextField placeholder="Pozisyon" value={role} onChange={(e) => setRole(e.target.value)} sx={{ width: "100%", mt: 1 }} />

          <Stack direction="row" spacing={1}>
            {github && <IconButton href={github} target="_blank"><GitHub /></IconButton>}
            {linkedin && <IconButton href={linkedin} target="_blank"><LinkedIn color="primary" /></IconButton>}
          </Stack>

          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Yetenekler</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {skills.map(skill => (
                <Chip key={skill} label={skill} onDelete={() => handleDeleteSkill(skill)} sx={{ mb: 1, borderRadius: "10px", bgcolor: "#003fd3ff", color: "#fff" }} />
              ))}
            </Stack>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <TextField size="small" fullWidth placeholder="Yeni yetenek" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
              <Button variant="contained" sx={{ minWidth: 40 }} onClick={handleAddSkill}><Add /></Button>
            </Box>
          </Box>
        </Box>

        {/* Sağ panel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Typography variant="h6">Biyografi</Typography>
          <TextField multiline minRows={4} fullWidth value={bio} onChange={(e) => setBio(e.target.value)} />

          <Typography variant="h6">Üniversite & Bölüm</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Select value={university} onChange={(e) => setUniversity(e.target.value)} displayEmpty sx={{ flex: 1 }}>
              <MenuItem value="" disabled>Üniversite</MenuItem>
              {universities.map(uni => <MenuItem key={uni} value={uni}>{uni}</MenuItem>)}
            </Select>
            <TextField placeholder="Bölüm" value={department} onChange={(e) => setDepartment(e.target.value)} sx={{ flex: 1 }} />
          </Stack>

          <Typography variant="h6">Sosyal Bağlantılar</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField placeholder="Github" value={github} onChange={(e) => setGithub(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><GitHub /></InputAdornment> }} sx={{ flex: 1 }} />
            <TextField placeholder="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><LinkedIn color="primary" /></InputAdornment> }} sx={{ flex: 1 }} />
          </Stack>

          <Box sx={{ textAlign: "center" }}>
            <Button variant="contained" disabled={!isProfileChanged} onClick={handleSaveProfile} sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 600 }}>
              Profili Kaydet
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar open={saveMessageOpen} autoHideDuration={3000} onClose={() => setSaveMessageOpen(false)}>
        <Alert severity="success">{saveMessageText}</Alert>
      </Snackbar>

      {/* Ayarlar popup */}
      <Dialog open={open} onClose={handleClosePopup} PaperProps={{ sx: { width: 420, borderRadius: 4, p: 3 } }}>
        <Typography variant="h6" sx={{ textAlign: "center", mb: 2, fontWeight: 700 }}>Hesap Ayarları</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-around", mb: 2 }}>
          {[
            { key: "username", label: "Kullanıcı Adı" },
            { key: "email", label: "E-posta" },
            { key: "password", label: "Şifre" },
            { key: "delete", label: "Sil" },
          ].map(tab => (
            <Typography key={tab.key} onClick={() => setActiveTab(tab.key)} sx={{ fontWeight: 600, cursor: "pointer", color: activeTab === tab.key ? "#003fd3ff" : "#777", borderBottom: activeTab === tab.key ? "2px solid #003fd3ff" : "none", pb: 0.5 }}>{tab.label}</Typography>
          ))}
        </Box>

        {activeTab === "username" && (
          <Box>
            <TextField fullWidth label="Yeni Kullanıcı Adı" sx={{ mb: 2 }} value={newUsername} onChange={e => setNewUsername(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#003fd3ff" }} onClick={handleChangeUsername}>Kaydet</Button>
          </Box>
        )}

        {activeTab === "email" && (
          <Box>
            <TextField fullWidth label="Yeni E-posta" sx={{ mb: 2 }} value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            <Button fullWidth variant="contained" sx={{ background: "#003fd3ff" }} onClick={handleChangeEmail}>Güncelle</Button>
          </Box>
        )}

        {activeTab === "password" && (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
            <TextField fullWidth label="Eski Şifre" type={showOldPassword ? "text" : "password"} sx={{ mb: 2 }} value={oldPassword} onChange={e => setOldPassword(e.target.value)}
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowOldPassword(!showOldPassword)}>{showOldPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
            <TextField fullWidth label="Yeni Şifre" type={showNewPassword ? "text" : "password"} sx={{ mb: 2 }} value={newPassword} onChange={e => setNewPassword(e.target.value)}
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />

            <List dense sx={{ color: "#424242", fontSize: "0.9rem", mb: 2 }}>
              <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {newPassword.length >= 8 && newPassword.length <= 20 ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />} 8–20 karakter
              </ListItem>
              <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/[A-Z]/.test(newPassword) ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />} En az bir büyük harf
              </ListItem>
              <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />} En az bir özel karakter
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
            <Button variant="contained" color="error" fullWidth sx={{ borderRadius: 2, mb: 2 }} onClick={handleDeleteAccount}>Hesabı Sil</Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}