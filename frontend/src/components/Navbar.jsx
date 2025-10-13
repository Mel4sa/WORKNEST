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
  TextField,
  InputAdornment,
  Autocomplete,
  Avatar,
  Paper,
  Popper,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Kişi arama fonksiyonu
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data || []);
      setSearchOpen(true);
    } catch (error) {
      console.error("Kullanıcı arama hatası:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Arama input değişimi
  const handleSearchChange = (event, newValue) => {
    setSearchQuery(newValue);
    if (newValue) {
      searchUsers(newValue);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  // Kullanıcı seçimi
  const handleUserSelect = (selectedUser) => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    navigate(`/user/${selectedUser._id}`);
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
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.4s ease",
        width: "100vw",
        margin: 0,
        padding: 0,
        left: 0,
        right: 0,
        top: 0,
        position: "fixed",
        overflow: "hidden",
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        width: "100vw",
        maxWidth: "100vw",
        px: { xs: 1, sm: 2, md: 3 },
        py: 0.5,
        minHeight: { xs: "56px", sm: "64px" },
        margin: 0,
        padding: { xs: "0.5rem 1rem", sm: "0.5rem 2rem", md: "0.5rem 3rem" },
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
        {/* Logo */}
        <Link to="/home" style={{ textDecoration: "none" }}>
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: "900",
              fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.7rem" },
              color: "#2c3e50",
              position: "relative",
              letterSpacing: { xs: "1px", md: "2px" },
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-3px",
                left: "0",
                width: "0%",
                height: "3px",
                background: "linear-gradient(90deg, #6b0f1a, #003fd3ff, #ffd166)",
                transition: "width 0.4s ease",
              },
              "&:hover": {
                color: "#1a252f",
                transform: "translateY(-2px)",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                "&::after": {
                  width: "100%",
                }
              }
            }}
          >
            WORKNEST
          </Typography>
        </Link>

        {/* Büyük ekran menü */}
        <Box sx={{ 
          display: { xs: "none", md: "flex" }, 
          gap: { md: 1, lg: 2 }, 
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          mx: { md: 1, lg: 2 }
        }}>
          {/* Menü butonları - Profilim hariç */}
          {menuItems.filter(item => item.label !== "Profilim").map((item) => (
            <Button
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                color: "#000",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: { md: "0.8rem", lg: "0.85rem" },
                px: { md: 1, lg: 1.5 },
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
          
          {/* Profilim butonu */}
          <Button
            component={Link}
            to="/profile"
            sx={{
              color: "#000",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: { md: "0.8rem", lg: "0.85rem" },
              px: { md: 1, lg: 1.5 },
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.05)",
                transform: "scale(1.05)",
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            Profilim
          </Button>
        </Box>

        {/* Sağ taraf - Arama ve Çıkış */}
        <Box sx={{ 
          display: { xs: "none", md: "flex" }, 
          gap: { md: 2, lg: 3 }, 
          alignItems: "center",
          flexShrink: 0
        }}>
          {/* Kişi Arama */}
          <Box sx={{ 
            position: "relative", 
            minWidth: { md: "180px", lg: "250px" }, 
            maxWidth: { md: "200px", lg: "280px" },
            mr: { md: 1, lg: 1.5 }
          }}>
            <Autocomplete
              freeSolo
              options={searchResults}
              inputValue={searchQuery}
              onInputChange={handleSearchChange}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === 'object') {
                  handleUserSelect(newValue);
                }
              }}
             getOptionLabel={(option) => {
  if (typeof option === 'string') return option;
  return option.fullname + (option.title ? ` (${option.title})` : '');
}}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box
                    component="li"
                    key={key}
                    {...otherProps}
                    onClick={() => handleUserSelect(option)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(107, 15, 26, 0.04)"
                      }
                    }}
                  >
                  <Avatar
                    src={option.profileImage}
                    sx={{ width: 40, height: 40 }}
                  >
                    {option.fullname?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: "#333",
                        lineHeight: 1.2
                      }}
                    >
                      {option.fullname}
                    </Typography>
                    {option.title && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 0.5,
                          lineHeight: 1.2
                        }}
                      >
                        {option.title}
                      </Typography>
                    )}
                    {option.university && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.75rem',
                          lineHeight: 1.2
                        }}
                      >
                        {option.university}
                      </Typography>
                    )}
                  </Box>
                </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Kişi ara..."
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#666" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchLoading ? (
                      <CircularProgress size={20} />
                    ) : null,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "25px",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      "&:hover fieldset": {
                        borderColor: "#6b0f1a",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6b0f1a",
                        borderWidth: "2px"
                      }
                    }
                  }}
                />
              )}
              noOptionsText="Kullanıcı bulunamadı"
              loadingText="Aranıyor..."
              open={searchOpen}
              onOpen={() => {
                if (searchQuery) setSearchOpen(true);
              }}
              onClose={() => setSearchOpen(false)}
            />
          </Box>

          {/* Çıkış Butonu */}
          {user && (
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                backgroundColor: "#8b0000",
                color: "#fff",
                borderRadius: "50px",
                padding: { md: "4px 12px", lg: "6px 16px" },
                textTransform: "none",
                fontWeight: "bold",
                fontSize: { md: "0.75rem", lg: "0.8rem" },
                minWidth: "auto",
                whiteSpace: "nowrap",
                "&:hover": {
                  backgroundColor: "#660000",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(139,0,0,0.4)",
                },
              }}
            >
              Çıkış Yap
            </Button>
          )}
        </Box>

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
          <Box sx={{ 
            width: { xs: 280, sm: 320 }, 
            p: 2, 
            position: "relative", 
            minHeight: "100%",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Mobil Arama */}
            <Box sx={{ mb: 3 }}>
              <Autocomplete
                freeSolo
                options={searchResults}
                inputValue={searchQuery}
                onInputChange={handleSearchChange}
                onChange={(event, newValue) => {
                  if (newValue && typeof newValue === 'object') {
                    setDrawerOpen(false);
                    handleUserSelect(newValue);
                  }
                }}
                getOptionLabel={(option) => 
                  typeof option === 'string' ? option : option.fullname || ''
                }
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...otherProps}
                      onClick={() => {
                        setDrawerOpen(false);
                        handleUserSelect(option);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(107, 15, 26, 0.04)"
                        }
                      }}
                    >
                      <Avatar
                        src={option.profileImage}
                        sx={{ width: 32, height: 32 }}
                      >
                        {option.fullname?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.fullname}
                        </Typography>
                        {option.title && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {option.title}
                          </Typography>
                        )}
                        {option.university && (
                          <Typography variant="caption" color="text.secondary">
                            {option.university}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Kişi ara..."
                    size="small"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#666" }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchLoading ? (
                        <CircularProgress size={20} />
                      ) : null,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": {
                          borderColor: "#6b0f1a",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#6b0f1a",
                          borderWidth: "2px"
                        }
                      }
                    }}
                  />
                )}
                noOptionsText="Kullanıcı bulunamadı"
                loadingText="Aranıyor..."
                open={searchOpen}
                onOpen={() => {
                  if (searchQuery) setSearchOpen(true);
                }}
                onClose={() => setSearchOpen(false)}
              />
            </Box>

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

            {/* Çıkış Yap butonu drawer'ın altında */}
            {user && (
              <Box sx={{ mt: "auto", pt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleLogout}
                  sx={{
                    backgroundColor: "#8b0000",
                    color: "#fff",
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: "bold",
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "#660000",
                      transform: "scale(1.02)",
                      boxShadow: "0 4px 12px rgba(139,0,0,0.4)",
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