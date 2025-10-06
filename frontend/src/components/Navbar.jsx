import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleAuthButton = () => {
    if (user) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        backdropFilter: "blur(6px)",
        transition: "all 0.4s ease",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* WORKNEST Logo */}
        <Link to="/home" style={{ textDecoration: "none" }}>
          <Typography variant="h5" className="elegant-logo">
            WORKNEST
          </Typography>
        </Link>

        {/* Menü Linkleri */}
        <Box sx={{ display: "flex", gap: 3 }}>
          {[
            { label: "Ana Sayfa", path: "/home" },
            { label: "AI Analyzer", path: "/ai-analyzer" },
            { label: "Projelerim", path: "/projects" },
            { label: "Davetlerim", path: "/invites" },
            { label: "Profilim", path: "/profile" },
          ].map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                color: "#000",
                fontWeight: "bold",
                textTransform: "none",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.05)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Giriş / Kayıt / Çıkış Butonları */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {!user && (
            <Button
              component={Link}
              to="/signin"
              variant="contained"
              sx={{
                backgroundColor: "#915d56",
                color: "#fff",
                borderRadius: "50px",
                padding: "6px 24px",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#7a4b45",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                },
              }}
            >
              Kayıt Ol
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleAuthButton}
            sx={{
              backgroundColor: user ? "#f44336" : "#d7401e",
              color: "#fff",
              borderRadius: "50px",
              padding: "6px 24px",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: user ? "#d32f2f" : "#a03e1b",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
            }}
          >
            {user ? "Çıkış Yap" : "Giriş Yap"}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;