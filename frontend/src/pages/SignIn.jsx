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
      {/* Arka Plan SVG */}
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
          <circle cx="150" cy="100" r="80" fill="#ca5125" />
          <circle cx="450" cy="250" r="120" fill="#915d56" />
          <circle cx="700" cy="500" r="100" fill="#ca5125" />
          <circle cx="200" cy="450" r="60" fill="#915d56" />
        </svg>
      </Box>

      {/* Kart */}
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
          <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
            Kayıt Ol
          </Typography>

          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
          >
            <TextField
              label="Ad Soyad"
              fullWidth
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
            />

            <TextField
              label="E-posta"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
            />

            {/* Şifre Kuralları */}
            <Box sx={{ mt: -2 }}>
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
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!Object.values(passwordRules).every(Boolean)}
              sx={{
                backgroundColor: "#915d56d3",
                color: "#fff",
                borderRadius: "50px",
                py: 1.2,
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
                },
              }}
            >
              Kayıt Ol
            </Button>
          </Box>
        </CardContent>
      </Card>
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