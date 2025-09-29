import { Box, Button, TextField, Typography, Card, CardContent, InputAdornment, IconButton } from "@mui/material";
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
        background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
      }}
    >
      <Card
        sx={{
          width: 450,
          borderRadius: 5,
          p: 3,
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          },
        }}
      >
        <CardContent>
          <Typography variant="h5" textAlign="center" fontWeight="bold" color="#000000ff" gutterBottom>
            Kayıt Ol
          </Typography>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
            <TextField label="Ad Soyad" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }} />

            <TextField label="E-posta" type="email" fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }} />

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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
            />

            <TextField
              label="Şifreyi Onayla"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "50px" } }}
            />

            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#8d6e63",
                color: "#fff",
                borderRadius: "50px",
                py: 1.3,
                fontWeight: "bold",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#a1887f",
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