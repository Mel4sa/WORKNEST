import { useEffect, useState, useCallback, useRef } from "react";
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
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  Visibility
} from "@mui/icons-material";
import axiosInstance from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import socket from "../lib/socket";
import ProfileSnackbar from "../components/profile/ProfileSnackbar";

export default function InvitesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); 
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSeverity, setMessageSeverity] = useState("success");
  
  const token = useAuthStore((state) => state.token);
  const { user } = useAuthStore();
  const socketRef = useRef(null);

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
      
      
      receivedRes.data.forEach(invite => {
        if (typeof invite.message === "undefined" || invite.message === null) {
          invite.message = "";
        }
      });
      
  setReceivedInvites(receivedRes.data.filter(invite => invite.status === 'pending'));
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

  useEffect(() => {
    if (!user?._id) return;
    if (socketRef.current) return; 

    socket.emit("join", user._id);
    socketRef.current = socket;

    socket.on("invite:new", () => {
      fetchInvites();
    });
    socket.on("invite:updated", () => {
      fetchInvites();
    });
    socket.on("invite:deleted", () => {
      fetchInvites();
    });

    return () => {
      socket.off("invite:new");
      socket.off("invite:updated");
      socket.off("invite:deleted");
      socketRef.current = null;
    };
  }, [user?._id, fetchInvites]);

  const handleAccept = async (inviteId) => {
    try {
      setReceivedInvites(prev => prev.filter(invite => invite._id !== inviteId));
      const requestData = { action: "accepted" };
      await axiosInstance.patch(`/invites/respond/${inviteId}`, 
        requestData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setMessage("Davet başarıyla kabul edildi!");
      setMessageSeverity("success");
      setMessageOpen(true);
      fetchInvites(); 
    } catch (error) {
      console.error("Davet kabul edilirken hata oluştu:", error);
      setMessage("Davet kabul edilirken hata oluştu");
      setMessageSeverity("error");
      setMessageOpen(true);
      fetchInvites(); 
    }
  };
  const handleDecline = async (inviteId) => {
    try {
      setReceivedInvites(prev => prev.filter(invite => invite._id !== inviteId));
      await axiosInstance.patch(`/invites/respond/${inviteId}`, 
        { action: "declined" },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMessage("Davet reddedildi!");
      setMessageSeverity("error");
      setMessageOpen(true);
      fetchInvites(); 
    } catch (error) {
      console.error("Davet reddedilirken hata oluştu:", error);
      setMessage("Davet reddedilirken hata oluştu");
      setMessageSeverity("error");
      setMessageOpen(true);
      fetchInvites();
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
      <Box sx={{ 
        mb: 4, 
        textAlign: "center",
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: "700",
            mb: 1,
            fontSize: { xs: "1.8rem", md: "2.5rem" },
            color: "#2c3e50"
          }}
        >
          Davetlerim
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: "#64748b",
            fontSize: { xs: "0.95rem", md: "1.1rem" }
          }}
        >
          Proje davetlerinizi yönetin
        </Typography>
      </Box>

      <Paper sx={{ 
        mb: 4,
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            backgroundColor: "#f8fafc",
            "& .MuiTab-root": {
              fontWeight: "500",
              fontSize: "1rem",
              py: 1.5,
              textTransform: "none",
              color: "#64748b",
              "&.Mui-selected": {
                color: "#6b0f1a"
              }
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#6b0f1a",
              height: "2px"
            }
          }}
        >
          <Tab label="Alınan Davetler" />
          <Tab label="Gönderilen Davetler" />
        </Tabs>
      </Paper>

      {tab === 0 ? (
        receivedInvites.length === 0 ? (
          <Card sx={{ 
            textAlign: "center", 
            p: 4,
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0"
          }}>
            <Typography variant="body1" sx={{ color: "#64748b" }}>
              Henüz alınan davetiniz yok
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {receivedInvites.map((invite) => (
              <Card
                key={invite._id}
                sx={{
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  "&:hover": { 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                      <Avatar 
                        src={invite.sender?.profileImage}
                        sx={{
                          width: 40,
                          height: 40,
                          cursor: "pointer",
                          bgcolor: "#6b0f1a"
                        }}
                        onClick={() => navigate(`/users/${invite.sender?._id}`)}
                      >
                        {invite.sender?.fullname?.[0]}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1"
                          sx={{ 
                            fontWeight: "600",
                            color: "#2c3e50",
                            cursor: "pointer",
                            "&:hover": { color: "#6b0f1a" }
                          }}
                          onClick={() => navigate(`/users/${invite.sender?._id}`)}
                        >
                          {invite.sender?.fullname}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: "#64748b" }}
                        >
                          {invite.project?.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Chip
                        label={
                          invite.status === 'accepted' ? 'Kabul Edildi' :
                          invite.status === 'declined' ? 'Reddedildi' : 'Bekliyor'
                        }
                        size="small"
                        sx={{
                          fontWeight: "500",
                          ...(invite.status === 'accepted' && {
                            backgroundColor: "#e8f5e8",
                            color: "#2e7d32",
                          }),
                          ...(invite.status === 'declined' && {
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                          }),
                          ...(invite.status === 'pending' && {
                            backgroundColor: "#fff3e0",
                            color: "#ef6c00",
                          })
                        }}
                      />

                      {invite.status === 'pending' && (
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Projeyi İncele">
                            <IconButton
                              size="small"
                              onClick={() => handleViewProject(invite.project?._id)}
                              sx={{
                                color: "#6b0f1a",
                                "&:hover": { backgroundColor: "#f0e4e6" }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAccept(invite._id)}
                            sx={{
                              backgroundColor: "#4caf50",
                              color: "white",
                              fontWeight: "600",
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "#388e3c"
                              }
                            }}
                          >
                            Kabul Et
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDecline(invite._id)}
                            sx={{
                              borderColor: "#f44336",
                              color: "#f44336",
                              fontWeight: "600",
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "#ffebee",
                                borderColor: "#d32f2f"
                              }
                            }}
                          >
                            Reddet
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )
      ) : sentInvites.length === 0 ? (
        <Card sx={{ 
          textAlign: "center", 
          p: 4,
          borderRadius: "8px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0"
        }}>
          <Typography variant="body1" sx={{ color: "#64748b" }}>
            Henüz gönderilen davetiniz yok
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sentInvites.map((invite) => (
            <Card
              key={invite._id}
              sx={{
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0",
                transition: "all 0.2s ease",
                "&:hover": { 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                    <Avatar 
                      src={invite.receiver?.profileImage}
                      sx={{
                        width: 40,
                        height: 40,
                        cursor: "pointer",
                        bgcolor: "#6b0f1a"
                      }}
                      onClick={() => navigate(`/users/${invite.receiver?._id}`)}
                    >
                      {invite.receiver?.fullname?.[0]}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: "600",
                          color: "#2c3e50",
                          cursor: "pointer",
                          "&:hover": { color: "#6b0f1a" }
                        }}
                        onClick={() => navigate(`/users/${invite.receiver?._id}`)}
                      >
                        {invite.receiver?.fullname}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: "#64748b" }}
                      >
                        {invite.project?.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={
                      invite.status === 'accepted' ? 'Kabul Edildi' :
                      invite.status === 'declined' ? 'Reddedildi' : 'Bekliyor'
                    }
                    size="small"
                    sx={{
                      fontWeight: "500",
                      ...(invite.status === 'accepted' && {
                        backgroundColor: "#e8f5e8",
                        color: "#2e7d32",
                      }),
                      ...(invite.status === 'declined' && {
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                      }),
                      ...(invite.status === 'pending' && {
                        backgroundColor: "#fff3e0",
                        color: "#ef6c00",
                      })
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      
      <ProfileSnackbar open={messageOpen} message={message} severity={messageSeverity} onClose={() => setMessageOpen(false)} />
    </Container>
  );
}