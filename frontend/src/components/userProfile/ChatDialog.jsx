import { useEffect, useRef, useState } from "react";
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
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem
} from "@mui/material";
import { Chat, Close, EmojiEmotions, Send, MoreVert, Delete } from "@mui/icons-material";

function ChatDialog({ 
  open, 
  onClose, 
  user, 
  messages, 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onKeyPress,
  onDeleteMessage,
  loading = false
}) {
  const messagesEndRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Menu işlemleri
  const handleMenuOpen = (event, message) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  // Mesajın silinebilir olup olmadığını kontrol et (1 gün kontrolü)
  const canDeleteMessage = (message) => {
    if (!message.isMe) return false;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return new Date(message.timestamp) > oneDayAgo;
  };

  const handleDeleteMessage = () => {
    if (selectedMessage && onDeleteMessage) {
      onDeleteMessage(selectedMessage.id);
    }
    handleMenuClose();
  };
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
          {loading ? (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "200px" 
            }}>
              <CircularProgress sx={{ color: "#6b0f1a" }} />
            </Box>
          ) : messages.length === 0 ? (
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
                    display: "block",
                    px: 0,
                    py: 0.5
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "flex-end", 
                    gap: 1,
                    flexDirection: message.isMe ? "row-reverse" : "row",
                    maxWidth: "85%",
                    ml: message.isMe ? "auto" : 0,
                    mr: message.isMe ? 0 : "auto"
                  }}>
                    {/* Profil Fotoğrafı */}
                    <Avatar
                      src={message.senderAvatar}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                        flexShrink: 0
                      }}
                    >
                      {message.senderName?.[0]}
                    </Avatar>

                    <Paper sx={{
                      maxWidth: "calc(100% - 40px)",
                      p: 2,
                      backgroundColor: message.isMe ? "#6b0f1a" : "#fff",
                      color: message.isMe ? "#fff" : "#333",
                      borderRadius: message.isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      opacity: message.sending ? 0.7 : 1,
                      position: "relative"
                    }}>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>
                        {message.message}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                        {message.sending && (
                          <CircularProgress 
                            size={12} 
                            sx={{ 
                              color: message.isMe ? "#fff" : "#6b0f1a",
                              ml: 1
                            }} 
                          />
                        )}
                      </Box>
                    </Paper>
                    
                    {/* Kendi mesajlarında menu butonu */}
                    {message.isMe && canDeleteMessage(message) && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, message)}
                        sx={{ 
                          opacity: 0.6,
                          "&:hover": { opacity: 1 },
                          color: "#666"
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
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

      {/* Mesaj Menüsü */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }
        }}
      >
        <MenuItem onClick={handleDeleteMessage} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Mesajı Sil
        </MenuItem>
      </Menu>
    </Dialog>
  );
}

export default ChatDialog;
