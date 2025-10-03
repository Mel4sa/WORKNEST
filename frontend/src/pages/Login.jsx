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
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore"; // ✅ zustand store'u bağladık

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // ✅ zustand'dan login fonksiyonu

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // backend'e istek atar & token kaydeder
      navigate("/profile"); // başarılıysa profil sayfasına yönlendir
    } catch (err) {
      console.error("Login failed:", err);
      setError("E-posta veya şifre hatalı");
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
        backgroundColor: "#1c1c1c",
        overflow: "hidden",
      }}
    >
      {/* SVG arka plan */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.1,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="100" cy="100" r="80" fill="#ca5125" />
          <circle cx="400" cy="200" r="120" fill="#915d56" />
          <circle cx="700" cy="500" r="100" fill="#ca5125" />
          <circle cx="200" cy="450" r="60" fill="#915d56" />
        </svg>
      </Box>

      {/* Login form */}
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
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            color="#212121"
            gutterBottom
          >
            Giriş Yap
          </Typography>

          {error && (
            <Typography color="error" textAlign="center" mb={2}>
              {error}
            </Typography>
          )}

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
          >
            <TextField
              label="E-posta"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                  color: "#212121",
                  "& fieldset": { borderColor: "#bdbdbd" },
                  "&:hover fieldset": { borderColor: "#757575" },
                  "&.Mui-focused fieldset": { borderColor: "#424242" },
                },
              }}
            />

            <TextField
              label="Şifre"
              type={showPassword ? "text" : "password"}
              variant="outlined"
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                  color: "#212121",
                  "& fieldset": { borderColor: "#bdbdbd" },
                  "&:hover fieldset": { borderColor: "#757575" },
                  "&.Mui-focused fieldset": { borderColor: "#424242" },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#d7401eff",
                color: "#ffffff",
                borderRadius: "50px",
                py: 1.2,
                fontWeight: "bold",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#d7401eff",
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                },
              }}
            >
              Giriş Yap
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Button
                onClick={() => navigate("/signin")}
                sx={{ fontSize: "0.9rem", color: "#424242", textTransform: "none" }}
              >
                Kayıt Ol
              </Button>
              <Button
                onClick={() => setOpenForgot(true)}
                sx={{ fontSize: "0.9rem", color: "#f44336", textTransform: "none" }}
              >
                Şifremi Unuttum?
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Şifremi Unuttum Pop-up */}
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
          <TextField label="E-posta" type="email" fullWidth variant="outlined" sx={{ mb: 2 }} />
          <Button
            fullWidth
            variant="contained"
            sx={{ backgroundColor: "#d7401eff", borderRadius: "50px", fontWeight: "bold", "&:hover": { backgroundColor: "#d7401eff" } }}
            onClick={() => setOpenForgot(false)}
          >
            Gönder
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default Login;
