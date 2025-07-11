import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Container } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from '@mui/icons-material/Assignment';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import { useSelector } from "react-redux";

const drawerWidth = 300;

const SidebarLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Các mục sidebar cho Staff/Admin
  const menuItems = [
    { path: user?.role === 'Admin' ? "/profile-admin" : user?.role === 'Staff' ? "/profile-staff" : "/profile", label: "Hồ sơ", icon: <PersonIcon /> },
    { path: "/dashboard", label: "Bảng Thông Tin", icon: <DashboardIcon /> },
    { path: "/blood-workflow", label: "Yêu Cầu Truyền Máu", icon: <WorkflowIcon /> },
    { path: "/manage-requests", label: "Yêu Cầu Hiến Máu", icon: <AssignmentIcon /> },
    { path: "/manage-urgent-request", label: "Yêu Cầu Khẩn Cấp", icon: <WarningIcon /> },
    { path: "/blood-search", label: "Tìm Máu", icon: <BloodtypeIcon /> },
    { path: "/donor-mobilization", label: "Huy Động", icon: <GroupIcon /> },
    { path: "/search-distance", label: "Tìm Quanh Bạn", icon: <LocationOnIcon /> },
    { path: "/search-by-distance", label: "Tìm Nâng Cao", icon: <SearchIcon /> },
    { path: "/manage-blood-periods", label: "Đợt Hiến Máu", icon: <BloodtypeIcon /> },
    { path: "/blood-inventory", label: "Kho Máu", icon: <BloodtypeIcon /> },
    { path: "/manage-article", label: "Tài Liệu", icon: <MenuBookIcon /> },
    { path: "/manage-blog", label: "Bài Viết", icon: <EditNoteIcon /> },
  ];

  // Nếu là Staff, ẩn một số mục chỉ dành cho Admin và ẩn cả blood-inventory, manage-blood-periods
  const filteredMenu = user?.role === 'Staff'
    ? menuItems.filter(item => !["/manage-roles", "/manage-users", "/dashboard", "/hospital-location", "/blood-inventory", "/manage-blood-periods", "/manage-article", "/manage-blog"].includes(item.path))
    : menuItems;

  return (
    <Box sx={{ display: "flex", minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            background: '#fff',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight="bold" color="primary">Quản lý hệ thống</Typography>
        </Toolbar>
        <Divider />
        <List>
          {filteredMenu.map((item) => (
            <ListItem
              button
              key={item.path}
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                mx: 1,
                bgcolor: location.pathname.startsWith(item.path) ? 'primary.light' : 'inherit',
                color: location.pathname.startsWith(item.path) ? 'primary.main' : 'inherit',
                '&:hover': {
                  bgcolor: location.pathname.startsWith(item.path) ? 'primary.light' : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#E53935' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ noWrap: true }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            backgroundColor: '#fff',
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            p: 3,
            minHeight: 'calc(100vh - 48px)',
            border: '1px solid rgba(0,0,0,0.08)',
            width: '100%',
            height: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout; 