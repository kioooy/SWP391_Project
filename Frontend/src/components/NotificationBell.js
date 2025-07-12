import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 380,
    maxHeight: 500,
    overflow: 'auto',
  },
}));

const NotificationItem = styled(MenuItem)(({ theme, unread }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: unread ? theme.palette.action.hover : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      // Sử dụng API thực tế
      const response = await fetch(`/api/Notification/GetUserNotifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } else {
        console.error('Error fetching notifications:', response.status);
        // Fallback to mock data for demo
        const mockNotifications = [
          {
            notificationId: 1,
            title: '🩸 Nhắc nhở hiến máu',
            message: 'Bạn đã có thể hiến máu lại! Hãy đăng ký ngay để cứu người.',
            notificationType: 'ReadyToDonate',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
            isRead: false,
          },
          {
            notificationId: 2,
            title: '⏰ Sắp đến ngày hiến máu',
            message: 'Còn 3 ngày nữa bạn có thể hiến máu lại. Ngày: 15/12/2024',
            notificationType: 'AlmostReady',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 ngày trước
            isRead: false,
          },
          {
            notificationId: 3,
            title: '🎉 Chào mừng bạn!',
            message: 'Bạn chưa hiến máu lần nào. Hãy đăng ký hiến máu để cứu người!',
            notificationType: 'FirstTime',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 ngày trước
            isRead: true,
          },
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock data for demo
      const mockNotifications = [
        {
          notificationId: 1,
          title: '🩸 Nhắc nhở hiến máu',
          message: 'Bạn đã có thể hiến máu lại! Hãy đăng ký ngay để cứu người.',
          notificationType: 'ReadyToDonate',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
        },
        {
          notificationId: 2,
          title: '⏰ Sắp đến ngày hiến máu',
          message: 'Còn 3 ngày nữa bạn có thể hiến máu lại. Ngày: 15/12/2024',
          notificationType: 'AlmostReady',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: false,
        },
        {
          notificationId: 3,
          title: '🎉 Chào mừng bạn!',
          message: 'Bạn chưa hiến máu lần nào. Hãy đăng ký hiến máu để cứu người!',
          notificationType: 'FirstTime',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRead: true,
        },
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/Notification/MarkAsRead/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Cập nhật local state
        setNotifications(prev => 
          prev.map(n => 
            n.notificationId === notificationId 
              ? { ...n, isRead: true } 
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error marking as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/Notification/MarkAllAsRead/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Cập nhật local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      } else {
        console.error('Error marking all as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'FirstTime': return '🎉';
      case 'ReadyToDonate': return '🩸';
      case 'AlmostReady': return '⏰';
      case 'RecoveryReminder': return '🔄';
      default: return '📢';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return '1 ngày trước';
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const handleNotificationClick = (notification) => {
    // Không tự động đánh dấu đã đọc nữa
    // Chỉ điều hướng nếu cần
    switch (notification.notificationType) {
      case 'ReadyToDonate':
      case 'FirstTime':
        window.location.href = '/booking';
        break;
      case 'AlmostReady':
        window.location.href = '/dashboard';
        break;
      default:
        break;
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'black',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
      </IconButton>

      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              📢 Thông báo ({notifications.length})
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ fontSize: '0.75rem' }}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ maxHeight: showAll ? 700 : 400, overflow: 'auto', transition: 'max-height 0.3s' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Không có thông báo nào
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                unread={!notification.isRead}
                onClick={() => handleNotificationClick(notification)}
                sx={{ cursor: 'pointer', position: 'relative' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      mr: 2,
                      fontSize: '1.2rem',
                    }}
                  >
                    {getNotificationIcon(notification.notificationType)}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={notification.isRead ? 'normal' : 'bold'}
                        sx={{ flex: 1 }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.isRead && (
                        <CircleIcon
                          sx={{
                            fontSize: 8,
                            color: 'primary.main',
                            ml: 1,
                          }}
                        />
                      )}
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        maxWidth: '100%',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {notification.message}
                    </Typography>
                    
                    <Typography
                      variant="caption"
                      color="text.disabled"
                    >
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>
                  {/* Nút Đã đọc */}
                  {!notification.isRead && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ ml: 2, minWidth: 60, fontSize: '0.75rem', height: 28 }}
                      onClick={e => {
                        e.stopPropagation(); // Không trigger onClick của NotificationItem
                        markAsRead(notification.notificationId);
                      }}
                    >
                      Đã đọc
                    </Button>
                  )}
                </Box>
              </NotificationItem>
            ))
          )}
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setShowAll(true)}
              disabled={showAll}
            >
              Xem thông báo trước đó
            </Button>
          </Box>
        )}
      </StyledMenu>
    </>
  );
};

export default NotificationBell; 