import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider
} from "@mui/material";
import { GitHub, LinkedIn, ArrowBack } from "@mui/icons-material";
import axios from "../lib/axios";
import useAuthStore from "../store/useAuthStore";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/profile/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error("Profil yüklenemedi:", err);
      setError("Profil yüklenemedi. Kullanıcı bulunamadı veya profil gizli.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, fetchUserProfile]);

  // Eğer kendi profilini görmeye çalışıyorsa, normal Profile sayfasına yönlendir
  useEffect(() => {
    if (currentUser && userId === currentUser._id) {
      navigate("/profile");
    }
  }, [currentUser, userId, navigate]);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "80vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: "40px", minHeight: "80vh" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ padding: "40px", minHeight: "80vh", textAlign: "center" }}>
        <Typography variant="h5">Kullanıcı bulunamadı!</Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: "40px", 
      minHeight: "100vh", 
      backgroundColor: "#fafbfc",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Geri Dön Butonu */}
      <Box sx={{ width: "100%", maxWidth: "800px", mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ 
            background: "#4a0d16",
            color: "#fff",
            fontWeight: "600",
            borderRadius: "12px",
            px: 3,
            py: 1.5,
            "&:hover": {
              background: "#5c1119",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(74, 13, 22, 0.3)"
            },
            transition: "all 0.3s ease"
          }}
        >
          Geri Dön
        </Button>
      </Box>

      {/* Profil Kartı */}
      <Card sx={{
        width: "100%",
        maxWidth: "800px",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "visible",
        position: "relative",
        mt: 4
      }}>
        {/* Profil Avatar */}
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          top: "-50px",
          left: 0,
          right: 0,
          zIndex: 10
        }}>
          <Avatar
            src={user.profileImage}
            sx={{
              width: 120,
              height: 120,
              border: "6px solid white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              fontSize: "3rem",
              fontWeight: "bold",
              bgcolor: "#6b0f1a"
            }}
          >
            {user.fullname?.[0]?.toUpperCase()}
          </Avatar>
        </Box>

        <CardContent sx={{ pt: 8, pb: 4 }}>
          {/* Kullanıcı Bilgileri */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: "bold", 
              color: "#2c3e50",
              mb: 1
            }}>
              {user.fullname}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: "#6b0f1a", 
              fontWeight: "600",
              mb: 1
            }}>
              @{user.username}
            </Typography>
            {user.title && (
              <Typography variant="body1" sx={{ 
                color: "#666",
                fontStyle: "italic"
              }}>
                {user.title}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Eğitim Bilgileri */}
          {(user.university || user.department) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: "600", 
                color: "#2c3e50",
                mb: 2
              }}>
                Eğitim
              </Typography>
              {user.university && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  🎓 {user.university}
                </Typography>
              )}
              {user.department && (
                <Typography variant="body1" sx={{ color: "#666" }}>
                  📚 {user.department}
                </Typography>
              )}
            </Box>
          )}

          {/* Hakkında */}
          {user.bio && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: "600", 
                color: "#2c3e50",
                mb: 2
              }}>
                Hakkında
              </Typography>
              <Typography variant="body1" sx={{ 
                lineHeight: 1.8,
                color: "#555"
              }}>
                {user.bio}
              </Typography>
            </Box>
          )}

          {/* Yetenekler */}
          {user.skills && user.skills.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: "600", 
                color: "#2c3e50",
                mb: 2
              }}>
                Yetenekler
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {user.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    sx={{
                      bgcolor: "#f0f9ff",
                      color: "#0369a1",
                      fontWeight: "500",
                      borderRadius: "8px",
                      "&:hover": {
                        bgcolor: "#e0f2fe"
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Sosyal Medya Linkleri */}
          {(user.github || user.linkedin) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: "600", 
                color: "#2c3e50",
                mb: 2
              }}>
                Sosyal Medya
              </Typography>
              <Stack direction="row" spacing={2}>
                {user.github && (
                  <Button
                    href={user.github}
                    target="_blank"
                    startIcon={<GitHub />}
                    variant="outlined"
                    sx={{
                      borderColor: "#24292e",
                      color: "#24292e",
                      "&:hover": {
                        backgroundColor: "#24292e",
                        color: "white"
                      }
                    }}
                  >
                    GitHub
                  </Button>
                )}
                {user.linkedin && (
                  <Button
                    href={user.linkedin}
                    target="_blank"
                    startIcon={<LinkedIn />}
                    variant="outlined"
                    sx={{
                      borderColor: "#0077b5",
                      color: "#0077b5",
                      "&:hover": {
                        backgroundColor: "#0077b5",
                        color: "white"
                      }
                    }}
                  >
                    LinkedIn
                  </Button>
                )}
              </Stack>
            </Box>
          )}

          {/* Üyelik Tarihi */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} tarihinde katıldı
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserProfile;
