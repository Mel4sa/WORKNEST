import {
  Dialog,
  Typography,
  Divider,
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  List,
  ListItem,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useState } from "react";
import axiosInstance from "../lib/axios";

export default function SettingsDialog({
  open,
  onClose,
  setSaveMessageText,
  setSaveMessageOpen,
}) {
  const [activeTab, setActiveTab] = useState("username");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleResetInputs = () => {
    setNewUsername("");
    setNewEmail("");
    setOldPassword("");
    setNewPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  const handleClose = () => {
    handleResetInputs();
    onClose();
  };

  const handleChangeUsername = async () => {
    try {
      await axiosInstance.put("/user/change-username", { newUsername });
      setSaveMessageText("Kullanıcı adı başarıyla güncellendi!");
      setSaveMessageOpen(true);
      handleClose();
    } catch (err) {
      console.error("❌ Kullanıcı adı güncellenemedi:", err);
    }
  };

  const handleChangeEmail = async () => {
    try {
      await axiosInstance.put("/user/change-email", { newEmail });
      setSaveMessageText("E-posta başarıyla güncellendi!");
      setSaveMessageOpen(true);
      handleClose();
    } catch (err) {
      console.error("❌ E-posta güncellenemedi:", err);
    }
  };

  const handleChangePassword = async () => {
    try {
      await axiosInstance.put("/user/change-password", {
        oldPassword,
        newPassword,
      });
      setSaveMessageText("Şifre başarıyla güncellendi!");
      setSaveMessageOpen(true);
      handleClose();
    } catch (err) {
      console.error("❌ Şifre güncellenemedi:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axiosInstance.delete("/user/delete-account");
      setSaveMessageText("Hesap başarıyla silindi!");
      setSaveMessageOpen(true);
      handleClose();
    } catch (err) {
      console.error("❌ Hesap silinemedi:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: 420, borderRadius: 4, p: 3, backgroundColor: "#fff" },
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, textAlign: "center", mb: 2 }}
      >
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

      {/* İçerik */}
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
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
        >
          <TextField
            fullWidth
            label="Eski Şifre"
            type={showOldPassword ? "text" : "password"}
            sx={{ mb: 2 }}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
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
            sx={{ mb: 2 }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#555", mb: 0.5 }}>
              Yeni şifre şu kurallara uymalı:
            </Typography>
            <List dense sx={{ color: "#424242", fontSize: "0.9rem" }}>
              <ListItem>
                {newPassword.length >= 8 && newPassword.length <= 20 ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Cancel color="error" fontSize="small" />
                )}
                &nbsp;8–20 karakter arasında olmalı
              </ListItem>
              <ListItem>
                {/[A-Z]/.test(newPassword) ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Cancel color="error" fontSize="small" />
                )}
                &nbsp;En az bir büyük harf içermeli
              </ListItem>
              <ListItem>
                {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Cancel color="error" fontSize="small" />
                )}
                &nbsp;En az bir özel karakter içermeli (!@#$%^&*)
              </ListItem>
            </List>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={
              !(
                newPassword.length >= 8 &&
                newPassword.length <= 20 &&
                /[A-Z]/.test(newPassword) &&
                /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
              )
            }
            sx={{
              background: "#003fd3ff",
              borderRadius: 2,
              py: 1.2,
              fontWeight: "bold",
              "&:hover": { background: "#002fa0" },
              "&:disabled": { background: "#ccc", color: "#666" },
              mb: 2,
            }}
          >
            Şifreyi Değiştir
          </Button>
        </Box>
      )}

      {activeTab === "delete" && (
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ mb: 2, color: "#a33" }}>
            Hesabınızı silmek istediğinize emin misiniz?
          </Typography>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ borderRadius: 2, mb: 2 }}
            onClick={handleDeleteAccount}
          >
            Hesabı Sil
          </Button>
        </Box>
      )}
    </Dialog>
  );
}