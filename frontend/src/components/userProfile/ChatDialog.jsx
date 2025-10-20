import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  Paper,
  TextField,
  InputAdornment
} from "@mui/material";
import { Chat, Close, EmojiEmotions, Send } from "@mui/icons-material";

function ChatDialog({ 
  open, 
  onClose, 
  user, 
  messages, 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onKeyPress 
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          maxHeight: "80vh",
          height: "600px"
        }
      }}
    >
      <DialogTitle sx={{ 
        background: "linear-gradient(135deg, #6b0f1a, #8c1c2b)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 2
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={user?.profileImage} sx={{ width: 40, height: 40 }}>
            {user?.fullname?.[0]}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {user?.fullname}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: "#fff" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 0, 
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Mesajlar Listesi */}
        <Box sx={{ 
          flex: 1,
          overflowY: "auto",
          p: 2,
          backgroundColor: "#f8f9fa"
        }}>
          {messages.length === 0 ? (
            <Box sx={{ 
              textAlign: "center", 
              color: "#666", 
              mt: 4 
            }}>
              <Chat sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
              <Typography variant="body1">
                Henüz mesaj yok. İlk mesajı gönderin!
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem 
                  key={message.id}
                  sx={{ 
                    justifyContent: message.isMe ? "flex-end" : "flex-start",
                    px: 0,
                    py: 0.5
                  }}
                >
                  <Paper sx={{
                    maxWidth: "70%",
                    p: 2,
                    backgroundColor: message.isMe ? "#6b0f1a" : "#fff",
                    color: message.isMe ? "#fff" : "#333",
                    borderRadius: message.isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    <Typography variant="body1" sx={{ mb: 0.5 }}>
                      {message.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7,
                        fontSize: "0.7rem"
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
        
        {/* Mesaj Gönderme Alanı */}
        <Box sx={{ 
          p: 2, 
          borderTop: "1px solid #eee",
          backgroundColor: "#fff"
        }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Mesajınızı yazın..."
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  backgroundColor: "#f8f9fa",
                  "& fieldset": {
                    borderColor: "#ddd"
                  },
                  "&:hover fieldset": {
                    borderColor: "#6b0f1a"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6b0f1a"
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton sx={{ color: "#6b0f1a" }}>
                      <EmojiEmotions />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <IconButton
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
              sx={{
                backgroundColor: "#6b0f1a",
                color: "#fff",
                width: 48,
                height: 48,
                "&:hover": {
                  backgroundColor: "#8c1c2b"
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                  color: "#999"
                }
              }}
            >
              <Send />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ChatDialog;
