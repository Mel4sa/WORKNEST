import { useState } from "react";
import ProfileSnackbar from "./ProfileSnackbar";
import {
  Dialog,
  Typography,
  Divider,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
} from "@mui/material";
import { Person, Email, Lock, Delete } from "@mui/icons-material";
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircle, 
  Cancel 
} from "@mui/icons-material";
import axiosInstance from "../../lib/axios";
import useAuthStore from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const AccountSettingsDialog = ({ open, onClose, onMessage }) => {
  // Snackbar state (local)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  // onMessage override: hem parent'a hem local snackbar'a bas
  const showMessage = (text, type) => {
    setSnackbarText(text);
    setSnackbarType(type);
    setSnackbarOpen(true);
    if (onMessage) onMessage(text, type);
  };
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  // State yönetimi
  const [activeTab, setActiveTab] = useState(0); // 0: Ad Soyad, 1: E-posta, 2: Şifre, 3: Sil
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

    // Hesap ayarları fonksiyonları
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showMessage("Yeni şifre en az 6 karakter olmalı!", "error");
      return;
    }
    try {
      await axiosInstance.put("/users/change-password", { oldPassword, newPassword });
      showMessage("Şifre başarıyla güncellendi!", "success");
      handleCloseDialog();
    } catch {
      showMessage("Şifre güncellenirken hata oluştu!", "error");
    }
  };

  const setUser = useAuthStore((state) => state.setUser);
  // Ad soyadın baş harflerini büyüt
  const capitalizeFullname = (str) => {
    return str
      .split(' ')
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(' ');
  };

  const handleChangeUsername = async () => {
    try {
      const capitalized = capitalizeFullname(newUsername);
      const res = await axiosInstance.put("/users/change-fullname", { fullname: capitalized });
      if (res.data.user) setUser(res.data.user);
  showMessage("Ad soyad başarıyla güncellendi!", "success");
      handleCloseDialog();
    } catch {
  showMessage("Ad soyad güncellenirken hata oluştu!", "error");
    }
  };

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleChangeEmail = async () => {
    const trimmed = newEmail.trim();
    if (!isValidEmail(trimmed)) {
      showMessage("Lütfen geçerli bir e-posta adresi girin!", "error");
      return;
    }
    try {
      await axiosInstance.put("/users/change-email", { newEmail: trimmed });
  showMessage("Email başarıyla güncellendi!", "success");
      handleCloseDialog();
    } catch {
  showMessage("Email güncellenirken hata oluştu!", "error");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axiosInstance.delete("/users/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/login");
    } catch {
  showMessage("Hesap silinirken hata oluştu!", "error");
    }
  };

  const handleCloseDialog = () => {
  onClose();
  setOldPassword("");
  setNewPassword("");
  setNewUsername("");
  setNewEmail("");
  setSnackbarOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseDialog} 
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
          { key: "fullname", label: "Ad Soyad" },
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

  {activeTab === "fullname" && (
        <Box sx={{ backgroundColor: "#fff", borderRadius: "16px", p: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#6b0f1a" }}>
            Ad Soyad Değiştir
          </Typography>
          <TextField 
            fullWidth 
            label="Yeni Ad Soyad" 
            placeholder="Yeni ad soyadınızı girin"
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
            Ad Soyadı Kaydet
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
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
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
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Şifre Validasyon Kuralları */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: "#555", mb: 1, fontWeight: 600 }}>
              Yeni şifre şu kurallara uymalı:
            </Typography>
            <List dense sx={{ color: "#424242", fontSize: "0.9rem", pl: 0 }}>
              <ListItem sx={{ display: "flex", alignItems: "center", py: 0.5, px: 0 }}>
                {newPassword.length >= 8 && newPassword.length <= 20 ? (
                  <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                ) : (
                  <Cancel color="error" fontSize="small" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2">8–20 karakter arasında olmalı</Typography>
              </ListItem>
              <ListItem sx={{ display: "flex", alignItems: "center", py: 0.5, px: 0 }}>
                {/[A-Z]/.test(newPassword) ? (
                  <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                ) : (
                  <Cancel color="error" fontSize="small" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2">En az bir büyük harf içermeli</Typography>
              </ListItem>
              <ListItem sx={{ display: "flex", alignItems: "center", py: 0.5, px: 0 }}>
                {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                  <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                ) : (
                  <Cancel color="error" fontSize="small" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2">En az bir özel karakter içermeli (!@#$%^&*)</Typography>
              </ListItem>
            </List>
          </Box>
          <Button 
            fullWidth 
            variant="contained"
            disabled={
              !(
                newPassword.length >= 8 &&
                newPassword.length <= 20 &&
                /[A-Z]/.test(newPassword) &&
                /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) &&
                oldPassword.length > 0
              )
            }
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
              "&:disabled": { 
                background: "#ccc", 
                color: "#666",
                transform: "none",
                boxShadow: "none"
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
  <ProfileSnackbar open={snackbarOpen} message={snackbarText} severity={snackbarType} onClose={() => setSnackbarOpen(false)} />
  </Dialog>
  );
};

export default AccountSettingsDialog;
