import { useEffect, useState, useCallback } from "react";
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
} from "@mui/material";
import axiosInstance from "../lib/axios";
import useAuthStore from "../store/useAuthStore";

export default function InvitesPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Alınan, 1: Gönderilen
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [message, setMessage] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  
  const token = useAuthStore((state) => state.token);

  // API çağrıları
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        axiosInstance.get("/api/invites/received", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get("/api/invites/sent", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
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
      await axiosInstance.patch(`/api/invites/respond/${inviteId}`, 
        { action: "accepted" },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setMessage("Davet kabul edildi!");
      setMessageOpen(true);
      fetchInvites(); // Listeyi yenile
    } catch (error) {
      console.error("Davet kabul edilemedi:", error);
      setMessage("Davet kabul edilirken hata oluştu");
      setMessageOpen(true);
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await axiosInstance.patch(`/api/invites/respond/${inviteId}`, 
        { action: "declined" },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setMessage("Davet reddedildi!");
      setMessageOpen(true);
      fetchInvites(); // Listeyi yenile
    } catch (error) {
      console.error("Davet reddedilemedi:", error);
      setMessage("Davet reddedilirken hata oluştu");
      setMessageOpen(true);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
     

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Alınan Davetler" />
          <Tab label="Gönderilen Davetler" />
        </Tabs>
      </Paper>

      {tab === 0 ? (
        receivedInvites.length === 0 ? (
          <Typography>Henüz alınan davetiniz yok.</Typography>
        ) : (
          <Stack spacing={2}>
            {receivedInvites.map((invite) => (
              <Box
                key={invite._id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar src={invite.sender?.profileImage} />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {invite.sender?.fullname}
                    </Typography>
                    <Typography color="text.secondary">
                      {invite.project?.title}
                    </Typography>
                  </Box>
                </Box>

                {invite.status === 'pending' ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleAccept(invite._id)}
                    >
                      Kabul Et
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDecline(invite._id)}
                    >
                      Reddet
                    </Button>
                  </Stack>
                ) : (
                  <Button 
                    variant="outlined" 
                    color={invite.status === 'accepted' ? 'success' : 'error'}
                    disabled
                  >
                    {invite.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        )
      ) : sentInvites.length === 0 ? (
        <Typography>Henüz gönderilen davetiniz yok.</Typography>
      ) : (
        <Stack spacing={2}>
          {sentInvites.map((invite) => (
            <Box
              key={invite._id}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar src={invite.receiver?.profileImage} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {invite.receiver?.fullname}
                  </Typography>
                  <Typography color="text.secondary">
                    {invite.project?.title}
                  </Typography>
                </Box>
              </Box>

              <Button 
                variant="outlined" 
                color={
                  invite.status === 'accepted' ? 'success' : 
                  invite.status === 'declined' ? 'error' : 'primary'
                }
              >
                {invite.status === 'accepted' ? 'Kabul Edildi' : 
                 invite.status === 'declined' ? 'Reddedildi' : 'Bekliyor'}
              </Button>
            </Box>
          ))}
        </Stack>
      )}
      
      <Snackbar 
        open={messageOpen} 
        autoHideDuration={3000} 
        onClose={() => setMessageOpen(false)}
      >
        <Alert severity="error">{message}</Alert>
      </Snackbar>
    </Box>
  );
}