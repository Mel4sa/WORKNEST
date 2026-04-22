import React, { useState, useEffect, useRef, useCallback } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
  ErrorOutline,
  Delete
} from '@mui/icons-material';
import useAuthStore from '../store/useAuthStore';
import axiosInstance from '../lib/axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ProfileSnackbar from '../components/profile/ProfileSnackbar';


const ChatPanel = ({ partner, chatId, currentUser, onBack, onMessagesRead, loading: externalLoading }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let isActive = true;
    const loadChatData = async () => {
      try {
        const msgRes = await axiosInstance.get(`chats/${chatId}/messages`);
        if (isActive) {
          setMessages(msgRes.data.messages);
          if (onMessagesRead) onMessagesRead();
        }
      } catch (err) {
        if (isActive) {
          if (err.response && err.response.status === 404) {
            setMessages([]);
            setError(false);
          } else {
            setError(true);
          }
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadChatData();
    return () => { isActive = false; };
  }, [chatId, onMessagesRead]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mesajı sil
  const handleDeleteMessage = async (messageId) => {
    try {
      await axiosInstance.delete(`/chats/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
    } catch (err) {
      alert('Mesaj silinemedi.');
    }
    setContextMenu(null);
  };

  // Mesajı düzenle
  const handleEditMessage = (msg) => {
    setEditMessageId(msg._id);
    setEditMessageText(msg.content);
    setContextMenu(null);
  };

  const handleEditMessageSave = async () => {
    try {
      await axiosInstance.put(`/chats/messages/${editMessageId}`, { content: editMessageText });
      setMessages(prev => prev.map(m => m._id === editMessageId ? { ...m, content: editMessageText } : m));
      setEditMessageId(null);
      setEditMessageText('');
    } catch (err) {
      let msg = 'Mesaj düzenlenemedi.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleContextMenu = (event, msg) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, message: msg }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

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
      setNewMessage(messageText); 
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

  if (externalLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <CircularProgress sx={{ color: '#8c1c2b' }} />
        <Typography mt={2} color="text.secondary">Sohbet yükleniyor...</Typography>
      </Box>
    );
  }

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      
  <Box sx={{ position: 'fixed', top: '96px', left: 0, right: 0, zIndex: 30000, pointerEvents: 'none' }}>
        <ProfileSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', bgcolor: '#fff', gap: 2, flexShrink: 0 }}>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton onClick={onBack} edge="start" sx={{ color: '#666' }}>
            <ArrowBack />
          </IconButton>
        </Box>
        <Avatar src={partner.profileImage} sx={{ width: 44, height: 44 }}>{partner.fullname?.[0]}</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>{partner.fullname}</Typography>
          <Typography variant="body2" color="text.secondary">{partner.title || 'Kullanıcı'}</Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, bgcolor: '#f5f7fa', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ bgcolor: 'rgba(0,0,0,0.05)', px: 2, py: 1, borderRadius: 2 }}>
              Henüz mesaj yok. İlk mesajı siz gönderin!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender && (msg.sender._id === currentUser?._id || msg.sender === currentUser?._id);
            if (editMessageId === msg._id) {
              return (
                <Box key={msg._id || index} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', minWidth: '10%', bgcolor: isMe ? '#8c1c2b' : '#fff', color: isMe ? '#fff' : 'text.primary', p: 1.5, borderRadius: 2, borderBottomRightRadius: isMe ? 0 : 8, borderBottomLeftRadius: !isMe ? 0 : 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', wordBreak: 'break-word' }}>
                  <TextField
                    value={editMessageText}
                    onChange={e => setEditMessageText(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    maxRows={4}
                    sx={{ bgcolor: '#fff', borderRadius: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button variant="contained" color="primary" size="small" onClick={handleEditMessageSave}>Kaydet</Button>
                    <Button variant="outlined" size="small" onClick={() => setEditMessageId(null)}>İptal</Button>
                  </Box>
                </Box>
              );
            }
            return (
              <Box
                key={msg._id || index}
                sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%', minWidth: '10%', bgcolor: isMe ? '#8c1c2b' : '#fff', color: isMe ? '#fff' : 'text.primary', p: 1.5, borderRadius: 2, borderBottomRightRadius: isMe ? 0 : 8, borderBottomLeftRadius: !isMe ? 0 : 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', wordBreak: 'break-word', position: 'relative' }}
                onContextMenu={e => handleContextMenu(e, msg)}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, fontSize: '0.65rem', color: isMe ? 'rgba(255,255,255,0.7)' : 'text.disabled' }}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </Typography>
              </Box>
            );
          })
        )}
        <Menu
          open={!!contextMenu}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => handleEditMessage(contextMenu?.message)} disabled={contextMenu?.message && contextMenu?.message.sender && (contextMenu.message.sender._id !== currentUser?._id && contextMenu.message.sender !== currentUser?._id)}>
            Mesajı Düzenle
          </MenuItem>
          <MenuItem onClick={() => handleDeleteMessage(contextMenu?.message?._id)} disabled={contextMenu?.message && contextMenu?.message.sender && (contextMenu.message.sender._id !== currentUser?._id && contextMenu.message.sender !== currentUser?._id)}>
            Mesajı Sil
          </MenuItem>
        </Menu>

        <div ref={messagesEndRef} />
      </Box>

      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Bir mesaj yazın..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          inputRef={messageInputRef}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', bgcolor: '#f8f9fa', '& fieldset': { borderColor: 'transparent' }, '&:hover fieldset': { borderColor: '#e0e0e0' }, '&.Mui-focused fieldset': { borderColor: '#8c1c2b' } } }}
        />
        <IconButton type="submit" disabled={!newMessage.trim()} sx={{ bgcolor: newMessage.trim() ? '#8c1c2b' : '#f5f5f5', color: newMessage.trim() ? 'white' : '#bdbdbd', width: 48, height: 48, mb: 0.5, '&:hover': { bgcolor: newMessage.trim() ? '#6b0f1a' : '#f5f5f5' } }}>
          <Send sx={{ ml: 0.5 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

// ANA SAYFA BİLEŞENİ
export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const PARTNER_KEY = 'worknest_selected_partner_id';

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axiosInstance.get('messages/conversations');
      const normalized = response.data.map(conv => ({
        ...conv,
        chatId: conv.chatId || conv._id
      }));
      setConversations(normalized);
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
  useEffect(() => {
    const storedPartnerId = localStorage.getItem(PARTNER_KEY);
    if (storedPartnerId && conversations.length > 0 && !selectedPartner) {
      const foundConv = conversations.find(conv => conv.partner._id === storedPartnerId);
      if (foundConv) {
        setSelectedPartner(foundConv.partner);
        setSelectedChatId(foundConv._id || foundConv.chatId);
      }
    }
  }, [conversations]); 

  useEffect(() => {
    localStorage.removeItem('worknest_selected_partner_id');
    setSelectedPartner(null);
    setSelectedChatId(null);
  }, []);

  const searchUsers = async (query) => {
    if (!query.trim()) { setUsers([]); return; }
    try {
      const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
      setUsers(response.data.filter(u => u._id !== user._id));
    } catch (err) { console.error("Arama hatası:", err); setUsers([]); }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    searchUsers(event.target.value);
  };

  const handleSelectPartner = async (partnerData) => {
    setIsSearching(false);
    if (!partnerData?._id) return;

    setConversations(prev => prev.map(conv =>
      conv.partner._id === partnerData._id ? { ...conv, unreadCount: 0 } : conv
    ));

    setSelectedPartner(partnerData);
    setSelectedChatId(null); 
    localStorage.setItem(PARTNER_KEY, partnerData._id);

    try {
      const res = await axiosInstance.get(`chats/user/${partnerData._id}`);
      if (localStorage.getItem(PARTNER_KEY) === partnerData._id) {
        setSelectedChatId(res.data.chat._id);
      }
    } catch (err) {
      console.error("Sohbet bulunamadı:", err);
      setSelectedChatId(null);
    }
  };

  const handleDeleteClick = (conv) => {
    setDeleteTarget(conv);
    setDeleteDialogOpen(true);
  };

const handleDeleteConfirm = async () => {
  if (!deleteTarget) return;

  try {
  await axiosInstance.delete(`/chats/${deleteTarget.chatId}`);

    setConversations(prev => prev.filter(c => c.chatId !== deleteTarget.chatId));

    if (selectedChatId === deleteTarget.chatId) {
      setSelectedPartner(null);
      setSelectedChatId(null);
      localStorage.removeItem(PARTNER_KEY);
    }
    
  } catch (err) {
    console.error("Silme hatası:", err);
    alert('Sohbet silinemedi. Lütfen tekrar deneyin.');
  } finally {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  }
};

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)" }}>
        <Typography variant="h6" color="text.secondary">Lütfen giriş yapın.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'absolute', top: '64px', left: 0, right: 0, bottom: 0, display: 'flex', bgcolor: '#fff', overflow: 'hidden', zIndex: 10 }}>
      {/* SOL PANEL */}
      <Paper elevation={0} sx={{ width: { xs: selectedPartner ? 0 : '100%', md: 360 }, flexShrink: 0, display: { xs: selectedPartner ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', borderRight: '1px solid #eaeaea', bgcolor: '#fafafa' }}>
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #6b0f1a, #8c1c2b)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ChatIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>Mesajlar</Typography>
          </Box>
          {isSearching ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'white', borderRadius: 2, px: 1 }}>
              <IconButton size="small" onClick={() => { setIsSearching(false); setSearchQuery(""); }} sx={{ color: '#8c1c2b' }}><ArrowBack fontSize="small" /></IconButton>
              <TextField fullWidth variant="standard" placeholder="Kişi ara..." value={searchQuery} onChange={handleSearchChange} InputProps={{ disableUnderline: true, sx: { fontSize: '0.95rem', py: 1 } }} autoFocus />
            </Box>
          ) : (
            <Button fullWidth variant="contained" startIcon={<Search />} onClick={() => setIsSearching(true)} sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '12px', py: 1, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>Kişilerde Ara...</Button>
          )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress size={28} sx={{ color: "#8c1c2b" }} /></Box>
          ) : isSearching ? (
            <List sx={{ p: 1 }}>
              {users.map((u) => (
                <ListItem component="button" key={u._id} onClick={() => handleSelectPartner(u)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <ListItemAvatar><Avatar src={u.profileImage}>{u.fullname?.[0]}</Avatar></ListItemAvatar>
                  <ListItemText primary={u.fullname} secondary={u.username ? `@${u.username}` : "Kullanıcı"} />
                </ListItem>
              ))}
            </List>
          ) : (
            <List sx={{ p: 1 }}>
              {conversations.map((conv) => (
                <ListItem component="div" key={conv.partner._id} onClick={() => handleSelectPartner(conv.partner)} selected={selectedPartner?._id === conv.partner._id} sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: 'rgba(107, 15, 26, 0.08)' }, position: 'relative', cursor: 'pointer' }}>
                  <ListItemAvatar><Avatar src={conv.partner.profileImage}>{conv.partner.fullname?.[0]}</Avatar></ListItemAvatar>
                  <ListItemText primary={conv.partner.fullname} secondary={conv.lastMessage?.content || 'Mesaj yok'} primaryTypographyProps={{ fontWeight: conv.unreadCount > 0 ? 700 : 500 }} secondaryTypographyProps={{ noWrap: true }} />
                  {conv.unreadCount > 0 && <Box sx={{ bgcolor: '#e53935', color: 'white', px: 1, borderRadius: 3, fontSize: '0.75rem' }}>{conv.unreadCount}</Box>}
                  <IconButton edge="end" size="small" sx={{ ml: 1, color: '#bdbdbd', zIndex: 2 }} onClick={e => { e.stopPropagation(); handleDeleteClick(conv); }}>
                    <Delete />
                  </IconButton>
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
            key={selectedPartner._id}
            partner={selectedPartner}
            chatId={selectedChatId}
            currentUser={user}
            onBack={() => setSelectedPartner(null)}
            onMessagesRead={fetchConversations}
            loading={selectedPartner && !selectedChatId}
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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Sohbeti Sil</DialogTitle>
          <DialogContent>
            <Typography>
              <b>{deleteTarget?.partner?.fullname || 'Bu kişi'}</b> ile olan tüm mesajlar silinecek. Devam etmek istiyor musunuz?
            </Typography>
          </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Vazgeç</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Sohbeti Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}