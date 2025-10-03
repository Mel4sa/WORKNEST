import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "transparent", // Tamamen saydam
        boxShadow: "none",
        backdropFilter: "blur(6px)", // Hafif blur efekti
        transition: "all 0.4s ease",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "inline-block",
              cursor: "pointer",
              "&:hover": { transform: "scale(1.05)" },
              transition: "transform 0.3s",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Anton', sans-serif",
                fontSize: "2rem",
                color: "#000", // Siyah yazı
                position: "relative",
                letterSpacing: "2px",
                textTransform: "uppercase",
                textShadow: `
                  1px 1px 0 #ccc,
                  2px 2px 0 #bbb
                `, // Hafif gölge ile okunabilirlik
                WebkitTextFillColor: "#000",
                transition: "all 0.3s ease",
              }}
            >
              WORKNEST
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: "flex", gap: 3 }}>
          {[
            { label: "Ana Sayfa", path: "/" },
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
                color: "#000", // Siyah yazı
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

        <Box sx={{ display: "flex", gap: 2 }}>
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

          <Button
            component={Link}
            to="/login"
            variant="contained"
            sx={{
              backgroundColor: "#d7401eff",
              color: "#fff",
              borderRadius: "50px",
              padding: "6px 24px",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#a03e1b",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
            }}
          >
            Giriş Yap
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;