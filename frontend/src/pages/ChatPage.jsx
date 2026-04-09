import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  TextField,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  Chat as ChatIcon,
  Send,
  Search,
  ErrorOutline
} from '@mui/icons-material';
import useAuthStore from '../store/useAuthStore';
import axiosInstance from '../lib/axios';

// --- SAĞ PANELDEKİ SOHBET ALANI BİLEŞENİ ---

const ChatPanel = ({ partner, currentUser, onBack, onMessagesRead }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Partner değiştiğinde sohbeti ve mesajları çek
  useEffect(() => {
    let isActive = true;
    // Partner değiştiğinde her şeyi sıfırla
    setMessages([]);
    setChatId(null);
    setLoading(false);
    setError(false);
    if (!partner?._id) return;
    setLoading(true);
    setError(false);
    const loadChatData = async () => {
      try {
        // Sohbet ID'sini al veya oluştur
        const res = await axiosInstance.get(`chats/user/${partner._id}`);
        const newChatId = res.data.chat._id;
        if (!isActive) return;
        setChatId(newChatId);
        // Mesajları çek
        const msgRes = await axiosInstance.get(`chats/${newChatId}/messages`);
        if (!isActive) return;
        setMessages(msgRes.data.messages);
        if (onMessagesRead) onMessagesRead();
      } catch (err) {
        if (!isActive) return;
        console.error("Yükleme hatası:", err);
        setError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    loadChatData();
    return () => { isActive = false; };
  }, [partner?._id, onMessagesRead]);

  // Mesajlar gelince aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!chatId) {
      setError(true);
      alert("Sohbet başlatılamadı. Lütfen tekrar deneyin.");
      return;
    }
    const messageText = newMessage.trim();
    setNewMessage('');
    try {
      const response = await axiosInstance.post(`/chats/${chatId}/messages`, {
        content: messageText
      });
      setMessages(prev => [
        ...prev,
        {
          ...response.data.message,
          sender: response.data.message.sender && typeof response.data.message.sender === 'object'
            ? response.data.message.sender
            : { _id: response.data.message.sender }
        }
      ]);
      if (onMessagesRead) onMessagesRead();
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
      setNewMessage(messageText); // Hata olursa mesajı kutuya geri koy
      setError(true);
      alert("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    }
  };

  if (!partner || !partner._id) {
    return (
      <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 18 }}>
        Sohbet başlatmak için geçerli bir kullanıcı seçin.
      </Box>
    );
  }

  console.log("Seçili partner:", partner);
console.log("chatId:", chatId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <CircularProgress sx={{ color: '#8c1c2b' }} />
        <Typography mt={2} color="text.secondary">Sohbet yükleniyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', p: 3, textAlign: 'center' }}>
        <ErrorOutline sx={{ fontSize: 60, color: '#e53935', mb: 2 }} />
        <Typography variant="h6" color="text.primary">Mesajlar Alınamadı</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>Sunucuyla bağlantı kurulurken bir sorun oluştu.</Typography>
        <Button variant="outlined" onClick={onBack} sx={{ color: '#8c1c2b', borderColor: '#8c1c2b' }}>Geri Dön</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* SOHBET HEADER */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        bgcolor: '#fff',
        gap: 2,
        flexShrink: 0
      }}>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton onClick={onBack} edge="start" sx={{ color: '#666' }}>
            <ArrowBack />
          </IconButton>
        </Box>

        <Avatar src={partner.profileImage} sx={{ width: 44, height: 44 }}>
          {partner.fullname?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
            {partner.fullname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {partner.username ? `@${partner.username}` : 'Kullanıcı'}
          </Typography>
        </Box>
      </Box>

      {/* MESAJLAR ALANI */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: { xs: 2, md: 3 },
        bgcolor: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': { background: '#dcdcdc', borderRadius: '10px' }
      }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ bgcolor: 'rgba(0,0,0,0.05)', px: 2, py: 1, borderRadius: 2 }}>
              Henüz mesaj yok. İlk mesajı siz gönderin!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender && msg.sender._id === currentUser?._id;
            return (
              <Box
                key={msg._id || index}
                sx={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  minWidth: '10%',
                  bgcolor: isMe ? '#8c1c2b' : '#fff',
                  color: isMe ? '#fff' : 'text.primary',
                  p: 1.5,
                  borderRadius: 2,
                  borderBottomRightRadius: isMe ? 0 : 8,
                  borderBottomLeftRadius: !isMe ? 0 : 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                    fontSize: '0.65rem',
                    color: isMe ? 'rgba(255,255,255,0.7)' : 'text.disabled'
                  }}
                >
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </Typography>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* MESAJ YAZMA İNPUTU */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          bgcolor: '#fff',
          borderTop: '1px solid #eee',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          flexShrink: 0
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Bir mesaj yazın..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              bgcolor: '#f8f9fa',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: '#e0e0e0' },
              '&.Mui-focused fieldset': { borderColor: '#8c1c2b' },
            }
          }}
        />
        <IconButton
          type="submit"
          disabled={!newMessage.trim()}
          sx={{
            bgcolor: newMessage.trim() ? '#8c1c2b' : '#f5f5f5',
            color: newMessage.trim() ? 'white' : '#bdbdbd',
            width: 48,
            height: 48,
            mb: 0.5,
            '&:hover': { bgcolor: newMessage.trim() ? '#6b0f1a' : '#f5f5f5' }
          }}
        >
          <Send sx={{ ml: 0.5 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

// --- ANA SAYFA BİLEŞENİ (ChatPage) ---
export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Seçili partneri localStorage'da sakla ---
  const PARTNER_KEY = 'worknest_selected_partner_id';

  // --- KRİTİK DÜZELTME: useCallback ile fonksiyon referansını koruyoruz ---
  const fetchConversations = useCallback(async () => {
    try {
      const response = await axiosInstance.get('messages/conversations');
      setConversations(response.data);
    } catch (err) {
      console.error("Konuşmalar yüklenemedi:", err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchConversations().finally(() => setLoading(false));
    }
  }, [user, fetchConversations]);

  // Seçili partneri localStorage'dan yükle, partner yoksa temizle
  useEffect(() => {
    if (!user) {
      setSelectedPartner(null);
      localStorage.removeItem(PARTNER_KEY);
      return;
    }
    const storedPartnerId = localStorage.getItem(PARTNER_KEY);
    if (storedPartnerId && conversations.length > 0) {
      const foundConv = conversations.find(conv => conv.partner._id === storedPartnerId);
      if (foundConv) {
        setSelectedPartner(foundConv.partner);
      } else {
        setSelectedPartner(null);
        localStorage.removeItem(PARTNER_KEY);
      }
    }
    if (!storedPartnerId) {
      setSelectedPartner(null);
    }
  }, [user, conversations]);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
      const filteredUsers = response.data.filter(u => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Arama hatası:", err);
      setUsers([]);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleSelectPartner = async (partnerData) => {
    setSelectedPartner(null);
    setIsSearching(false);
    if (partnerData?._id) {
      localStorage.setItem(PARTNER_KEY, partnerData._id);
      try {
        // Sohbeti başlat veya bul
        const res = await axiosInstance.get(`chats/user/${partnerData._id}`);
        // Partner bilgisini backend'den gelen partner ile güncelle
        setSelectedPartner(res.data.chat.partner || partnerData);
      } catch (err) {
        console.error("Sohbet başlatılamadı:", err);
        setSelectedPartner(partnerData); // Yine de partner'ı göster
      }
    }
  };

  // Kullanıcı değişirse seçili partneri temizle (garanti için)
  useEffect(() => {
    setSelectedPartner(null);
    localStorage.removeItem(PARTNER_KEY);
  }, [user?._id]);

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
        <Typography variant="h6" color="text.secondary">Lütfen giriş yapın.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'absolute',
      top: '64px',
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      bgcolor: '#fff',
      overflow: 'hidden',
      zIndex: 10
    }}>

      {/* SOL PANEL */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: selectedPartner ? 0 : '100%', md: 360 },
          flexShrink: 0,
          borderRadius: 0,
          display: { xs: selectedPartner ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          boxShadow: 'none',
          borderRight: '1px solid #eaeaea',
          bgcolor: '#fafafa'
        }}
      >
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #6b0f1a, #8c1c2b)', color: 'white', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ChatIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Mesajlar</Typography>
          </Box>

          {isSearching ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'white', borderRadius: 2, px: 1 }}>
              <IconButton size="small" onClick={() => { setIsSearching(false); setSearchQuery(""); }} sx={{ color: '#8c1c2b' }}>
                <ArrowBack fontSize="small" />
              </IconButton>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Kişi ara..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{ disableUnderline: true, sx: { fontSize: '0.95rem', py: 1 } }}
                autoFocus
              />
            </Box>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search />}
              onClick={() => setIsSearching(true)}
              disableElevation
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: '12px',
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                justifyContent: 'flex-start',
                px: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              Kişilerde Ara...
            </Button>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={28} sx={{ color: "#8c1c2b" }} />
            </Box>
          ) : isSearching ? (
            <List sx={{ p: 1 }}>
              {users.length === 0 && searchQuery ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>Kullanıcı bulunamadı.</Typography>
              ) : (
                users.map((u) => (
                  <ListItem
                    component="button"
                    key={u._id}
                    onClick={() => handleSelectPartner(u)}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar src={u.profileImage}>{u.fullname?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={u.fullname} secondary={u.username ? `@${u.username}` : "Kullanıcı"} />
                  </ListItem>
                ))
              )}
            </List>
          ) : (
            <List sx={{ p: 1 }}>
              {conversations.map((conv) => (
                <ListItem
                  component="button"
                  key={conv.partner._id}
                  onClick={() => handleSelectPartner(conv.partner)}
                  selected={selectedPartner?._id === conv.partner._id}
                  sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: 'rgba(107, 15, 26, 0.08)' } }}
                >
                  <ListItemAvatar>
                    <Avatar src={conv.partner.profileImage}>{conv.partner.fullname?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.partner.fullname}
                    secondary={conv.lastMessage?.content || 'Mesaj yok'}
                    primaryTypographyProps={{ fontWeight: conv.unreadCount > 0 ? 700 : 500 }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                  {conv.unreadCount > 0 && <Box sx={{ bgcolor: '#e53935', color: 'white', px: 1, borderRadius: 3, fontSize: '0.75rem' }}>{conv.unreadCount}</Box>}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* SAĞ PANEL */}
      <Box sx={{ flex: 1, display: { xs: selectedPartner ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', bgcolor: '#fff', minWidth: 0 }}>
        {selectedPartner ? (
          <ChatPanel
            partner={selectedPartner}
            currentUser={user}
            onBack={() => setSelectedPartner(null)}
            onMessagesRead={fetchConversations}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#fdfdfd' }}>
            <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(107, 15, 26, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <ChatIcon sx={{ fontSize: 60, color: 'rgba(107, 15, 26, 0.2)' }} />
            </Box>
            <Typography color="#8c1c2b" fontSize={22} fontWeight={600} mb={1}>WorkNest Mesajlar</Typography>
            <Typography color="text.secondary" variant="body2">Sohbet etmek için soldaki listeden birini seçin.</Typography>
          </Box>
        )}
      </Box>

    </Box>
  );
}