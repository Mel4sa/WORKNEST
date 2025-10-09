import { useState, useEffect, useRef } from "react";
import {
  GitHub,
  LinkedIn,
  CameraAlt,
  Settings,
  Person,
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
  Select,
  MenuItem,
  IconButton,
  Dialog,
  Divider,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
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
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Profil state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);

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
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Kullanıcıyı fetch et
  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        setLoading(true);
        await fetchUser();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchUser, token]);

  // User geldiğinde stateleri set et ve eksik profil kontrolü
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

      if (!user.bio || !user.university || !user.department) {
        setMessageText("Lütfen profil bilgilerinizi tamamlayınız!");
        setMessageType("warning");
        setMessageOpen(true);
      }
    }
  }, [user]);

  // Profil fotoğrafı değişimi
  const handleChangeProfilePhoto = () => fileInputRef.current.click();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya türünü kontrol et
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    
    // HEIC dosyaları için preview oluşturulamayabilir, o yüzden fallback kullan
    try {
      setPreview(URL.createObjectURL(file));
    } catch {
      // HEIC dosyaları için preview oluşturulamazsa, loading göster
      setPreview("");
    }

    // HEIC dosyası için özel mesaj göster
    if (isHeic) {
      setMessageText("HEIC fotoğraf yükleniyor ve JPG formatına çevriliyor...");
      setMessageType("info");
      setMessageOpen(true);
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await axiosInstance.post("/user/upload-photo", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      await fetchUser();
      
      // Başarı mesajı (format bilgisi dahil)
      if (response.data.originalFormat === 'HEIC') {
        setMessageText("HEIC fotoğraf başarıyla JPG formatına çevrilerek yüklendi!");
      } else {
        setMessageText("Profil fotoğrafı başarıyla güncellendi!");
      }
      setMessageType("success");
    } catch {
      setPreview(user?.profileImage || "");
      
      // HEIC için özel hata mesajı
      if (isHeic) {
        setMessageText("HEIC fotoğraf yüklenirken hata oluştu. Lütfen JPG formatında tekrar deneyin.");
      } else {
        setMessageText("Profil fotoğrafı yüklenirken hata oluştu!");
      }
      setMessageType("error");
    } finally {
      setMessageOpen(true);
    }
  };

  // Skill işlemleri
  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill("");
    }
  };
  const handleDeleteSkill = (s) => setSkills(skills.filter((x) => x !== s));

  // Profil kaydet
  const handleSaveProfile = async () => {
    const profileData = { university, department, title: role, skills, bio, github, linkedin };
    try {
      const res = await axiosInstance.put("/user/update", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setMessageText("Profil başarıyla güncellendi!");
      setMessageType("success");
    } catch {
      setMessageText("Profil güncellenirken hata oluştu!");
      setMessageType("error");
    } finally {
      setMessageOpen(true);
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

  // Hesap ayarları
  const handleChangePassword = async () => {
    try {
      await axiosInstance.put("/user/change-password", { oldPassword, newPassword });
      setMessageText("Şifre başarıyla güncellendi!");
      setMessageType("success");
      handleClosePopup();
    } catch {
      setMessageText("Şifre güncellenirken hata oluştu!");
      setMessageType("error");
    } finally {
      setMessageOpen(true);
    }
  };
  const handleChangeUsername = async () => {
    try {
      await axiosInstance.put("/user/change-username", { newUsername });
      setMessageText("Kullanıcı adı başarıyla güncellendi!");
      setMessageType("success");
      handleClosePopup();
    } catch {
      setMessageText("Kullanıcı adı güncellenirken hata oluştu!");
      setMessageType("error");
    } finally {
      setMessageOpen(true);
    }
  };
  const handleChangeEmail = async () => {
    try {
      await axiosInstance.put("/user/change-email", { newEmail });
      setMessageText("E-posta başarıyla güncellendi!");
      setMessageType("success");
      handleClosePopup();
    } catch {
      setMessageText("E-posta güncellenirken hata oluştu!");
      setMessageType("error");
    } finally {
      setMessageOpen(true);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      await axiosInstance.delete("/user/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/login");
    } catch {
      setMessageText("Hesap silinirken hata oluştu!");
      setMessageType("error");
      setMessageOpen(true);
    }
  };
  const handleClosePopup = () => {
    setOpen(false);
    setOldPassword("");
    setNewPassword("");
    setNewUsername("");
    setNewEmail("");
  };

  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#003fd3ff" }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "calc(100vh - 64px)", 
      height: "calc(100vh - 64px)",
      display: "flex", 
      margin: 0, 
      padding: 0,
      width: "100vw",
      maxWidth: "100vw",
      overflow: "hidden",
      position: "fixed",
      top: 64, // Navbar yüksekliği için boşluk
      left: 0,
      zIndex: 1
    }}>
      {/* SOL TARAF - Profil Kartı (sadece desktop'ta görünür) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          width: "50%",
          background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
          color: "white",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 6,
          textAlign: "center",
          margin: 0,
          minHeight: "calc(100vh - 64px)", // Navbar yüksekliği çıkarıldı
        }}
      >
        <Box sx={{ 
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          py: 4
        }}>
          {/* Profil Fotoğrafı */}
          <Box
            sx={{
              position: "relative",
              width: 160,
              height: 160,
              borderRadius: "50%",
              overflow: "hidden",
              cursor: "pointer",
              mb: 3,
              "&:hover .cameraOverlay": { opacity: 1 },
            }}
            onClick={handleChangeProfilePhoto}
          >
            <Avatar
              src={preview || undefined}
              sx={{
                width: "100%",
                height: "100%",
                border: "4px solid #ffd166",
                bgcolor: "#ffd166",
              }}
            >
              {!preview && <Person sx={{ fontSize: 80, color: "#6b0f1a" }} />}
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
              <CameraAlt sx={{ color: "#fff", fontSize: 50 }} />
            </Box>
          </Box>

          <input
            type="file"
            accept="image/*,.heic,.heif"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Typography
            variant="h4"
            sx={{ 
              fontWeight: "bold", 
              mb: 2, 
              fontSize: { md: "2rem", lg: "2.5rem" }
            }}
          >
            {user?.fullname || "Kullanıcı"}
          </Typography>

          <Typography
            variant="h6"
            sx={{ 
              color: "#ffd166", 
              mb: 3,
              opacity: 0.9,
              fontSize: { md: "1.1rem", lg: "1.3rem" }
            }}
          >
            {role || "Pozisyon belirtilmemiş"}
          </Typography>

          {/* Sosyal Linkler */}
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            {github && (
              <IconButton 
                href={github.startsWith("http") ? github : `https://${github}`} 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#333",
                  fontSize: 40,
                  "&:hover": { 
                    backgroundColor: "#000", 
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <GitHub sx={{ fontSize: 30 }} />
              </IconButton>
            )}
            {linkedin && (
              <IconButton 
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#0A66C2",
                  fontSize: 40,
                  "&:hover": { 
                    backgroundColor: "#004182", 
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(10,102,194,0.3)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <LinkedIn sx={{ fontSize: 30 }} />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>

      {/* SAĞ TARAF - Profil Formu */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          width: { xs: "100%", md: "50%" },
          backgroundColor: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 4, md: 6 },
          minHeight: "calc(100vh - 64px)", // Navbar yüksekliği çıkarıldı
          margin: 0,
          overflowY: "auto",
        }}
      >
        {/* Profil Formu Container */}
        <Box sx={{ 
          width: "100%", 
          maxWidth: 500,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4
        }}>
          {/* Mobile header */}
          <Box 
            sx={{ 
              display: { xs: "flex", md: "none" }, 
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center", 
              mb: 4, 
              mt: 2 
            }}
          >
            <Avatar
              src={preview || undefined}
              sx={{
                width: 100,
                height: 100,
                border: "3px solid #003fd3ff",
                bgcolor: "#003fd3ff",
                mb: 2,
                cursor: "pointer"
              }}
              onClick={handleChangeProfilePhoto}
            >
              {!preview && <Person sx={{ fontSize: 50, color: "#fff" }} />}
            </Avatar>
            <Typography
              variant="h5"
              sx={{ 
                fontWeight: "bold", 
                mb: 1, 
                color: "#6b0f1a" 
              }}
            >
              {user?.fullname || "Kullanıcı"}
            </Typography>
          </Box>

          {/* Form Container */}
          <Box
            sx={{
              width: "100%",
              backgroundColor: "transparent",
              borderRadius: 0,
              boxShadow: "none",
              p: { xs: 2, sm: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              gap: 3
            }}
          >
            {/* Başlık ve Ayarlar */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography
                variant="h5"
                sx={{ 
                  fontWeight: "bold", 
                  color: "#6b0f1a" 
                }}
              >
                Profil Bilgileri
              </Typography>
              <IconButton
                onClick={() => setOpen(true)}
                sx={{
                  backgroundColor: "#003fd3ff",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#0056b3", transform: "scale(1.05)" },
                  transition: "all 0.2s",
                }}
              >
                <Settings />
              </IconButton>
            </Box>

            {/* Pozisyon */}
            <TextField
              label="Title"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ 
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                }
              }}
            />

            {/* Biyografi */}
            <TextField 
              label="Biyografi"
              multiline 
              minRows={3} 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              sx={{ 
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                }
              }}
            />

            {/* Üniversite & Bölüm */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: "#6b0f1a" }}>
                Eğitim Bilgileri
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Select 
                  value={university} 
                  onChange={(e) => setUniversity(e.target.value)} 
                  displayEmpty 
                  sx={{ 
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    Üniversite Seçin
                  </MenuItem>
                  {universities.map((uni) => (
                    <MenuItem key={uni} value={uni}>
                      {uni}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  label="Bölüm"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  sx={{ 
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    }
                  }}
                />
              </Stack>
            </Box>

            {/* Sosyal Bağlantılar */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: "#6b0f1a" }}>
                Sosyal Bağlantılar
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  placeholder="https://github.com/kullanici"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHub sx={{ color: "#333" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "& fieldset": { borderColor: "#003fd3ff" },
                    },
                  }}
                />
                <TextField
                  placeholder="https://linkedin.com/in/kullanici"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedIn sx={{ color: "#0A66C2" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "& fieldset": { borderColor: "#003fd3ff" },
                    },
                  }}
                />
              </Stack>
            </Box>

            {/* Yetenekler */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: "#6b0f1a" }}>
                Yetenekler
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleDeleteSkill(skill)}
                    sx={{
                      mb: 1,
                      borderRadius: "12px",
                      bgcolor: "#003fd3ff",
                      color: "#fff",
                      "& .MuiChip-deleteIcon": { color: "#fff" },
                    }}
                  />
                ))}
              </Stack>

              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Yeni yetenek ekle"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  sx={{ 
                    minWidth: 50,
                    backgroundColor: "#003fd3ff",
                    borderRadius: "12px",
                    "&:hover": { backgroundColor: "#0056b3" }
                  }} 
                  onClick={handleAddSkill}
                >
                  <Add />
                </Button>
              </Box>
            </Box>

            {/* Kaydet Butonu */}
            <Button
              variant="contained"
              disabled={!isProfileChanged}
              onClick={handleSaveProfile}
              sx={{
                backgroundColor: "#003fd3ff",
                color: "#fff",
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "50px",
                "&:hover": { backgroundColor: "#0056b3" },
                fontSize: "1.1rem",
                mt: 2
              }}
            >
              Profili Kaydet
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={messageOpen}
        autoHideDuration={4000}
        onClose={() => setMessageOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ 
          zIndex: 9999,
          top: "80px !important" // Navbar altına gelmesin
        }}
      >
        <Alert 
          severity={messageType}
          sx={{
            borderRadius: "12px",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          {messageText}
        </Alert>
      </Snackbar>

      {/* Ayarlar Popup */}
      <Dialog 
        open={open} 
        onClose={handleClosePopup} 
        PaperProps={{ 
          sx: { 
            width: 450, 
            borderRadius: "20px", 
            p: 4,
            backgroundColor: "#f8f9fa",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          } 
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: "center", 
            mb: 3, 
            fontWeight: "bold",
            color: "#6b0f1a"
          }}
        >
          Hesap Ayarları
        </Typography>
        <Divider sx={{ mb: 3, backgroundColor: "#ddd" }} />
        
        {/* Tab Navigation */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-around", 
          mb: 3,
          backgroundColor: "#fff",
          borderRadius: "12px",
          p: 1,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
        }}>
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
                cursor: "pointer",
                color: activeTab === tab.key ? "#fff" : "#666",
                backgroundColor: activeTab === tab.key ? "#003fd3ff" : "transparent",
                borderRadius: "8px",
                py: 1,
                px: 2,
                transition: "all 0.3s ease",
                fontSize: "0.85rem",
                textAlign: "center",
                "&:hover": {
                  backgroundColor: activeTab === tab.key ? "#0056b3" : "#f0f0f0"
                }
              }}
            >
              {tab.label}
            </Typography>
          ))}
        </Box>

        {activeTab === "username" && (
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#6b0f1a" }}>
              Kullanıcı Adını Değiştir
            </Typography>
            <TextField 
              fullWidth 
              label="Yeni Kullanıcı Adı" 
              placeholder="Yeni kullanıcı adınızı girin"
              sx={{ 
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f8f9fa",
                  "& fieldset": { borderColor: "#ddd" },
                  "&:hover fieldset": { borderColor: "#003fd3ff" },
                  "&.Mui-focused fieldset": { borderColor: "#003fd3ff" }
                }
              }} 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value)} 
            />
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ 
                background: "linear-gradient(135deg, #003fd3ff, #0056b3)",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,63,211,0.3)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #0056b3, #003fd3ff)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(0,63,211,0.4)"
                },
                transition: "all 0.3s ease"
              }} 
              onClick={handleChangeUsername}
            >
              Kullanıcı Adını Kaydet
            </Button>
          </Box>
        )}

        {activeTab === "email" && (
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#6b0f1a" }}>
              E-posta Adresini Değiştir
            </Typography>
            <TextField 
              fullWidth 
              label="Yeni E-posta" 
              placeholder="Yeni e-posta adresinizi girin"
              type="email"
              sx={{ 
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f8f9fa",
                  "& fieldset": { borderColor: "#ddd" },
                  "&:hover fieldset": { borderColor: "#003fd3ff" },
                  "&.Mui-focused fieldset": { borderColor: "#003fd3ff" }
                }
              }} 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
            />
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ 
                background: "linear-gradient(135deg, #003fd3ff, #0056b3)",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,63,211,0.3)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #0056b3, #003fd3ff)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(0,63,211,0.4)"
                },
                transition: "all 0.3s ease"
              }} 
              onClick={handleChangeEmail}
            >
              E-posta Adresini Güncelle
            </Button>
          </Box>
        )}

        {activeTab === "password" && (
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#6b0f1a" }}>
              Şifreyi Değiştir
            </Typography>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f8f9fa",
                  "& fieldset": { borderColor: "#ddd" },
                  "&:hover fieldset": { borderColor: "#003fd3ff" },
                  "&.Mui-focused fieldset": { borderColor: "#003fd3ff" }
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Yeni Şifre"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ 
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f8f9fa",
                  "& fieldset": { borderColor: "#ddd" },
                  "&:hover fieldset": { borderColor: "#003fd3ff" },
                  "&.Mui-focused fieldset": { borderColor: "#003fd3ff" }
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ 
                background: "linear-gradient(135deg, #003fd3ff, #0056b3)",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,63,211,0.3)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #0056b3, #003fd3ff)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(0,63,211,0.4)"
                },
                transition: "all 0.3s ease"
              }} 
              onClick={handleChangePassword}
            >
              Şifreyi Güncelle
            </Button>
          </Box>
        )}

        {activeTab === "delete" && (
          <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#d32f2f", textAlign: "center" }}>
              Hesabı Sil
            </Typography>
            <Typography sx={{ mb: 3, textAlign: "center", color: "#666", lineHeight: 1.6 }}>
              Bu işlem geri alınamaz. Hesabınızı silmek istediğinize emin misiniz? 
              Tüm verileriniz kalıcı olarak silinecektir.
            </Typography>
            <Button 
              fullWidth 
              variant="contained" 
              sx={{
                background: "linear-gradient(135deg, #d32f2f, #b71c1c)",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(211,47,47,0.3)",
                "&:hover": { 
                  background: "linear-gradient(135deg, #b71c1c, #d32f2f)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(211,47,47,0.4)"
                },
                transition: "all 0.3s ease"
              }}
              onClick={handleDeleteAccount}
            >
              Hesabı Kalıcı Olarak Sil
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}