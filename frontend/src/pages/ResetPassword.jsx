import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  List,
  ListItem,
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import axiosInstance from "../lib/axios";
import emailjs from "@emailjs/browser";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [expired, setExpired] = useState(false);
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const rules = {
    length: password.length >= 8 && password.length <= 20,
    upper: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);
  const isMatching = password === confirm && confirm.length > 0;
  const canSubmit = isPasswordValid && isMatching;

 
  const handleReset = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Şifre belirtilen kurallara uygun olmalı ve eşleşmelidir!");
      return;
    }

    try {
      console.log("Şifre sıfırlama token:", token);
      const res = await axiosInstance.post(
        `auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message || "Şifreniz başarıyla değiştirildi! Yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err);
      if (err.response?.status === 400 || err.response?.status === 404) {
        setExpired(true);
        setError("Şifre sıfırlama bağlantınız geçersiz veya süresi dolmuş.");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    }
  };

  // --- Yeni link gönderme işlemi ---
  const handleResend = async () => {
    if (!email.trim()) {
      setResendMessage("Lütfen e-posta adresinizi girin.");
      return;
    }

    try {
      // Backend'den yeni şifre sıfırlama linki al
      const res = await axiosInstance.post(
        "auth/resend-reset-link",
        { email: email.trim() }
      );
      
      const resetLink = res.data.resetLink;
      const fullname = res.data.fullname || "Kullanıcı";

      // EmailJS ile gerçek email gönder
      const templateParams = {
        to_email: email.trim(),
        to_name: fullname,
        message: `Yeni şifre sıfırlama bağlantınız: ${resetLink}`,
        reset_link: resetLink
      };

      await emailjs.send(
        import.meta.env.VITE_YOUR_SERVICE_ID,  
        import.meta.env.VITE_YOUR_TEMPLATE_ID, 
        templateParams,
        import.meta.env.VITE_YOUR_PUBLIC_KEY     
      );

      setResendMessage("Yeni şifre sıfırlama bağlantısı e-posta adresinize gönderildi!");
      setError("");
    } catch (err) {
      console.error("Resend reset link hatası:", err);
      if (err.response) {
        if (err.response.status === 404) {
          setResendMessage("E-posta bulunamadı. Lütfen doğru adres girin.");
        } else if (err.response.status === 400) {
          setResendMessage("Geçersiz istek. Lütfen tekrar deneyin.");
        } else {
          setResendMessage("Email gönderilemedi. Lütfen tekrar deneyin.");
        }
      } else {
        setResendMessage("Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
        overflow: "hidden",
      }}
    >
      <Card
        sx={{
          width: 420,
          borderRadius: 5,
          p: 2,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            color="#212121"
            gutterBottom
          >
            Yeni Şifre Belirle
          </Typography>

          {!expired ? (
            <Box component="form" onSubmit={handleReset} sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
              <TextField
                label="Yeni Şifre"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
              />

              <Box sx={{ mt: -2 }}>
                <Typography variant="body2" sx={{ color: "#555", mb: 0.5 }}>
                  Şifreniz şu kurallara uymalı:
                </Typography>
                <List dense sx={{ color: "#424242", fontSize: "0.9rem" }}>
                  <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {rules.length ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                    8–20 karakter arasında olmalı
                  </ListItem>
                  <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {rules.upper ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                    En az bir büyük harf içermeli
                  </ListItem>
                  <ListItem sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {rules.special ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                    En az bir özel karakter içermeli (!@#$%^&*)
                  </ListItem>
                </List>
              </Box>

              <TextField
                label="Yeni Şifre (Tekrar)"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
              />

              {error && <Typography color="error" textAlign="center">{error}</Typography>}
              {message && <Typography color="success.main" textAlign="center">{message}</Typography>}

              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                sx={{
                  backgroundColor: canSubmit ? "#003fd3ff" : "#ccc",
                  borderRadius: "50px",
                  py: 1.2,
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: canSubmit ? "#003fd3ff" : "#ccc" },
                }}
              >
                Şifreyi Güncelle
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <Typography textAlign="center" color="error" variant="body2">
                Şifre sıfırlama bağlantınız süresi dolmuş veya geçersiz.
              </Typography>
              <TextField
                label="E-posta adresiniz"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                sx={{ backgroundColor: "#003fd3ff", "&:hover": { backgroundColor: "#003fd3ff" } }}
                onClick={handleResend}
              >
                Yeni Link Gönder
              </Button>
              {resendMessage && <Typography textAlign="center" color="success.main">{resendMessage}</Typography>}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}