import { useEffect, useState } from "react";
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
} from "@mui/material";

export default function InvitesPage() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Alınan, 1: Gönderilen

  // Örnek davet verileri
  const receivedInvites = [
    {
      id: 1,
      senderName: "Ahmet Yılmaz",
      senderAvatar: "https://i.pravatar.cc/150?img=1",
      projectName: "Yeni Web Sitesi",
    },
    {
      id: 2,
      senderName: "Elif Demir",
      senderAvatar: "https://i.pravatar.cc/150?img=2",
      projectName: "Mobil Uygulama Tasarımı",
    },
  ];

  const sentInvites = [
    {
      id: 3,
      receiverName: "Merve Aksoy",
      receiverAvatar: "https://i.pravatar.cc/150?img=4",
      projectName: "E-ticaret Sitesi",
    },
    {
      id: 4,
      receiverName: "Mehmet Can",
      receiverAvatar: "https://i.pravatar.cc/150?img=5",
      projectName: "Backend API Projesi",
    },
  ];

  // Loading simülasyonu
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = (inviteId) => {
    alert(`Davet ${inviteId} kabul edildi!`);
  };

  const handleDecline = (inviteId) => {
    alert(`Davet ${inviteId} reddedildi!`);
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
                key={invite.id}
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
                  <Avatar src={invite.senderAvatar} />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {invite.senderName}
                    </Typography>
                    <Typography color="text.secondary">
                      {invite.projectName}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAccept(invite.id)}
                  >
                    Kabul Et
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDecline(invite.id)}
                  >
                    Reddet
                  </Button>
                </Stack>
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
              key={invite.id}
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
                <Avatar src={invite.receiverAvatar} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {invite.receiverName}
                  </Typography>
                  <Typography color="text.secondary">
                    {invite.projectName}
                  </Typography>
                </Box>
              </Box>

              <Button variant="outlined" color="primary">
                Gönderildi
              </Button>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}