import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import useAuthStore from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

export default function InvitesPage() {
  const token = useAuthStore((state) => state.token);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Davetleri backend'den çek
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await axiosInstance.get("/invites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvites(res.data.invites || []);
      } catch (err) {
        console.error("Davetler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, [token]);

  // Kabul et
  const handleAccept = async (inviteId) => {
    try {
      await axiosInstance.post(
        `/invites/${inviteId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      console.error("Kabul hatası:", err);
    }
  };

  // Reddet
  const handleDecline = async (inviteId) => {
    try {
      await axiosInstance.post(
        `/invites/${inviteId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      console.error("Reddetme hatası:", err);
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