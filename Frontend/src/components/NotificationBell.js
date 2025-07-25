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
import { useNavigate } from 'react-router-dom';

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

const NotificationBell = ({ userId, isDonor, isRecipient, isAdmin, isStaff }) => {
  console.log('NotificationBell props:', { isDonor, isRecipient, isAdmin, isStaff, userId });
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  // Đặt fetchNotifications lên trước useEffect để tránh lỗi ReferenceError
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
        // ... fallback mock data ...
        if (isDonor === true) {
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
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      // ... fallback mock data ...
      if (isDonor === true) {
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
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

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
    const d = (date instanceof Date) ? date : new Date(date);
    const diffInHours = Math.floor((now - d) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return '1 ngày trước';
    return `${Math.floor(diffInHours / 24)} ngày trước`;
  };

  const handleNotificationClick = (notification) => {
    if (
      notification.notificationType === 'UrgentBloodRequest' ||
      (notification.title && notification.title.includes('Yêu cầu máu khẩn'))
    ) {
      navigate('/manage-urgent-request-v2');
    } else {
      // Xử lý các loại thông báo khác (nếu có)
    }
    handleClose();
  };

  // Chỉ render nếu là donor, recipient, admin hoặc staff
  if (!isDonor && !isRecipient && !isAdmin && !isStaff) return null;

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

        <Box>
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
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={notification.isRead ? 'normal' : 'bold'}
                        sx={{ flex: 1, pr: 1, wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}
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
                      {/* Nút Đã đọc */}
                      {!notification.isRead && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ ml: 2, minWidth: 60, fontSize: '0.75rem', height: 28, whiteSpace: 'nowrap' }}
                          onClick={e => {
                            e.stopPropagation(); // Không trigger onClick của NotificationItem
                            markAsRead(notification.notificationId);
                          }}
                        >
                          Đã đọc
                        </Button>
                      )}
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-line',
                        width: '100%',
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