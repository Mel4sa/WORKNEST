import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#3f51b5",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/">
          <img src={logo} alt="WORKNEST Logo" style={{ height: "40px" }} />
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
                color: "#ffffff",
                fontWeight: 500,
                transition: "0.3s",
                "&:hover": { backgroundColor: "#64b5f6" },
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
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "#43c1ebff",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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
              backgroundColor: "#00acc1",
              color: "#ffffff",
              borderRadius: "50px",
              padding: "6px 24px",
              textTransform: "uppercase",
              fontWeight: "bold",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "#26c6da",
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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