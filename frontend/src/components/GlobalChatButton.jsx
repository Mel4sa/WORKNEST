import React, { useState } from 'react';
import { 
  Fab, 
  Tooltip, 
  Paper, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Divider,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  Tab,
  Tabs
} from '@mui/material';
import { ChatBubble, Remove, Close, Add, Search, Person } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import FloatingChat from './FloatingChat';
import useAuthStore from '../store/useAuthStore';
import axiosInstance from '../lib/axios';

function GlobalChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: conversations, 1: new chat
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Sadece profil sayfasında göster
  const shouldShow = location.pathname === '/profile' && user;

  console.log('🎯 GlobalChatButton render - pathname:', location.pathname, 'user:', !!user, 'shouldShow:', shouldShow);

  if (!shouldShow) return null;

  // Konuşmaları getir
  const fetchConversations = async () => {
    try {
      console.log('🚀 fetchConversations başladı');
      setLoading(true);
      
      // Timeout ekleyelim - 5 saniyeden fazla sürerse iptal et
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      const fetchPromise = axiosInstance.get('/messages/conversations');
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('✅ Konuşmalar geldi:', response.data);
      setConversations(response.data);
    } catch (error) {
      console.error('❌ Konuşmalar getirilemedi:', error);
      if (error.message === 'Timeout') {
        console.log('⏰ Konuşmalar yükleme zaman aşımı');
      }
      setConversations([]);
    } finally {
      setLoading(false);
      console.log('🏁 fetchConversations bitti');
    }
  };

  // Kullanıcıları ara
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
      // Kendimizi hariç tutalım
      const filteredUsers = response.data.filter(u => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatToggle = () => {
    console.log('🔄 Chat toggle tıklandı, isOpen:', isOpen);
    if (isOpen) {
      setIsOpen(false);
      setSelectedPartnerId(null);
      setActiveTab(0);
      setSearchQuery('');
      setUsers([]);
    } else {
      console.log('📱 Chat açılıyor...');
      setIsOpen(true);
      
      // Chat'i hemen aç, konuşmaları arka planda yükle
      setTimeout(() => {
        if (activeTab === 0) { // Sadece konuşmalar tab'ındaysak
          fetchConversations();
        }
      }, 100);
    }
  };

  const handleSelectConversation = (partnerId) => {
    setSelectedPartnerId(partnerId);
  };

  const handleStartNewChat = (partnerId) => {
    setSelectedPartnerId(partnerId);
  };

  const handleBackToList = () => {
    setSelectedPartnerId(null);
    setSearchQuery('');
    setUsers([]);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
    setUsers([]);
    if (newValue === 0 && conversations.length === 0) {
      // Sadece konuşmalar boşsa yükle
      fetchConversations();
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (activeTab === 1) {
      searchUsers(query);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Tooltip title={isOpen ? "Chat'i Kapat" : "Chat'i Aç"} placement="left">
        <Fab
          color="primary"
          onClick={handleChatToggle}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #6b0f1a, #8c1c2b)',
            color: 'white',
            width: 60,
            height: 60,
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(107, 15, 26, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8c1c2b, #a82936)',
              transform: 'scale(1.1)',
              boxShadow: '0 6px 25px rgba(107, 15, 26, 0.6)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isOpen ? <Remove /> : <ChatBubble />}
        </Fab>
      </Tooltip>

      {/* Chat Widget */}
      {isOpen && (
        <Box sx={{
          position: 'fixed',
          bottom: 100,
          right: 24,
          zIndex: 9999, // Z-index'i artırdım
        }}>
          {selectedPartnerId ? (
            // Belirli bir kişiyle chat
            <FloatingChat
              partnerId={selectedPartnerId}
              onClose={() => setIsOpen(false)}
              onBack={handleBackToList}
              initialMinimized={false}
            />
          ) : (
            // Konuşmalar listesi veya yeni chat
            <Paper 
              elevation={8}
              sx={{ 
                width: 450,
                height: 400,
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <Box sx={{ 
                backgroundColor: '#4a0d16',
                color: 'white'
              }}>
                <Box sx={{ 
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Mesajlar
                  </Typography>
                  <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Close />
                  </IconButton>
                </Box>

                {/* Tabs */}
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-selected': {
                        color: 'white'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'white'
                    }
                  }}
                >
                  <Tab label="Konuşmalar" />
                  <Tab label="Yeni Chat" />
                </Tabs>
              </Box>

              {/* Search bar for new chat */}
              {activeTab === 1 && (
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Kullanıcı ara..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#666' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                      }
                    }}
                  />
                </Box>
              )}

              {/* Content */}
              <Box sx={{ flex: 1, overflow: 'auto', minHeight: 280 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                    <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                      Konuşmalar yükleniyor...
                    </Typography>
                  </Box>
                ) : activeTab === 0 ? (
                  // Konuşmalar listesi
                  conversations.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      minHeight: 280,
                      p: 4
                    }}>
                      <ChatBubble sx={{ fontSize: 64, color: '#e0e0e0', mb: 3 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                        Mesajlarınız
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                        Henüz hiç mesajlaşmanız yok.{'\n'}Yeni bir konuşma başlatın!
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setActiveTab(1)}
                        sx={{
                          background: 'linear-gradient(135deg, #6b0f1a, #8c1c2b)',
                          color: 'white',
                          borderRadius: '20px',
                          px: 3,
                          py: 1,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8c1c2b, #a82936)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(107, 15, 26, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Yeni Konuşma Başlat
                      </Button>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {conversations.map((conversation, index) => (
                        <React.Fragment key={conversation.partner._id}>
                          <ListItem 
                            button 
                            onClick={() => handleSelectConversation(conversation.partner._id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(107, 15, 26, 0.08)'
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={conversation.partner.profileImage}
                                sx={{ width: 40, height: 40 }}
                              >
                                {conversation.partner.fullname?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={conversation.partner.fullname}
                              secondary={
                                conversation.lastMessage?.content 
                                  ? conversation.lastMessage.content.substring(0, 50) + '...'
                                  : 'Mesaj yok'
                              }
                              primaryTypographyProps={{
                                fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                                fontSize: '0.9rem'
                              }}
                              secondaryTypographyProps={{
                                fontSize: '0.8rem'
                              }}
                            />
                            {conversation.unreadCount > 0 && (
                              <Box sx={{
                                backgroundColor: '#6b0f1a',
                                color: 'white',
                                borderRadius: '50%',
                                minWidth: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}>
                                {conversation.unreadCount}
                              </Box>
                            )}
                          </ListItem>
                          {index < conversations.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )
                ) : (
                  // Yeni chat - kullanıcı arama
                  searchQuery.trim() === '' ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Person sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Mesaj göndermek için bir kullanıcı arayın
                      </Typography>
                    </Box>
                  ) : users.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Kullanıcı bulunamadı
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {users.map((searchedUser, index) => (
                        <React.Fragment key={searchedUser._id}>
                          <ListItem 
                            button 
                            onClick={() => handleStartNewChat(searchedUser._id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(107, 15, 26, 0.08)'
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={searchedUser.profileImage}
                                sx={{ width: 40, height: 40 }}
                              >
                                {searchedUser.fullname?.[0]}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={searchedUser.fullname}
                              secondary={searchedUser.username ? `@${searchedUser.username}` : (searchedUser.title || `ID: ${searchedUser._id.slice(-6)}`)}
                              primaryTypographyProps={{
                                fontSize: '0.9rem'
                              }}
                              secondaryTypographyProps={{
                                fontSize: '0.8rem'
                              }}
                            />
                          </ListItem>
                          {index < users.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )
                )}
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </>
  );
}

export default GlobalChatButton;
