import { useState, useEffect, useRef } from "react";
import {
  GitHub,
  LinkedIn,
  CameraAlt,
  Settings,
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
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import useAuthStore from "../store/useAuthStore";
import axios from "../lib/axios";
import AccountSettingsDialog from "../components/profile/AccountSettingsDialog";
import SkillsSelect from "../components/profile/SkillsSelect";
import universities from "../data/universities.json";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  // Profil state
  const [skills, setSkills] = useState([]);
  const [bio, setBio] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Snackbar
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Message handler function for AccountSettingsDialog
  const handleMessage = (text, type) => {
    setMessageText(text);
    setMessageType(type);
    setMessageOpen(true);
  };

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
      const response = await axios.post("/user/upload-photo", formData, {
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

  // Profil kaydet
  const handleSaveProfile = async () => {
    const profileData = { university, department, title: role, skills, bio, github, linkedin };
    try {
      const res = await axios.put("/user/update", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setMessageText("Profil başarıyla kaydedildi!");
      setMessageType("success");
    } catch {
      setMessageText("Profil kaydedilirken hata oluştu!");
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

  if (loading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#003fd3ff" }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      height: "100vh",
      display: "flex", 
      margin: 0, 
      padding: 0,
      width: "100vw",
      maxWidth: "100vw",
      overflow: "hidden",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      {/* SOL TARAF - Profil Kartı (sadece desktop'ta görünür) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          width: { md: "33.33%" },
          background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
          color: "white",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          textAlign: "center",
          margin: 0,
          minHeight: "100vh",
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
              width: 140,
              height: 140,
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
              {!preview && <Person sx={{ fontSize: 70, color: "#6b0f1a" }} />} 
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
              fontSize: { md: "1.6rem", lg: "2rem" }
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
              fontSize: { md: "1rem", lg: "1.1rem" }
            }}
          >
            {role || "Pozisyon belirtilmemiş"}
          </Typography>

          {/* Sosyal Linkler */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 4 }}>
            {github && (
              <IconButton 
                href={github.startsWith("http") ? github : `https://${github}`} 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#333",
                  fontSize: 35,
                  "&:hover": { 
                    backgroundColor: "#000", 
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <GitHub sx={{ fontSize: 25 }} />
              </IconButton>
            )}
            {linkedin && (
              <IconButton 
                href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} 
                target="_blank"
                sx={{ 
                  color: "#fff", 
                  backgroundColor: "#0A66C2",
                  fontSize: 35,
                  "&:hover": { 
                    backgroundColor: "#004182", 
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(10,102,194,0.3)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <LinkedIn sx={{ fontSize: 25 }} />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>

      {/* SAĞ TARAF - Profil Formu */}
      <Box
        sx={{
          flex: 2,
          width: { xs: "100%", md: "66.67%" },
          backgroundColor: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: { xs: 1, sm: 3, md: 6 },
          minHeight: "100vh",
          maxHeight: { xs: "calc(100vh - 64px)", md: "none" }, // Desktop'ta height sınırı kaldır
          margin: 0,
          overflowY: "auto",
          pt: { xs: 8, md: 6 },
          pb: { xs: 6, md: 2 },
        }}
      >
        {/* Profil Formu Container */}
        <Box sx={{ 
          width: "100%", 
          maxWidth: 700,
          display: "flex",
          flexDirection: "column",
          py: { xs: 2, md: 1 }, // Desktop'ta padding küçültüldü
          pb: { xs: 4, md: 1 }, // Desktop'ta bottom padding küçültüldü
          minHeight: "fit-content",
          height: { md: "fit-content" } // Desktop'ta fit-content
        }}>
          {/* Mobile header */}
          <Box 
            sx={{ 
              display: { xs: "flex", md: "none" }, 
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center", 
              mb: 2, // Margin küçültüldü
              mt: 1  // Top margin küçültüldü
            }}
          >
            <Avatar
              src={preview || undefined}
              sx={{
                width: 120,
                height: 120,
                border: "3px solid #003fd3ff",
                bgcolor: "#003fd3ff",
                mb: 2,
                cursor: "pointer"
              }}
              onClick={handleChangeProfilePhoto}
            >
              {!preview && <Person sx={{ fontSize: 60, color: "#fff" }} />}
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
              p: { xs: 1, sm: 2, md: 3 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 2, md: 3 } // Mobile'da gap küçültüldü
            }}
          >
            {/* Başlık ve Ayarlar */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              mb: { xs: 1, md: 2 }, // Mobile'da margin küçültüldü
              px: { xs: 1, sm: 0 }
            }}>
              <Typography
                variant="h5"
                sx={{ 
                  fontWeight: "bold", 
                  color: "#6b0f1a",
                  fontSize: { xs: "1.3rem", sm: "1.5rem" } // Mobile font boyutu
                }}
              >
                Profil Bilgileri
              </Typography>
              <IconButton
                onClick={() => setOpen(true)}
                sx={{
                  backgroundColor: "#003fd3ff",
                  color: "#fff",
                  size: { xs: "small", sm: "medium" }, // Mobile'da küçük boyut
                  "&:hover": { backgroundColor: "#0056b3", transform: "scale(1.05)" },
                  transition: "all 0.2s",
                }}
              >
                <Settings sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
            </Box>

            {/* Pozisyon */}
            <TextField
              label="Title"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ 
                mx: { xs: 1, sm: 0 }, // Mobile'da yatay margin
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                }
              }}
            />

            {/* Biyografi */}
            <TextField 
              label="Biyografi"
              multiline 
              minRows={2} // Satır sayısı küçültüldü
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              sx={{ 
                mx: { xs: 1, sm: 0 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                }
              }}
            />

            {/* Üniversite & Bölüm */}
            <Box sx={{ mx: { xs: 1, sm: 0 } }}> {/* Mobile'da yatay margin */}
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
            <Box sx={{ mx: { xs: 1, sm: 0 } }}> {/* Mobile'da yatay margin */}
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
            <Box sx={{ mx: { xs: 1, sm: 0 } }}> {/* Mobile'da yatay margin */}
              <SkillsSelect
                skills={skills}
                onChange={setSkills}
              />
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
                mt: { xs: 1, md: 2 },
                mb: { xs: 3, md: 4 }, // Bottom margin artırıldı
                mx: { xs: 1, sm: 0 }
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

      {/* Account Settings Dialog */}
      <AccountSettingsDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onMessage={handleMessage}
      />
    </Box>
  );
}