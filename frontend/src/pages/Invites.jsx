import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Container,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  CheckCircle, 
  Cancel, 
  Schedule, 
  Visibility,
  PersonAdd,
  Email
} from "@mui/icons-material";
import axiosInstance from "../lib/axios";
import useAuthStore from "../store/useAuthStore";

export default function InvitesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Alınan, 1: Gönderilen
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSeverity, setMessageSeverity] = useState("success");
  
  const token = useAuthStore((state) => state.token);

  // API çağrıları
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        axiosInstance.get("/invites/received", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/invites/sent", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      console.log("🔍 Received invites data:", receivedRes.data);
      console.log("🔍 Sent invites data:", sentRes.data);
      
      // Her bir davet için message alanını kontrol et
      receivedRes.data.forEach(invite => {
        console.log(`📨 Invite ${invite._id}:`, {
          message: invite.message,
          messageType: typeof invite.message,
          messageLength: invite.message?.length
        });
      });
      
      setReceivedInvites(receivedRes.data);
      setSentInvites(sentRes.data);
    } catch (error) {
      console.error("Davetler yüklenemedi:", error);
      setMessage("Davetler yüklenirken hata oluştu");
      setMessageOpen(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInvites();
    }
  }, [token, fetchInvites]);

  const handleAccept = async (inviteId) => {
    try {
      console.log("✅ Davet kabul ediliyor:", inviteId);
      console.log("🔑 Token:", token ? "var" : "yok");
      console.log("🌐 URL:", `http://localhost:3000/api/invites/respond/${inviteId}`);
      
      const requestData = { action: "accepted" };
      console.log("📤 Gönderilen veri:", requestData);
      
      const response = await axiosInstance.patch(`/invites/respond/${inviteId}`, 
        requestData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ Kabul edildi:", response.data);
      setMessage("Davet başarıyla kabul edildi!");
      setMessageSeverity("success");
      setMessageOpen(true);
      fetchInvites(); // Listeyi yenile
    } catch (error) {
      console.error("Davet kabul edilemedi:", error);
      setMessage("Davet kabul edilirken hata oluştu");
      setMessageSeverity("error");
      setMessageOpen(true);
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      console.log("❌ Davet reddediliyor:", inviteId);
      const response = await axiosInstance.patch(`/invites/respond/${inviteId}`, 
        { action: "declined" },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log("❌ Reddedildi:", response.data);
      setMessage("Davet başarıyla reddedildi!");
      setMessageSeverity("error");
      setMessageOpen(true);
      fetchInvites(); 
    } catch (error) {
      console.error("Davet reddedilemedi:", error);
      setMessage("Davet reddedilirken hata oluştu");
      setMessageSeverity("error");
      setMessageOpen(true);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Başlık Bölümü */}
      <Box sx={{ 
        mb: 4, 
        textAlign: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        p: 4,
        color: "white",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          zIndex: 1
        }
      }}>
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: "800",
              mb: 2,
              fontSize: { xs: "2rem", md: "2.5rem" }
            }}
          >
            📬 Davetlerim
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              fontSize: { xs: "1rem", md: "1.2rem" }
            }}
          >
            Proje davetlerinizi yönetin ve yeni fırsatları keşfedin
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ 
        mb: 4,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
      }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              fontWeight: "600",
              fontSize: "1.1rem",
              py: 2,
              "&.Mui-selected": {
                color: "#6b0f1a"
              }
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#6b0f1a",
              height: "3px"
            }
          }}
        >
          <Tab 
            label="Alınan Davetler" 
            icon={<Email />}
            iconPosition="start"
          />
          <Tab 
            label="Gönderilen Davetler" 
            icon={<PersonAdd />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {tab === 0 ? (
        receivedInvites.length === 0 ? (
          <Card sx={{ 
            textAlign: "center", 
            p: 6,
            borderRadius: "16px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
          }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#666" }}>
              📭 Henüz alınan davetiniz yok
            </Typography>
            <Typography color="text.secondary">
              Projelere davet edildiğinizde burada görünecek
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {receivedInvites.map((invite) => (
              <Grid item xs={12} key={invite._id}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    border: invite.status === 'pending' ? "2px solid #e3f2fd" : "1px solid #e0e0e0",
                    "&:hover": { 
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
                      {/* Avatar */}
                      <Avatar 
                        src={invite.sender?.profileImage}
                        sx={{
                          width: 56,
                          height: 56,
                          cursor: "pointer",
                          border: "3px solid #fff",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                          "&:hover": {
                            transform: "scale(1.1)",
                            boxShadow: "0 4px 20px rgba(107, 15, 26, 0.3)"
                          },
                          transition: "all 0.2s ease"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${invite.sender?._id}`);
                        }}
                      >
                        {invite.sender?.fullname?.[0]}
                      </Avatar>

                      {/* İçerik */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontWeight: 600,
                              cursor: "pointer",
                              "&:hover": {
                                color: "#6b0f1a",
                                textDecoration: "underline"
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${invite.sender?._id}`);
                            }}
                          >
                            {invite.sender?.fullname}
                          </Typography>
                          
                          {/* Durum Chip'i */}
                          <Chip
                            icon={
                              invite.status === 'accepted' ? <CheckCircle /> :
                              invite.status === 'declined' ? <Cancel /> : <Schedule />
                            }
                            label={
                              invite.status === 'accepted' ? 'Kabul Edildi' :
                              invite.status === 'declined' ? 'Reddedildi' : 'Bekliyor'
                            }
                            size="small"
                            sx={{
                              fontWeight: 600,
                              ...(invite.status === 'accepted' && {
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
                                "& .MuiChip-icon": { color: "#2e7d32" }
                              }),
                              ...(invite.status === 'declined' && {
                                backgroundColor: "#ffebee",
                                color: "#c62828",
                                "& .MuiChip-icon": { color: "#c62828" }
                              }),
                              ...(invite.status === 'pending' && {
                                backgroundColor: "#fff3e0",
                                color: "#ef6c00",
                                "& .MuiChip-icon": { color: "#ef6c00" }
                              })
                            }}
                          />
                        </Box>

                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: "#6b0f1a", 
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          📋 {invite.project?.title}
                        </Typography>

                        <Box sx={{ 
                          backgroundColor: '#f8f9fa',
                          padding: 2,
                          borderRadius: 2,
                          border: '1px solid #e9ecef',
                          mb: 2
                        }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontStyle: 'italic', 
                              color: '#495057',
                              lineHeight: 1.6
                            }}
                          >
                            💬 "{invite.message || 'Projeye katılmaya davet ediliyorsunuz!'}"
                          </Typography>
                        </Box>

                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: "text.secondary",
                            display: "block",
                            mb: 2
                          }}
                        >
                          📅 {new Date(invite.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>

                        {/* Aksiyon Butonları */}
                        {invite.status === 'pending' ? (
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Projeyi İncele">
                              <IconButton
                                size="small"
                                onClick={() => handleViewProject(invite.project?._id)}
                                sx={{
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                  "&:hover": {
                                    backgroundColor: "#bbdefb"
                                  }
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleAccept(invite._id)}
                              sx={{
                                backgroundColor: "#4caf50",
                                color: "white",
                                fontWeight: 600,
                                "&:hover": {
                                  backgroundColor: "#388e3c"
                                }
                              }}
                            >
                              ✅ Kabul Et
                            </Button>
                            
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleDecline(invite._id)}
                              sx={{
                                borderColor: "#f44336",
                                color: "#f44336",
                                fontWeight: 600,
                                "&:hover": {
                                  backgroundColor: "#ffebee",
                                  borderColor: "#d32f2f"
                                }
                              }}
                            >
                              ❌ Reddet
                            </Button>
                          </Stack>
                        ) : (
                          <Button 
                            variant="outlined" 
                            size="small"
                            disabled
                            sx={{
                              fontWeight: 600,
                              ...(invite.status === 'accepted' && {
                                borderColor: "#4caf50",
                                color: "#4caf50"
                              }),
                              ...(invite.status === 'declined' && {
                                borderColor: "#f44336",
                                color: "#f44336"
                              })
                            }}
                          >
                            {invite.status === 'accepted' ? '✅ Kabul Edildi' : '❌ Reddedildi'}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : sentInvites.length === 0 ? (
        <Card sx={{ 
          textAlign: "center", 
          p: 6,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        }}>
          <Typography variant="h5" sx={{ mb: 2, color: "#666" }}>
            📤 Henüz gönderilen davetiniz yok
          </Typography>
          <Typography color="text.secondary">
            Başkalarını projelere davet ettiğinizde burada görünecek
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sentInvites.map((invite) => (
            <Grid item xs={12} key={invite._id}>
              <Card
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  border: invite.status === 'pending' ? "2px solid #e8f5e8" : "1px solid #e0e0e0",
                  "&:hover": { 
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
                    {/* Avatar */}
                    <Avatar 
                      src={invite.receiver?.profileImage}
                      sx={{
                        width: 56,
                        height: 56,
                        cursor: "pointer",
                        border: "3px solid #fff",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        "&:hover": {
                          transform: "scale(1.1)",
                          boxShadow: "0 4px 20px rgba(107, 15, 26, 0.3)"
                        },
                        transition: "all 0.2s ease"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${invite.receiver?._id}`);
                      }}
                    >
                      {invite.receiver?.fullname?.[0]}
                    </Avatar>

                    {/* İçerik */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Typography 
                          variant="h6"
                          sx={{ 
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": {
                              color: "#6b0f1a",
                              textDecoration: "underline"
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${invite.receiver?._id}`);
                          }}
                        >
                          {invite.receiver?.fullname}
                        </Typography>
                        
                        {/* Durum Chip'i */}
                        <Chip
                          icon={
                            invite.status === 'accepted' ? <CheckCircle /> :
                            invite.status === 'declined' ? <Cancel /> : <Schedule />
                          }
                          label={
                            invite.status === 'accepted' ? 'Kabul Edildi' :
                            invite.status === 'declined' ? 'Reddedildi' : 'Bekliyor'
                          }
                          size="small"
                          sx={{
                            fontWeight: 600,
                            ...(invite.status === 'accepted' && {
                              backgroundColor: "#e8f5e8",
                              color: "#2e7d32",
                              "& .MuiChip-icon": { color: "#2e7d32" }
                            }),
                            ...(invite.status === 'declined' && {
                              backgroundColor: "#ffebee",
                              color: "#c62828",
                              "& .MuiChip-icon": { color: "#c62828" }
                            }),
                            ...(invite.status === 'pending' && {
                              backgroundColor: "#fff3e0",
                              color: "#ef6c00",
                              "& .MuiChip-icon": { color: "#ef6c00" }
                            })
                          }}
                        />
                      </Box>

                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: "#6b0f1a", 
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        📋 {invite.project?.title}
                      </Typography>

                      <Box sx={{ 
                        backgroundColor: '#f8f9fa',
                        padding: 2,
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        mb: 2
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontStyle: 'italic', 
                            color: '#495057',
                            lineHeight: 1.6
                          }}
                        >
                          💬 "{invite.message || 'Projeye katılmaya davet ediliyorsunuz!'}"
                        </Typography>
                      </Box>

                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "text.secondary",
                          display: "block"
                        }}
                      >
                        📅 {new Date(invite.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Snackbar 
        open={messageOpen} 
        autoHideDuration={3000} 
        onClose={() => setMessageOpen(false)}
      >
        <Alert severity={messageSeverity}>{message}</Alert>
      </Snackbar>
    </Container>
  );
}