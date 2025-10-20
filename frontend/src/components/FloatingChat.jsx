import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Collapse,
  Fab,
  Badge
} from '@mui/material';
import {
  Send,
  Close,
  Chat,
  Remove,
  ArrowBack
} from '@mui/icons-material';
import axiosInstance from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

function FloatingChat({ partnerId, onClose, onBack, initialMinimized = false }) {
  const currentUser = useAuthStore((state) => state.user);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(initialMinimized);

  // Partner bilgilerini getir
  const fetchPartner = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/users/profile/${partnerId}`);
      setPartner(response.data);
    } catch (err) {
      console.error('Partner bilgileri getirilemedi:', err);
      setError('Kullanıcı bulunamadı');
    }
  }, [partnerId]);

  // Mesajları getir
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messages/${partnerId}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Mesajlar getirilemedi:', err);
      setError('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  // Mesaj gönder
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await axiosInstance.post('/messages', {
        receiverId: partnerId,
        content: newMessage.trim()
      });
      
      setNewMessage('');
      fetchMessages(); // Mesajları yenile
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      setError('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  // Enter tuşuyla mesaj gönder
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartner();
      fetchMessages();
    }
  }, [partnerId, fetchPartner, fetchMessages]);

  if (!partnerId) return null;

  if (!partnerId) {
    return (
      <Box sx={{ 
        width: 380,
        height: 'auto',
        zIndex: 1000 
      }}>
        <Alert severity="info">
          Bir kullanıcı seçin veya konuşma listesini görüntüleyin
        </Alert>
      </Box>
    );
  }

  if (loading && !partner) {
    return (
      <Box sx={{ 
        width: 'auto',
        height: 'auto',
        zIndex: 1000 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: 'auto',
        height: 'auto',
        zIndex: 1000 
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {/* Floating Chat Widget */}
      <Box sx={{ 
        width: isMinimized ? 'auto' : 380,
        height: isMinimized ? 'auto' : 500
      }}>
        {/* Chat Header */}
        <Paper 
          elevation={8}
          sx={{ 
            borderRadius: isMinimized ? '25px' : '12px 12px 0 0',
            backgroundColor: '#4a0d16',
            color: 'white',
            cursor: isMinimized ? 'pointer' : 'default'
          }}
          onClick={isMinimized ? () => setIsMinimized(false) : undefined}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            p: 2 
          }}>
            {partner && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={partner.profileImage}
                  sx={{ width: 32, height: 32 }}
                >
                  {partner.fullname?.[0]}
                </Avatar>
                {!isMinimized && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {partner.fullname}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Aktif
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {!isMinimized && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onBack && (
                  <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={onBack}
                  >
                    <ArrowBack />
                  </IconButton>
                )}
                <IconButton 
                  size="small" 
                  sx={{ color: 'white' }}
                  onClick={() => setIsMinimized(true)}
                >
                  <Remove />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ color: 'white' }}
                  onClick={onClose}
                >
                  <Close />
                </IconButton>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chat Body */}
        <Collapse in={!isMinimized}>
          <Paper 
            elevation={8}
            sx={{ 
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '0 0 12px 12px',
              overflow: 'hidden'
            }}
          >
            {/* Messages Area */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2, 
              backgroundColor: '#f8f9fa' 
            }}>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Chat sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Henüz mesaj yok. İlk mesajı gönderin!
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender._id === currentUser._id ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '80%',
                          backgroundColor: message.sender._id === currentUser._id ? '#4a0d16' : 'white',
                          color: message.sender._id === currentUser._id ? 'white' : 'black',
                          borderRadius: message.sender._id === currentUser._id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            fontSize: '0.7rem'
                          }}
                        >
                          {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
            
            <Divider />
            
            {/* Message Input */}
            <Box sx={{ p: 2, backgroundColor: 'white' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  sx={{
                    backgroundColor: '#4a0d16',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      backgroundColor: '#5c1119'
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc'
                    }
                  }}
                >
                  {sending ? <CircularProgress size={16} color="inherit" /> : <Send sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Collapse>
      </Box>
      
      {/* Minimized Chat Badge */}
      {isMinimized && messages.length > 0 && (
        <Fab 
          size="small" 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 80, 
            backgroundColor: '#e74c3c',
            color: 'white',
            '&:hover': {
              backgroundColor: '#c0392b'
            }
          }}
          onClick={() => setIsMinimized(false)}
        >
          <Badge badgeContent={messages.length} color="error">
            <Chat />
          </Badge>
        </Fab>
      )}
    </>
  );
}

export default FloatingChat;
