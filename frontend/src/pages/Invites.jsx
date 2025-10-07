import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

export default function InvitesPage() {
  const [loading, setLoading] = useState(true);

  // Örnek davet verileri
  const invites = [
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
    {
      id: 3,
      senderName: "Mehmet Can",
      senderAvatar: "https://i.pravatar.cc/150?img=3",
      projectName: "Backend API Projesi",
    },
  ];

  // Loading simülasyonu
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // 1 saniye sonra loading biter
    return () => clearTimeout(timer);
  }, []);

  // Kabul et
  const handleAccept = (inviteId) => {
    alert(`Davet ${inviteId} kabul edildi!`);
  };

  // Reddet
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
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Davetlerim
      </Typography>

      {invites.length === 0 ? (
        <Typography>Henüz davetiniz yok.</Typography>
      ) : (
        <Stack spacing={2}>
          {invites.map((invite) => (
            <Box
              key={invite.id}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
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
      )}
    </Box>
  );
}