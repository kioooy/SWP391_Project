import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Link,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {/* Link for Logo */}
          <Link component={RouterLink} to="/" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/assets/logo.png" alt="Logo" style={{ height: 48, width: 48, borderRadius: 8, objectFit: 'cover' }} />
          </Link>
          {/* Spacer Box for spacing */}
          <Box sx={{ width: 16 }} />
          {/* Link for Text */}
          <Link component={RouterLink} to="/" underline="none">
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935', letterSpacing: 1 }}>
              Blood Donation
            </Typography>
          </Link>
        </Box>

        {/* Menu Items */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mr: 2
          }}
        >
          <Button 
            color="inherit" 
            onClick={() => navigate('/faq')}
            sx={{ color: '#666' }}
          >
            Hỏi - Đáp
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/news')}
            sx={{ color: '#666' }}
          >
            Tin Tức
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/contact')}
            sx={{ color: '#666' }}
          >
            Liên Hệ
          </Button>
        </Box>

        {user ? (
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfile}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  bgcolor: '#e53935',
                  width: 40,
                  height: 40,
                }}
              >
                {user.firstName?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button 
            color="inherit" 
            variant="outlined" 
            sx={{ 
              color: '#e53935',
              borderColor: '#e53935',
              '&:hover': {
                borderColor: '#e53935',
                bgcolor: 'rgba(229,57,53,0.04)'
              }
            }}
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 