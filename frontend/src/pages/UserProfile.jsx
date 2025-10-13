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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar
} from "@mui/material";
import { GitHub, LinkedIn, ArrowBack, Send } from "@mui/icons-material";
import axios from "../lib/axios";
import useAuthStore from "../store/useAuthStore";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Kullanıcının projelerini getir
  const fetchUserProjects = useCallback(async () => {
    try {
      const response = await axios.get("/projects");
      setProjects(response.data.filter(project => project.owner === currentUser?._id));
    } catch (err) {
      console.error("Projeler yüklenemedi:", err);
    }
  }, [currentUser?._id]);

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
      fetchUserProjects();
    }
  }, [userId, fetchUserProfile, fetchUserProjects]);

  // Davet gönderme fonksiyonu
  const handleSendInvite = async () => {
    try {
      await axios.post("/invitations", {
        projectId: selectedProject,
        userId: userId,
        message: inviteMessage || "Projeye katılmaya davet ediliyorsunuz!"
      });
      
      setSnackbar({
        open: true,
        message: "Davet başarıyla gönderildi!",
        severity: "success"
      });
      
      setInviteDialogOpen(false);
      setSelectedProject("");
      setInviteMessage("");
    } catch (err) {
      console.error("Davet gönderilemedi:", err);
      setSnackbar({
        open: true,
        message: "Davet gönderilemedi. Tekrar deneyin.",
        severity: "error"
      });
    }
  };

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
      {/* Geri Dön ve Davet At Butonları */}
      <Box sx={{ 
        width: "100%", 
        maxWidth: "800px", 
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
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

        {/* Davet At Butonu */}
        <Button 
          variant="contained" 
          startIcon={<Send />}
          onClick={() => setInviteDialogOpen(true)}
          sx={{ 
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            color: "#fff",
            fontWeight: "600",
            borderRadius: "12px",
            px: 3,
            py: 1.5,
            "&:hover": {
              background: "linear-gradient(45deg, #1976D2 30%, #0288D1 90%)",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(33, 150, 243, 0.3)"
            },
            transition: "all 0.3s ease"
          }}
        >
          Projeye Davet Et
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

      {/* Davet Dialog'u */}
      <Dialog 
        open={inviteDialogOpen} 
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {user?.fullname} kullanıcısını projeye davet et
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Proje Seçin</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Proje Seçin"
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Davet Mesajı (İsteğe bağlı)"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Projeye katılmaya davet ediliyorsunuz!"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setInviteDialogOpen(false)}
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleSendInvite}
            variant="contained"
            disabled={!selectedProject}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #0288D1 90%)"
              }
            }}
          >
            Davet Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default UserProfile;
