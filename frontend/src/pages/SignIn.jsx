import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import useAuthStore from "../store/useAuthStore";

function SignIn() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);

  // Şifre kurallarını kontrol et
  const passwordRules = {
    length: password.length >= 8 && password.length <= 20,
    uppercase: /[A-Z]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const handleSignUp = async () => {
    if (!Object.values(passwordRules).every(Boolean)) return;
    const success = await register(fullname, email, password);
    if (success) navigate("/login");
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
            Join the
            <br />
            <span style={{ color: "#ffd166" }}>Team!</span>
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
            Hemen üye olun ve projelerinizi birlikte gerçekleştirmenin gücünü 
            keşfedin. Takım arkadaşlarınızla birlikte başarıya ulaşın!
          </Typography>
        </Box>
      </Box>

      {/* SAĞ TARAF - SignIn */}
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
        {/* SignIn container - dikey ve yatay olarak ortalanmış */}
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

          {/* SignIn formu */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
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
            Kayıt Ol
          </Typography>

          <TextField
            label="Ad Soyad"
            fullWidth
            required
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            sx={{ 
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              }
            }}
          />

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
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              }
            }}
          />

          {/* Şifre Kuralları */}
          <Box sx={{ mb: 3 }}>
            <RuleItem
              text="8-20 karakter arası olmalı"
              valid={passwordRules.length}
            />
            <RuleItem
              text="En az 1 büyük harf içermeli"
              valid={passwordRules.uppercase}
            />
            <RuleItem
              text="En az 1 özel karakter (!@#$%^&*) içermeli"
              valid={passwordRules.symbol}
            />
          </Box>

          {error && (
            <Typography color="error" textAlign="center" mb={2}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={!Object.values(passwordRules).every(Boolean)}
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
            Kayıt Ol
          </Button>

          <Box sx={{ 
            display: "flex", 
            justifyContent: "center",
            mt: 1
          }}>
            <Button
              onClick={() => navigate("/login")}
              sx={{ 
                color: "#6b0f1a", 
                textTransform: "none",
                fontWeight: "500"
              }}
            >
              Zaten hesabın var mı? Giriş Yap
            </Button>
          </Box>
        </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ✅ Kuralların yanındaki ikon satırı
function RuleItem({ text, valid }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
      {valid ? (
        <CheckCircle sx={{ color: "green", fontSize: 18 }} />
      ) : (
        <Cancel sx={{ color: "red", fontSize: 18 }} />
      )}
      <Typography variant="body2" color={valid ? "green" : "text.secondary"}>
        {text}
      </Typography>
    </Box>
  );
}

export default SignIn;