import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Avatar,
  List,
  ListItem,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Snackbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Chip
} from '@mui/material';
import {
  Send,
  Close,
  Chat,
  ArrowBack,
  MoreVert,
  Delete
} from '@mui/icons-material';
import axiosInstance from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

function Messages() {
  const { user } = useAuthStore();
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partners, setPartners] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [sending, setSending] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Chat listesini getir
  const fetchActiveChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/chats');
      const chats = response.data.chats || [];
      setActiveChats(chats);

      // Her chat için partner bilgilerini getir
      const partnersData = {};
      const unreadData = {};
      
      for (const chat of chats) {
        // Partner'ı bul (current user olmayan participant)
        const partner = chat.participants.find(p => p._id !== user._id);
        if (partner) {
          partnersData[partner._id] = partner;
        }
        
        // Okunmamış mesaj sayısını hesapla
        const unreadCount = chat.messages?.filter(msg => 
          !msg.readBy?.some(read => read.user === user._id) && 
          msg.sender !== user._id
        )?.length || 0;
        unreadData[chat._id] = unreadCount;
      }
      
      setPartners(partnersData);
      setUnreadCounts(unreadData);
    } catch (err) {
      console.error('Chat listesi getirilemedi:', err);
      setError('Chat listesi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  // Mesajları getir
  const fetchMessages = useCallback(async (chatId) => {
    try {
      const response = await axiosInstance.get(`/chats/${chatId}/messages`);
      setMessages(response.data.messages || []);
      
      // Okunmamış sayacını sıfırla
      setUnreadCounts(prev => ({
        ...prev,
        [chatId]: 0
      }));
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Mesajlar getirilemedi:', err);
      setError('Mesajlar yüklenemedi');
    }
  }, []);

  // Mesaj gönder
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedChat) return;

    // Optimistic update
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      content: newMessage.trim(),
      sender: {
        _id: user._id,
        fullname: user.fullname || user.name,
        profileImage: user.profileImage || user.avatar
      },
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const response = await axiosInstance.post(`/chats/${selectedChat._id}/messages`, {
        content: tempMessage.content,
        messageType: 'text'
      });

      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? response.data.message : msg
      ));

      // Notification event dispatch
      window.dispatchEvent(new CustomEvent('messageReceived', {
        detail: { chatId: selectedChat._id, message: response.data.message }
      }));

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(tempMessage.content);
      showSnackbar('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  // Mesaj sil
  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosInstance.delete(`/chats/messages/${messageId}`);
      
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      showSnackbar('Mesaj silindi');
      handleMenuClose();
    } catch (err) {
      console.error('Mesaj silinemedi:', err);
      showSnackbar(err.response?.data?.message || 'Mesaj silinemedi');
    }
  };

  // Chat seç ve aç
  const handleChatOpen = (chat) => {
    setSelectedChat(chat);
    setChatDialogOpen(true);
    fetchMessages(chat._id);
  };

  // Chat kapat
  const handleChatClose = () => {
    setChatDialogOpen(false);
    setSelectedChat(null);
    setMessages([]);
    setNewMessage('');
  };

  // Menu işlemleri
  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  // Snackbar
  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '' });
  };

  // Mesaj silme kontrolü (1 gün)
  const canDeleteMessage = (message) => {
    if (message.sender._id !== user._id) return false;
    const messageDate = new Date(message.createdAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return (now - messageDate) < oneDayInMs;
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Component mount
  useEffect(() => {
    if (user) {
      fetchActiveChats();
    }
  }, [user, fetchActiveChats]);

  // Notification listener
  useEffect(() => {
    const handleNewMessage = () => {
      fetchActiveChats();
      if (selectedChat) {
        fetchMessages(selectedChat._id);
      }
    };

    // Her 5 saniyede bir chat listesini refresh et (real-time için)
    const refreshInterval = setInterval(() => {
      if (user && !chatDialogOpen) {
        fetchActiveChats();
      }
    }, 5000);

    window.addEventListener('messageReceived', handleNewMessage);
    
    return () => {
      window.removeEventListener('messageReceived', handleNewMessage);
      clearInterval(refreshInterval);
    };
  }, [fetchActiveChats, fetchMessages, selectedChat, user, chatDialogOpen]);

  if (loading && activeChats.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && activeChats.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Mesajlar
      </Typography>

      {activeChats.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Chat sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Henüz mesajınız yok
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bir kullanıcının profiline giderek mesajlaşmaya başlayabilirsiniz
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {activeChats.map((chat) => {
            const partner = chat.participants.find(p => p._id !== user._id);
            const unreadCount = unreadCounts[chat._id] || 0;
            const lastMessage = chat.lastMessage;

            return (
              <Card key={chat._id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => handleChatOpen(chat)}>
                <ListItem sx={{ p: 2 }}>
                  <Avatar
                    src={partner?.profileImage}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    {partner?.fullname?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: unreadCount > 0 ? 'bold' : 'normal' }}>
                        {partner?.fullname || 'Bilinmeyen Kullanıcı'}
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip 
                          label={unreadCount} 
                          size="small" 
                          color="primary" 
                          sx={{ minWidth: 24, height: 24 }}
                        />
                      )}
                    </Box>
                    {lastMessage && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '60%'
                          }}
                        >
                          {lastMessage.sender === user._id ? 'Sen: ' : ''}
                          {lastMessage.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(lastMessage.createdAt)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </ListItem>
              </Card>
            );
          })}
        </List>
      )}

      {/* Chat Dialog */}
      <Dialog
        open={chatDialogOpen}
        onClose={handleChatClose}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '90vw',
            height: '85vh',
            maxWidth: 'none',
            maxHeight: 'none'
          }
        }}
      >
        <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleChatClose} sx={{ mr: 1 }}>
                <ArrowBack />
              </IconButton>
              {selectedChat && (
                <>
                  <Avatar
                    src={partners[selectedChat.participants.find(p => p._id !== user._id)?._id]?.profileImage}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {partners[selectedChat.participants.find(p => p._id !== user._id)?._id]?.fullname?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6">
                    {partners[selectedChat.participants.find(p => p._id !== user._id)?._id]?.fullname || 'Bilinmeyen Kullanıcı'}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Henüz mesaj yok. Konuşmaya başlayın!
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {messages.map((message, index) => {
                  const isOwn = message.sender._id === user._id;
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                  return (
                    <React.Fragment key={message._id}>
                      {showDate && (
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                          <Chip 
                            label={formatDate(message.createdAt)} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          alignItems: 'flex-start',
                          gap: 1
                        }}
                      >
                        {!isOwn && (
                          <Avatar
                            src={message.sender.profileImage}
                            sx={{ width: 32, height: 32 }}
                          >
                            {message.sender.fullname?.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            maxWidth: '70%',
                            bgcolor: isOwn ? 'primary.main' : 'grey.100',
                            color: isOwn ? 'white' : 'text.primary',
                            borderRadius: 2,
                            position: 'relative',
                            opacity: message.isTemp ? 0.7 : 1
                          }}
                        >
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mt: 0.5,
                            gap: 1
                          }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                fontSize: '0.7rem'
                              }}
                            >
                              {formatTime(message.createdAt)}
                            </Typography>
                            {isOwn && canDeleteMessage(message) && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuOpen(e, message);
                                }}
                                sx={{ 
                                  p: 0.25,
                                  color: 'rgba(255,255,255,0.7)',
                                  '&:hover': {
                                    color: 'white'
                                  }
                                }}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Paper>

                        {isOwn && (
                          <Avatar
                            src={user.profileImage || user.avatar}
                            sx={{ width: 32, height: 32 }}
                          >
                            {(user.fullname || user.name)?.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                      </Box>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            )}
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              variant="outlined"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      color="primary"
                    >
                      {sending ? <CircularProgress size={24} /> : <Send />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Message Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => selectedMessage && handleDeleteMessage(selectedMessage._id)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Mesajı Sil
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
      />
    </Container>
  );
}

export default Messages;
