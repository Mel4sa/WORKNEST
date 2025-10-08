import { useState, useEffect, useRef } from "react";
import {
  GitHub,
  LinkedIn,
  CameraAlt,
  Settings,
  School,
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
  MenuItem,
  Select,
  IconButton,
  Dialog,
  Divider,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
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

  // Popup State
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

  // Fetch User
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

  // Profil fotoğrafı
  const handleChangeProfilePhoto = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("photo", file);

    try {
      await axiosInstance.post("/user/upload-photo", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUser();
      setMessageText("Profil fotoğrafı başarıyla güncellendi!");
      setMessageType("success");
    } catch {
      setPreview(user?.profileImage || "");
      setMessageText("Profil fotoğrafı yüklenirken hata oluştu!");
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

  // Şifre - kullanıcı adı - mail - silme işlemleri
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
    <Box sx={{ minHeight: "100vh", py: 8, px: 4, bgcolor: "#fafafa" }}>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
          gap: 6,
        }}
      >
        {/* Sol panel */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <Box
            sx={{
              position: "relative",
              width: 140,
              height: 140,
              borderRadius: "50%",
              overflow: "hidden",
              cursor: "pointer",
              "&:hover .cameraOverlay": { opacity: 1 },
            }}
            onClick={handleChangeProfilePhoto}
          >
            <Avatar
              src={preview || undefined}
              sx={{
                width: "100%",
                height: "100%",
                border: "3px solid #003fd3ff",
                bgcolor: "#003fd3ff",
              }}
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

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: "center" }}>
            {user?.fullname || "Kullanıcı"}
          </Typography>

          <TextField
            placeholder="Pozisyon"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ width: "100%", mt: 1 }}
          />

          <Stack direction="row" spacing={1}>
            {github && (
              <IconButton href={github.startsWith("http") ? github : `https://${github}`} target="_blank">
                <GitHub />
              </IconButton>
            )}
            {linkedin && (
              <IconButton href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank">
                <LinkedIn color="primary" />
              </IconButton>
            )}
          </Stack>

          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Yetenekler
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleDeleteSkill(skill)}
                  sx={{
                    mb: 1,
                    borderRadius: "10px",
                    bgcolor: "#003fd3ff",
                    color: "#fff",
                    "& .MuiChip-deleteIcon": { color: "#fff" },
                  }}
                />
              ))}
            </Stack>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Yeni yetenek"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button variant="contained" sx={{ minWidth: 40 }} onClick={handleAddSkill}>
                <Add />
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Sağ panel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Biyografi
            </Typography>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                bgcolor: "#f5f5f5",
                "&:hover": { bgcolor: "#e0e0e0" },
                transition: "0.2s",
              }}
            >
              <Settings />
            </IconButton>
          </Box>

          <TextField
            multiline
            minRows={4}
            fullWidth
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <Typography variant="h6">Üniversite & Bölüm</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              displayEmpty
              sx={{ flex: 1 }}
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
            <TextField
              placeholder="Bölüm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Typography variant="h6">Sosyal Bağlantılar</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              placeholder="Github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GitHub />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              placeholder="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkedIn color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              disabled={!isProfileChanged}
              onClick={handleSaveProfile}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontWeight: 600,
              }}
            >
              Profili Kaydet
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar open={messageOpen} autoHideDuration={3000} onClose={() => setMessageOpen(false)}>
        <Alert severity={messageType}>{messageText}</Alert>
      </Snackbar>

      {/* Ayarlar Popup */}
      <Dialog open={open} onClose={handleClosePopup} PaperProps={{ sx: { width: 420, borderRadius: 4, p: 3 } }}>
        <Typography variant="h6" sx={{ textAlign: "center", mb: 2, fontWeight: 700 }}>
          Hesap Ayarları
        </Typography>
        <Divider sx={{ mb: 2 }} />
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
                cursor: "pointer",
                color: activeTab === tab.key ? "#003fd3ff" : "#777",
                borderBottom: activeTab === tab.key ? "2px solid #003fd3ff" : "none",
                pb: 0.5,
              }}
            >
              {tab.label}
            </Typography>
          ))}
        </Box>

        {activeTab === "username" && (
          <Box>
            <TextField
              fullWidth
              label="Yeni Kullanıcı Adı"
              sx={{ mb: 2 }}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ background: "#003fd3ff" }}
              onClick={handleChangeUsername}
            >
              Kaydet
            </Button>
          </Box>
        )}

        {activeTab === "email" && (
          <Box>
            <TextField
              fullWidth
              label="Yeni E-posta"
              sx={{ mb: 2 }}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ background: "#003fd3ff" }}
              onClick={handleChangeEmail}
            >
              Güncelle
            </Button>
          </Box>
        )}

        {activeTab === "password" && (
          <Box>
            <TextField
              fullWidth
              label="Mevcut Şifre"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
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
              sx={{ background: "#003fd3ff" }}
              onClick={handleChangePassword}
            >
              Güncelle
            </Button>
          </Box>
        )}

        {activeTab === "delete" && (
          <Box sx={{ textAlign: "center" }}>
            <Button variant="contained" color="error" onClick={handleDeleteAccount}>
              Hesabı Sil
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}