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

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/profile");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
      }}
    >
      <Card
        sx={{
          width: 400,
          borderRadius: 5,
          p: 2,
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          "&:hover": { transform: "scale(1.02)" },
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

          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
          >
            <TextField
              label="E-posta"
              type="email"
              variant="outlined"
              fullWidth
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                    >
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
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#8d6e63",
                color: "#ffffff",
                borderRadius: "50px",
                py: 1.2,
                fontWeight: "bold",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#a1887f",
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                },
              }}
              onClick={handleLogin}
            >
              Giriş Yap
            </Button>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Button
                onClick={() => navigate("/signin")}
                sx={{
                  fontSize: "0.9rem",
                  color: "#424242",
                  textTransform: "none",
                }}
              >
                Kayıt Ol
              </Button>
              <Button
                onClick={() => setOpenForgot(true)}
                sx={{
                  fontSize: "0.9rem",
                  color: "#f44336",
                  textTransform: "none",
                }}
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
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#212121"
            textAlign="center"
            gutterBottom
          >
            Şifremi Unuttum
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={2}
          >
            Şifrenizi sıfırlamak için e-posta adresinizi giriniz.
          </Typography>
          <TextField
            label="E-posta"
            type="email"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#8d6e63",
              borderRadius: "50px",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#a1887f" },
            }}
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