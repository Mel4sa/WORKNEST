import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #2c2c2c, #555555, #c9c1c1ff)", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        transition: "all 0.4s ease",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1.5rem", letterSpacing: 2 }}>
            WORKNEST
          </Box>
        </Link>

        <Box sx={{ display: "flex", gap: 3 }}>
          {[
            { label: "Ana Sayfa", path: "/" },
            { label: "Profilim", path: "/profile" },
            { label: "Projelerim", path: "/projects" },
            { label: "Davetlerim", path: "/invites" },
          ].map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                color: "#f5f5f5",
                fontWeight: 500,
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
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
  variant="outlined"
  sx={{
    color: "#ffffff",
    borderColor: "#ffffff",
    borderRadius: "50px",
    padding: "6px 24px",
    textTransform: "uppercase",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.25)", 
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.4)",
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
              backgroundColor: "#8d6e63", 
              color: "#ffffff",
              borderRadius: "50px",
              padding: "6px 24px",
              textTransform: "uppercase",
              fontWeight: "bold",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "#a1887f", 
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