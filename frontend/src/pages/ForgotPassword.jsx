import { Box, Button, TextField, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const handleReset = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
      }}
    >
      <Card
        sx={{
          width: 400,
          boxShadow: 6,
          borderRadius: 5,
          p: 3,
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(6px)",
        }}
      >
        <CardContent>
          <Typography variant="h5" textAlign="center" fontWeight="bold" color="#8d6e63" gutterBottom>
            Şifremi Unuttum
          </Typography>

          <Typography textAlign="center" sx={{ fontSize: "0.9rem", color: "gray", mb: 3 }}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </Typography>

          <TextField label="E-posta" type="email" fullWidth sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: "50px" } }} />
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#8d6e63",
              color: "#fff",
              borderRadius: "50px",
              py: 1.2,
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#a1887f" },
            }}
            onClick={handleReset}
          >
            Sıfırlama Linki Gönder
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ForgotPassword;