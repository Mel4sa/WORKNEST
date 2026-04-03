import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Snackbar,
  Typography,
  Chip,
  IconButton
} from "@mui/material";
import { GitHub, LinkedIn } from "@mui/icons-material";
import axios from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import InviteDialog from "../components/userProfile/InviteDialog";

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

  // Current user'ın sahip olduğu projeleri getir (davet için)
  // Kullanıcının lider veya üye olduğu projeleri getir
  const fetchUserProjects = useCallback(async () => {
    try {
      const response = await axios.get(`/projects/my-projects`);
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Projeler yüklenemedi:", err);
    }
  }, [userId]);

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

  const handleSendInvite = async () => {
    try {
      const inviteData = {
        projectId: selectedProject,
        receiverId: userId,
        message: inviteMessage || "Projeye katılmaya davet ediliyorsunuz!"
      };
      
      await axios.post("/invites/send", inviteData);
      
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
      const errorMessage = err.response?.data?.message || "Davet gönderilirken hata oluştu";
      
      setSnackbar({
        open: true,
        message: errorMessage,
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
      padding: { xs: "20px", md: "40px" }, 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc"
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        mb: 4,
        maxWidth: "900px",
        mx: "auto"
      }}>
        <Button 
          variant="text" 
          onClick={() => navigate(-1)}
          sx={{ 
            color: "#64748b",
            textTransform: "none",
            fontSize: "1rem",
            "&:hover": { color: "#6b0f1a" }
          }}
        >
          ← Geri Dön
        </Button>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button 
            variant="contained"
            onClick={() => setInviteDialogOpen(true)}
            sx={{ 
              background: "#6b0f1a",
              color: "#fff",
              fontWeight: "600",
              textTransform: "none",
              borderRadius: "6px",
              px: 4,
              "&:hover": { background: "#8c1c2b" }
            }}
          >
            Davet Et
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{
        maxWidth: "900px",
        mx: "auto"
      }}>
        {/* Profile Header with Avatar */}
        <Box sx={{
          padding: { xs: "20px", md: "30px" },
          textAlign: "center"
        }}>
          <Avatar
            src={user.profileImage}
            sx={{
              width: 100,
              height: 100,
              border: "3px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              fontSize: "2.5rem",
              fontWeight: "bold",
              bgcolor: "#6b0f1a",
              mx: "auto",
              mb: 2
            }}
          >
            {user.fullname?.[0]?.toUpperCase()}
          </Avatar>

          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: "700", 
              color: "#2c3e50",
              mb: 0.5
            }}
          >
            {user.fullname}
          </Typography>

          {/* Joined Date */}
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#94a3b8",
              display: "block",
              textAlign: "center",
              mb: 2
            }}
          >
            {new Date(user.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} tarihinde katıldı
          </Typography>

          {user.title && (
            <Typography 
              variant="body1" 
              sx={{ 
                color: "#64748b",
                mb: 1.5
              }}
            >
              {user.title}
            </Typography>
          )}

          {/* Social Links */}
          {((user.github && user.github.trim() !== "") || (user.linkedin && user.linkedin.trim() !== "")) ? (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2 }}>
              {user.github && user.github.trim() !== "" && (
                <IconButton
                  href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                  target="_blank"
                  sx={{ 
                    color: "#24292e",
                    "&:hover": { 
                      color: "#fff",
                      backgroundColor: "#24292e"
                    }
                  }}
                >
                  <GitHub />
                </IconButton>
              )}
              {user.linkedin && user.linkedin.trim() !== "" && (
                <IconButton
                  href={user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`}
                  target="_blank"
                  sx={{ 
                    color: "#0077b5",
                    "&:hover": { 
                      color: "#fff",
                      backgroundColor: "#0077b5"
                    }
                  }}
                >
                  <LinkedIn />
                </IconButton>
              )}
            </Box>
          ) : null}
        </Box>

        {/* Profile Content */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Education */}
          {(user.university || user.department) ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: "700", 
                color: "#2c3e50",
                mb: 1,
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px"
              }}>
                Eğitim
              </Typography>
              {user.university && (
                <Typography variant="body2" sx={{ color: "#2c3e50", mb: 0.5 }}>
                  {user.university}
                </Typography>
              )}
              {user.department && (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {user.department}
                </Typography>
              )}
            </Box>
          ) : null}

          {/* Bio */}
          {user.bio ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: "700", 
                color: "#2c3e50",
                mb: 1,
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px"
              }}>
                Hakkında
              </Typography>
              <Typography variant="body2" sx={{ 
                lineHeight: 1.6,
                color: "#475569"
              }}>
                {user.bio}
              </Typography>
            </Box>
          ) : null}

          {/* Skills */}
          {user.skills && user.skills.length > 0 ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: "700", 
                color: "#2c3e50",
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px"
              }}>
                Yetenekler
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {user.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: "#eef2ff",
                      color: "#4f46e5",
                      fontWeight: "500",
                      height: "28px"
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : null}

          {/* Kullanıcının Projeleri */}
          {projects && projects.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{
                fontWeight: "700",
                color: "#2c3e50",
                mb: 1.5,
                textTransform: "uppercase",
                fontSize: "0.8rem",
                letterSpacing: "0.5px"
              }}>
                Projeler
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {projects.map((project) => (
                  <Chip
                    key={project._id}
                    label={<span style={{ color: '#fff', fontWeight: 600 }}>{project.title}</span>}
                    clickable
                    onClick={() => navigate(`/projects/${project._id}`)}
                    sx={{
                      bgcolor: '#6b0f1a',
                      color: '#fff',
                      fontWeight: 600,
                      height: '32px',
                      border: '2px solid #6b0f1a',
                      fontSize: '1rem',
                      letterSpacing: '0.5px',
                      px: 2,
                      transition: 'background 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(107, 15, 26, 0.7)',
                        color: '#fff',
                        boxShadow: '0 2px 8px 0 rgba(107,15,26,0.10)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Davet Dialogu */}
      <InviteDialog
        open={inviteDialogOpen}
        onClose={() => {
          setInviteDialogOpen(false);
          setSelectedProject("");
          setInviteMessage("");
        }}
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        inviteMessage={inviteMessage}
        setInviteMessage={setInviteMessage}
        onSendInvite={handleSendInvite}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserProfile;