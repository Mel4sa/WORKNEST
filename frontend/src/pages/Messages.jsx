import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import {
  Send,
  ArrowBack
} from '@mui/icons-material';
import axiosInstance from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

function Messages() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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
      await axiosInstance.post('/messages/send', {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafbfc', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              backgroundColor: '#4a0d16',
              color: 'white',
              '&:hover': {
                backgroundColor: '#5c1119'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          {partner && (
            <>
              <Avatar 
                src={partner.profileImage}
                sx={{ width: 48, height: 48 }}
              >
                {partner.fullname?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {partner.fullname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{partner.username}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* Mesajlar */}
        <Card sx={{ mb: 3, height: '500px', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Henüz mesaj yok. İlk mesajı gönderin!
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
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
                        p: 2,
                        maxWidth: '70%',
                        backgroundColor: message.sender._id === currentUser._id ? '#4a0d16' : '#f5f5f5',
                        color: message.sender._id === currentUser._id ? 'white' : 'black',
                        borderRadius: message.sender._id === currentUser._id ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                      }}
                    >
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {message.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7,
                          display: 'block',
                          textAlign: 'right',
                          mt: 1
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
          </CardContent>
          
          <Divider />
          
          {/* Mesaj gönderme alanı */}
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
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
                  borderRadius: '20px'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              sx={{
                minWidth: '60px',
                borderRadius: '50%',
                backgroundColor: '#4a0d16',
                '&:hover': {
                  backgroundColor: '#5c1119'
                }
              }}
            >
              {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default Messages;
