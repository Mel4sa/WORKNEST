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
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/login");
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
          <circle cx="150" cy="100" r="80" fill="#ca5125" />
          <circle cx="450" cy="250" r="120" fill="#915d56" />
          <circle cx="700" cy="500" r="100" fill="#ca5125" />
          <circle cx="200" cy="450" r="60" fill="#915d56" />
        </svg>
      </Box>

      <Card
        sx={{
          width: 400, // Login ile aynı genişlik
          borderRadius: 5,
          p: 2,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)", // Login ile aynı gölge
          position: "relative",
          zIndex: 1,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          },
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
            Kayıt Ol
          </Typography>

          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
          >
            <TextField
              label="Ad Soyad"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "50px" },
              }}
            />

            <TextField
              label="E-posta"
              type="email"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "50px" },
              }}
            />

            <TextField
              label="Şifre"
              type={showPassword ? "text" : "password"}
              fullWidth
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
                "& .MuiOutlinedInput-root": { borderRadius: "50px" },
              }}
            />

            <TextField
              label="Şifreyi Onayla"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "50px" },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#915d56d3",
                color: "#fff",
                borderRadius: "50px",
                py: 1.2,
                fontWeight: "bold",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#915d56d3",
                  transform: "scale(1.05)",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
                },
              }}
              onClick={handleSignUp}
            >
              Kayıt Ol
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SignIn;