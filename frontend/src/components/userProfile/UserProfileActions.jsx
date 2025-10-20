import { Box, Button, Stack } from "@mui/material";
import { ArrowBack, Send, Chat } from "@mui/icons-material";

function UserProfileActions({ 
  onGoBack, 
  onInviteClick, 
  onChatClick 
}) {
  return (
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
        onClick={onGoBack}
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

      {/* Davet At ve Mesaj Gönder Butonları */}
      <Stack spacing={2} alignItems="flex-end">
        <Button 
          variant="contained" 
          startIcon={<Send />}
          onClick={onInviteClick}
          sx={{ 
            background: "#6b0f1a",
            color: "#fff",
            fontWeight: "600",
            borderRadius: "12px",
            px: 3,
            py: 1.5,
            "&:hover": {
              background: "#8c1c2b",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(107, 15, 26, 0.3)"
            },
            transition: "all 0.3s ease"
          }}
        >
          Projeye Davet Et
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<Chat />}
          onClick={onChatClick}
          sx={{ 
            borderColor: "#6b0f1a",
            color: "#6b0f1a",
            fontWeight: "600",
            borderRadius: "12px",
            px: 3,
            py: 1.5,
            "&:hover": {
              borderColor: "#8c1c2b",
              backgroundColor: "rgba(107, 15, 26, 0.05)",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(107, 15, 26, 0.2)"
            },
            transition: "all 0.3s ease"
          }}
        >
          Mesaj Gönder
        </Button>
      </Stack>
    </Box>
  );
}

export default UserProfileActions;
