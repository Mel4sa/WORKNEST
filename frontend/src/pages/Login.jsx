import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Modal,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useAuthStore from "../store/useAuthStore";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/profile");
  };

  const handleForgot = async () => {
    if (!forgotEmail) return setModalError("Lütfen e-posta girin.");

    setLoading(true);
    setModalError("");
    try {
      // API çağrısı burada yapılacak
      // await axiosInstance.post("/auth/forgot-password", { email: forgotEmail });
      setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      setForgotEmail("");
    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err);
      setModalError("Böyle bir kullanıcı bulunamadı veya mail gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

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
      left: 0
    }}>
      {/* SOL TARAF - Slogan (sadece desktop'ta görünür) */}
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
          <Typography
            variant="h1"
            sx={{ 
              fontWeight: "bold", 
              mb: 4, 
              lineHeight: 1.1,
              fontSize: { md: "3.5rem", lg: "4.5rem" }
            }}
          >
            Work better.
            <br />
            <span style={{ color: "#ffd166" }}>Together.</span>
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              maxWidth: 600, 
              opacity: 0.9, 
              lineHeight: 1.5,
              fontSize: { md: "1.3rem", lg: "1.5rem" }
            }}
          >
            Farklı insanların birlikte fikirlerini hayata geçirebildiği bir proje
            yönetim alanına HOŞ GELDİNİZ! Hemen giriş yaparak takımını oluştur ve
            projeni büyüt!
          </Typography>
        </Box>
      </Box>

      {/* SAĞ TARAF - Login */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          width: { xs: "100%", md: "50%" },
          backgroundColor: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 2, sm: 4, md: 6 },
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {/* Login container - dikey ve yatay olarak ortalanmış */}
        <Box sx={{ 
          width: "100%", 
          maxWidth: 450,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          py: 4
        }}>
          {/* Mobile header */}
          <Box 
            sx={{ 
              display: { xs: "block", md: "none" }, 
              textAlign: "center", 
              mb: 4, 
              mt: 2 
            }}
          >
            <Typography
              variant="h4"
              sx={{ 
                fontWeight: "bold", 
                mb: 1, 
                color: "#6b0f1a" 
              }}
            >
              WorkNest
            </Typography>
            <Typography
              variant="body1"
              sx={{ 
                color: "#666", 
                mb: 3 
              }}
            >
              Ekibinle birlikte büyü!
            </Typography>
          </Box>

          {/* Login kutusu */}
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              width: "100%",
              backgroundColor: "transparent",
              borderRadius: 0,
              boxShadow: "none",
              p: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
            }}
          >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            mb={3}
            color="#6b0f1a"
          >
            Giriş Yap
          </Typography>

          <TextField
            label="E-posta"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ 
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              }
            }}
          />

          <TextField
            label="Şifre"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
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
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              }
            }}
          />

          {loginError && (
            <Typography color="error" textAlign="center" mb={2}>
              {loginError}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              backgroundColor: "#003fd3ff",
              color: "#fff",
              py: 1.5,
              fontWeight: "bold",
              borderRadius: "50px",
              "&:hover": { backgroundColor: "#0056b3" },
              mb: 3,
              fontSize: "1.1rem",
            }}
          >
            Giriş Yap
          </Button>

          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 }
          }}>
            <Button
              onClick={() => navigate("/signin")}
              sx={{ 
                color: "#000", 
                textTransform: "none",
                fontWeight: "500"
              }}
            >
              Kayıt Ol
            </Button>
            <Button
              onClick={() => setOpenForgot(true)}
              sx={{ 
                color: "#6b0f1a", 
                textTransform: "none",
                fontWeight: "500"
              }}
            >
              Şifremi Unuttum
            </Button>
          </Box>
        </Box>
        </Box>
      </Box>

      {/* Şifremi Unuttum Modal */}
      <Modal
        open={openForgot}
        onClose={() => {
          setOpenForgot(false);
          setForgotEmail("");
          setMessage("");
          setModalError("");
        }}
      >
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
            textAlign: "center",
          }}
        >
          {!message ? (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#6b0f1a" }}>
                Şifremi Unuttum
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Şifrenizi sıfırlamak için e-posta adresinizi giriniz.
              </Typography>

              <TextField
                label="E-posta"
                type="email"
                fullWidth
                sx={{ 
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  }
                }}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleForgot();
                }}
              />

              {modalError && (
                <Typography color="error" sx={{ mb: 1 }}>
                  {modalError}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#003fd3ff",
                  borderRadius: "50px",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#0056b3" },
                }}
                onClick={handleForgot}
              >
                {loading ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#dff5e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Typography variant="h4" color="success.main">
                  ✔
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Başarılı
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#003fd3ff",
                  borderRadius: "50px",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#0056b3" },
                }}
                onClick={() => {
                  setOpenForgot(false);
                  setForgotEmail("");
                  setMessage("");
                  setModalError("");
                }}
              >
                Tamam
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}