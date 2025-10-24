import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Badge,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Send,
  Close,
  Chat,
  Remove,
  ArrowBack,
  Delete,
  MoreVert,
  Edit,
  Cancel
} from '@mui/icons-material';
import axiosInstance from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

function FloatingChat({ partnerId, onClose, onBack, initialMinimized = false, onMessagesRead }) {
  const currentUser = useAuthStore((state) => state.user);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(initialMinimized);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);

  // Partner bilgilerini getir
  const fetchPartner = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/users/profile/${partnerId}`);
      setPartner(response.data);
    } catch {
      setError('Kullanıcı bulunamadı');
    }
  }, [partnerId]);

  // Mesajları getir
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/messages/${partnerId}`);
      setMessages(response.data);
    } catch {
      setError('Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  // Mesaj gönder
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const messageContent = newMessage.trim();
    try {
      const response = await axiosInstance.post('/api/messages', {
        receiverId: partnerId,
        content: messageContent
      });
      setMessages(prevMessages => [...prevMessages, response.data]);
      setNewMessage('');
      window.dispatchEvent(new CustomEvent('messageCountChanged'));
      setTimeout(scrollToBottom, 100);
    } catch {
      setError('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mesajları okundu olarak işaretle
  const markMessagesAsRead = useCallback(async () => {
    if (!partnerId) return;
    try {
  await axiosInstance.put(`/api/messages/${partnerId}/read`);
      window.dispatchEvent(new CustomEvent('messageCountChanged'));
    } finally {
      if (typeof onMessagesRead === 'function') {
        onMessagesRead();
      }
    }
  }, [partnerId, onMessagesRead]);

  // Enter tuşuyla mesaj gönder
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mesaj menüsünü aç
  const handleMessageMenu = (event, message) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  // Mesaj menüsünü kapat
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedMessage(null);
  };

  // Mesaj sil
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
  await axiosInstance.delete(`/api/messages/${selectedMessage._id}`);
      
      // Başarılı silme - optimistic update
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== selectedMessage._id)
      );
      handleCloseMenu();
      
      // Error state'i temizle (eğer varsa)
      setError('');
      
    } catch (err) {
      handleCloseMenu();
      
      // Hata durumunda mesajları yenile (rollback)
      fetchMessages();
      
      // Hata mesajını göster ama chat'i kapatma
      if (err.response?.status === 400) {
        setError('Bu mesaj 1 günden eski olduğu için silinemez');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Mesaj silinemedi, lütfen tekrar deneyin');
      }
      
      // 3 saniye sonra hata mesajını temizle
      setTimeout(() => setError(''), 3000);
    }
  };

  // Mesajın silinebilir olup olmadığını kontrol et
  const canDeleteMessage = (message) => {
    if (message.sender._id !== currentUser._id) return false;
    
    const messageDate = new Date(message.createdAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    return (now - messageDate) < oneDayInMs;
  };

  // Mesajın düzenlenebilir olup olmadığını kontrol et (10 dakika)
  const canEditMessage = (message) => {
    if (message.sender._id !== currentUser._id) return false;
    
    const messageDate = new Date(message.createdAt);
    const now = new Date();
    const tenMinutesInMs = 10 * 60 * 1000;
    
    return (now - messageDate) < tenMinutesInMs;
  };

  // Mesaj düzenlemeyi başlat
  const handleEditMessage = () => {
    if (!selectedMessage) return;
    setEditingMessage(selectedMessage._id);
    setEditContent(selectedMessage.content);
    handleCloseMenu();
  };

  // Mesaj düzenlemeyi kaydet
  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) {
      handleCancelEdit();
      return;
    }

    try {
  await axiosInstance.put(`/api/messages/${editingMessage}`, {
        content: editContent.trim()
      });

      // Mesajı güncelle (eski model için sadece content)
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === editingMessage 
            ? { ...msg, content: editContent.trim() }
            : msg
        )
      );

      setEditingMessage(null);
      setEditContent('');
      
      // Başarı mesajı göster
      setError('Mesaj başarıyla güncellendi');
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Mesaj düzenlenemedi');
      }
      setTimeout(() => setError(''), 3000);
    }
  };

  // Mesaj düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  useEffect(() => {
    if (partnerId) {
      fetchPartner();
      fetchMessages();
      markMessagesAsRead();
      if (typeof onMessagesRead === 'function') {
        onMessagesRead();
      }
    }
  }, [partnerId, fetchPartner, fetchMessages, markMessagesAsRead, onMessagesRead]);

  // Mesajlar yüklendiğinde aşağıya kaydır
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  if (!partnerId) return null;

  if (!partnerId) {
    return (
      <Box sx={{ 
        width: 450,
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
        width: 450,
        height: 'auto',
        zIndex: 1000 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Critical error durumunda (partner bulunamadı vs.) chat'i kapat
  if (error && (!partner || error.includes('bulunamadı'))) {
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

  // Minimized Chat Badge
  const unreadCount = messages.filter(m => m.receiver._id === currentUser._id && m.isRead === false).length;

  return (
    <>
      {/* Floating Chat Widget */}
      <Box sx={{ 
        width: isMinimized ? 'auto' : 450,
        height: isMinimized ? 'auto' : 500,
        position: 'relative',
        zIndex: 10001
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
              {/* Hata Mesajı */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2, 
                    fontSize: '0.8rem',
                    '& .MuiAlert-message': {
                      fontSize: '0.8rem'
                    }
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}
              
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Chat sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Henüz mesaj yok. İlk mesajı gönderin!
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {messages.map((message) => {
                    const isCurrentUser = message.sender._id === currentUser._id;
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 1,
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row'
                        }}
                      >
                        {/* Profil Fotoğrafı */}
                        <Avatar
                          src={isCurrentUser ? currentUser.profileImage : (partner?.profileImage)}
                          sx={{ 
                            width: 28, 
                            height: 28,
                            fontSize: '0.8rem'
                          }}
                        >
                          {isCurrentUser 
                            ? currentUser.fullname?.[0] 
                            : partner?.fullname?.[0]
                          }
                        </Avatar>

                        {/* Mesaj Balonu */}
                        <Box sx={{ position: 'relative', maxWidth: '70%' }}>
                          <Paper
                            sx={{
                              p: 1.5,
                              backgroundColor: isCurrentUser ? '#4a0d16' : 'white',
                              color: isCurrentUser ? 'white' : 'black',
                              borderRadius: isCurrentUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                              '&:hover .message-menu': {
                                opacity: 1
                              }
                            }}
                          >
                            {editingMessage === message._id ? (
                              // Düzenleme modu
                              <Box sx={{ width: '100%' }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  maxRows={3}
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      if (editContent.trim()) {
                                        handleSaveEdit();
                                      }
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelEdit();
                                    }
                                  }}
                                  variant="standard"
                                  placeholder="Mesajınızı düzenleyin... (Enter: kaydet, ESC: iptal, Shift+Enter: yeni satır)"
                                  autoFocus
                                  sx={{
                                    '& .MuiInput-root': {
                                      color: isCurrentUser ? 'white' : 'black',
                                      '&:before': {
                                        borderBottomColor: isCurrentUser ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                                      },
                                      '&:after': {
                                        borderBottomColor: isCurrentUser ? 'white' : '#1976d2',
                                      },
                                    },
                                    '& .MuiInput-input::placeholder': {
                                      color: isCurrentUser ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                      fontSize: '0.75rem'
                                    },
                                    mb: 1
                                  }}
                                />
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                  <IconButton
                                    size="small"
                                    onClick={handleCancelEdit}
                                    sx={{
                                      color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                                      width: 24,
                                      height: 24
                                    }}
                                  >
                                    <Cancel sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: isCurrentUser ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                      fontSize: '0.65rem',
                                      alignSelf: 'center'
                                    }}
                                  >
                                    Enter: Kaydet • ESC: İptal
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              // Normal mesaj görünümü
                              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {message.content}
                              </Typography>
                            )}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              mt: 0.5 
                            }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  opacity: 0.7,
                                  fontSize: '0.7rem'
                                }}
                              >
                                {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                              
                              {/* Kendi mesajında menü butonu (sadece düzenleme modunda değilse) */}
                              {isCurrentUser && editingMessage !== message._id && (
                                <Tooltip title={canEditMessage(message) ? "Düzenle/Sil" : canDeleteMessage(message) ? "Sil" : "İşlem yapılamaz"}>
                                  <IconButton
                                    className="message-menu"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMessageMenu(e, message);
                                    }}
                                    disabled={!canDeleteMessage(message) && !canEditMessage(message)}
                                    sx={{
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'inherit',
                                      width: 20,
                                      height: 20,
                                      '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: isCurrentUser ? 'white' : 'inherit'
                                      },
                                      '&:disabled': {
                                        color: isCurrentUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                      }
                                    }}
                                  >
                                    <MoreVert sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
              
              {/* Scroll to bottom referansı */}
              <div ref={messagesEndRef} />
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

      {/* Mesaj Menüsü */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            style: {
              zIndex: 20000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }
          }
        }}
        sx={{
          zIndex: 20000
        }}
      >
        {selectedMessage && canEditMessage(selectedMessage) && (
          <MenuItem 
            onClick={handleEditMessage}
            sx={{
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            Mesajı Düzenle
          </MenuItem>
        )}
        {selectedMessage && canDeleteMessage(selectedMessage) && (
          <MenuItem 
            onClick={handleDeleteMessage}
            sx={{
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            Mesajı Sil
          </MenuItem>
        )}
      </Menu>
      
      {/* Minimized Chat Badge */}
      {isMinimized && unreadCount > 0 && (
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
          <Badge badgeContent={unreadCount} color="error">
            <Chat />
          </Badge>
        </Fab>
      )}
    </>
  );
}

export default FloatingChat;
