import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  MarkAsUnread,
  Delete,
  CheckCircle,
  Person,
  Group,
  Update,
  Mail,
  Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';


function Bildirimler() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const response = await axiosInstance.get(`/notifications?page=${pageNum}&limit=20`);
      const { notifications: newNotifications, totalPages: total, unreadCount: unread } = response.data;
      
      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      
      setUnreadCount(unread);
      setHasMore(pageNum < total);
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
      setError('Bildirimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Bildirim okundu olarak işaretlenemedi:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Tüm bildirimler okundu olarak işaretlenemedi:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      if (!deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Bildirim silinemedi:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invite_sent':
      case 'invite_accepted':
      case 'invite_declined':
        return <Mail sx={{ color: '#4a0d16' }} />;
      case 'project_update':
        return <Update sx={{ color: '#f59e0b' }} />;
      case 'member_joined':
        return <Person sx={{ color: '#10b981' }} />;
      case 'member_left':
        return <Group sx={{ color: '#ef4444' }} />;
      case 'new_message':
        return <Mail sx={{ color: '#3b82f6' }} />;
      default:
        return <NotificationIcon sx={{ color: '#6b7280' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'invite_sent':
      case 'invite_accepted':
      case 'invite_declined':
        return 'rgba(74, 13, 22, 0.1)';
      case 'project_update':
        return 'rgba(245, 158, 11, 0.1)';
      case 'member_joined':
        return 'rgba(16, 185, 129, 0.1)';
      case 'member_left':
        return 'rgba(239, 68, 68, 0.1)';
      case 'new_message':
        return 'rgba(59, 130, 246, 0.1)';
      default:
        return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const handleNotificationClick = (notification) => {
    console.log("🔥 handleNotificationClick çağrıldı:", {
      type: notification.type,
      relatedUser: notification.relatedUser,
      isRead: notification.isRead
    });

    // Mesaj bildirimlerinde direkt chat'e git
    if (notification.type === 'new_message' && notification.relatedUser) {
      console.log("✅ Mesaj bildirimi tespit edildi!");
      
      // Okunmamışsa okundu olarak işaretle
      if (!notification.isRead) {
        console.log("📖 Bildirim okundu olarak işaretleniyor...");
        handleMarkAsRead(notification._id);
      }
      
      // Direkt profile git ve chat aç
      const targetUrl = `/users/${notification.relatedUser._id}`;
      console.log("🎯 Mesaj bildirimine tıklandı, gidilecek URL:", targetUrl);
      console.log("🚀 Navigate çağrılıyor state ile:", { openChat: true });
      
      navigate(targetUrl, { 
        state: { openChat: true }
      });
      return;
    }

    console.log("❌ Mesaj bildirimi değil, normal akış devam ediyor");

    // Diğer bildirimler için eski davranış
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Bildirim türüne göre yönlendirme
    if (notification.relatedProject && notification.type.includes('invite')) {
      navigate('/invites');
    } else if (notification.relatedProject) {
      navigate(`/projects/${notification.relatedProject._id}`);
    }
  };

  if (loading && page === 1) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafbfc', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Tüm bildirimlerinizi buradan takip edebilirsiniz
            </Typography>
            
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={handleMarkAllAsRead}
                sx={{
                  borderColor: '#4a0d16',
                  color: '#4a0d16',
                  '&:hover': {
                    backgroundColor: 'rgba(74, 13, 22, 0.1)',
                    borderColor: '#4a0d16'
                  }
                }}
              >
                Tümünü Okundu İşaretle
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Bildirimler Listesi */}
        <Stack spacing={2}>
          {notifications.length === 0 ? (
            <Card sx={{ p: 6, textAlign: 'center', backgroundColor: '#fff' }}>
              <NotificationIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                Henüz bildiriminiz yok
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Yeni bildirimler geldiğinde burada görünecek
              </Typography>
            </Card>
          ) : (
            notifications.map((notification) => {
              console.log("🔍 Bildirim render ediliyor:", notification.type, notification._id);
              return (
              <Card
                key={notification._id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: notification.isRead ? '#fff' : getNotificationColor(notification.type),
                  border: notification.isRead ? '1px solid #e2e8f0' : '2px solid rgba(74, 13, 22, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => {
                  console.log("📱 Bildirim kartına tıklandı:", notification.type, notification);
                  handleNotificationClick(notification);
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Bildirim İkonu */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>

                    {/* İçerik */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1rem',
                            fontWeight: notification.isRead ? 600 : 700,
                            color: '#1e293b',
                            mb: 0.5
                          }}
                        >
                          {notification.title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                          {!notification.isRead && (
                            <Tooltip title="Okundu olarak işaretle">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id);
                                }}
                                sx={{ color: '#4a0d16' }}
                              >
                                <MarkAsUnread fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Sil">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification._id);
                              }}
                              sx={{ color: '#ef4444' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          lineHeight: 1.5,
                          mb: 2,
                          ...(notification.type === 'new_message' && notification.relatedUser && {
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#4a0d16',
                              textDecoration: 'underline'
                            }
                          })
                        }}
                        onClick={notification.type === 'new_message' && notification.relatedUser ? (e) => {
                          e.stopPropagation();
                          console.log("💬 Mesaj linkine tıklandı!");
                          navigate(`/users/${notification.relatedUser._id}`, { 
                            state: { openChat: true }
                          });
                        } : undefined}
                      >
                        {notification.message}
                      </Typography>

                      {/* Alt Bilgiler */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                          variant="caption"
                          sx={{ color: '#94a3b8' }}
                        >
                          {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>

                        {notification.relatedProject && (
                          <Chip
                            label={notification.relatedProject.title}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(74, 13, 22, 0.1)',
                              color: '#4a0d16',
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>

                      {/* İlgili Kullanıcı */}
                      {notification.relatedUser && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Avatar
                            src={notification.relatedUser.profileImage}
                            sx={{ width: 24, height: 24 }}
                          >
                            {notification.relatedUser.fullname?.[0]}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {notification.relatedUser.fullname}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              );
            })
          )}
        </Stack>

        {/* Daha Fazla Yükle Butonu */}
        {hasMore && notifications.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={loading}
              sx={{
                borderColor: '#4a0d16',
                color: '#4a0d16',
                '&:hover': {
                  backgroundColor: 'rgba(74, 13, 22, 0.1)',
                  borderColor: '#4a0d16'
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Yükleniyor...
                </>
              ) : (
                'Daha Fazla Göster'
              )}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Bildirimler;
