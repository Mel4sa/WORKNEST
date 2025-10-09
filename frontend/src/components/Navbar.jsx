import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { label: "Ana Sayfa", path: "/home" },
    { label: "AI Analyzer", path: "/ai-analyzer" },
    { label: "Projelerim", path: "/projects" },
    { label: "Davetlerim", path: "/invites" },
    { label: "Profilim", path: "/profile" },
  ];

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
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <Link to="/home" style={{ textDecoration: "none" }}>
          <Typography variant="h5" className="elegant-logo">
            WORKNEST
          </Typography>
        </Link>

        {/* Büyük ekran menü */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {menuItems.map((item) => (
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
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Sadece çıkış butonu */}
        {user && (
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                backgroundColor: "#ff0000",
                color: "#fff",
                borderRadius: "50px",
                padding: "6px 24px",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#cc0000",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                },
              }}
            >
              Çıkış Yap
            </Button>
          </Box>
        )}

        {/* Küçük ekran hamburger */}
        <IconButton
          sx={{
            display: { xs: "flex", md: "none" },
            color: "#000",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.05)",
              transform: "scale(1.1)",
              transition: "all 0.2s ease-in-out",
            },
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        {/* Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 250, p: 2, position: "relative", minHeight: "100%" }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Çıkış Yap butonu sağ altta */}
            {user && (
              <Box sx={{ position: "absolute", bottom: 45, right: 16, width: "calc(100% - 32px)" }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleLogout}
                  sx={{
                    backgroundColor: "#ff0000",
                    color: "#fff",
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#cc0000",
                      transform: "scale(1.05)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  Çıkış Yap
                </Button>
              </Box>
            )}
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;