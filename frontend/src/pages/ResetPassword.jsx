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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosInstance from "../lib/axios";



export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message || "Şifreniz başarıyla değiştirildi! Yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Geçersiz veya süresi dolmuş bağlantı.");
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
        <svg width="100%" height="100%" viewBox="0 0 800 600">
          <circle cx="100" cy="100" r="80" fill="#ca5125" />
          <circle cx="400" cy="200" r="120" fill="#915d56" />
          <circle cx="700" cy="500" r="100" fill="#ca5125" />
          <circle cx="200" cy="450" r="60" fill="#915d56" />
        </svg>
      </Box>

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
            Yeni Şifre Belirle
          </Typography>

          <Box
            component="form"
            onSubmit={handleReset}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
          >
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                  "& fieldset": { borderColor: "#bdbdbd" },
                  "&:hover fieldset": { borderColor: "#757575" },
                  "&.Mui-focused fieldset": { borderColor: "#424242" },
                },
              }}
            />

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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                  "& fieldset": { borderColor: "#bdbdbd" },
                  "&:hover fieldset": { borderColor: "#757575" },
                  "&.Mui-focused fieldset": { borderColor: "#424242" },
                },
              }}
            />

            {error && (
              <Typography color="error" textAlign="center">
                {error}
              </Typography>
            )}
            {message && (
              <Typography color="success.main" textAlign="center">
                {message}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#d7401eff",
                borderRadius: "50px",
                py: 1.2,
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#d7401eff" },
              }}
            >
              Şifreyi Güncelle
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}            