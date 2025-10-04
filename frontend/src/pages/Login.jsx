import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Modal,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useAuthStore from "../store/useAuthStore";
import emailjs from "@emailjs/browser";
import axiosInstance from "../lib/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const [openForgot, setOpenForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loginError = useAuthStore((state) => state.error);


  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) navigate("/profile");
  };

const handleForgot = async () => {
  if (!forgotEmail) return setModalError("Lütfen e-posta girin.");

  setLoading(true);
  setMessage("");       // Önce mesajı temizle
  setModalError("");    // Önce hata mesajını temizle

  try {
    const res = await axiosInstance.post("/auth/forgot-password", { email: forgotEmail });
    console.log("Backend response:", res.data);

    const resetLink = res.data.resetLink;
    const fullname = res.data.fullname || forgotEmail;

    await emailjs.send(
      import.meta.env.VITE_YOUR_SERVICE_ID,
      import.meta.env.VITE_YOUR_TEMPLATE_ID,
      {
        to_email: forgotEmail,
        fullname,
        reset_link: resetLink,
      },
      import.meta.env.VITE_YOUR_PUBLIC_KEY
    );

    setMessage("Şifre sıfırlama maili gönderildi. Lütfen e-postanı kontrol et!");
    setForgotEmail("");
  } catch (err) {
    console.error("Şifre sıfırlama hatası:", err);

    // Axios yanıtı varsa mesajı buradan al
    const msg =
      err.response?.status === 404
        ? "Böyle bir kullanıcı bulunamadı."
        : "Mail gönderilemedi, lütfen tekrar deneyin.";

    setModalError(msg);
  } finally {
    setLoading(false);
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
      {/* SVG Arka Plan */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.15,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <circle cx="100" cy="100" r="80" fill="#ca5125" />
          <circle cx="400" cy="200" r="120" fill="#915d56" />
          <circle cx="700" cy="500" r="100" fill="#ca5125" />
          <circle cx="200" cy="450" r="60" fill="#915d56" />
        </svg>
      </Box>

      {/* Login Card */}
      <Card
        sx={{
          width: 400,
          borderRadius: 5,
          p: 2,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" textAlign="center" fontWeight="bold" color="#212121" gutterBottom>
            Giriş Yap
          </Typography>

          {/* Login Form */}
          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
          >
            <TextField
              label="E-posta"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Şifre"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {loginError && (
              <Typography color="error" textAlign="center">
                {loginError}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "#d7401e", borderRadius: "50px", py: 1.2, fontWeight: "bold" }}
            >
              Giriş Yap
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Button onClick={() => navigate("/signin")} sx={{ fontSize: "0.9rem" }}>
                Kayıt Ol
              </Button>
              <Button
                onClick={() => setOpenForgot(true)}
                sx={{ fontSize: "0.9rem", color: "#f44336" }}
              >
                Şifremi Unuttum?
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 🔸 Şifremi Unuttum Modal */}
      <Modal open={openForgot} onClose={() => setOpenForgot(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
            Şifremi Unuttum
          </Typography>

          <Typography variant="body2" textAlign="center" color="text.secondary" mb={2}>
            Şifrenizi sıfırlamak için e-posta adresinizi giriniz.
          </Typography>

          <TextField
            label="E-posta"
            type="email"
            fullWidth
            sx={{ mb: 2 }}
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />

          {modalError && (
            <Typography color="error" textAlign="center" sx={{ mb: 1 }}>
              {modalError}
            </Typography>
          )}
          {message && (
            <Typography color="success.main" textAlign="center" sx={{ mb: 1 }}>
              {message}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#d7401e",
              borderRadius: "50px",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#d7401e" },
            }}
            onClick={handleForgot}
          >
            {loading ? "Gönderiliyor..." : "Gönder"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
