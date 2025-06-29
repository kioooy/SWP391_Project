import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  Stack,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import { 
  //note
  LocationOn, 
  AccessTime, 
  OpenInNew, 
  Person, 
  Phone, 
  Email, 
  CalendarToday,
  LocalHospital,
  Bloodtype,
  CheckCircle,
  Cancel,
  Warning,
  Close
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useSelector } from "react-redux";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  borderRadius: "12px",
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
}));

const BloodDropAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: "#ff4757",
  marginRight: theme.spacing(2),
  position: "relative",
}));

const BloodDropIcon = () => (
  <Box
    sx={{
      width: 40,
      height: 40,
      backgroundColor: "white",
      borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 12,
        height: 12,
        backgroundColor: "white",
        borderRadius: "50%",
      },
    }}
  />
);

const AppointmentTitle = styled(Typography)(({ theme }) => ({
  color: "#4285f4",
  fontWeight: 600,
  fontSize: "18px",
  marginBottom: theme.spacing(1),
  cursor: "pointer",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const InfoText = styled(Typography)(({ theme }) => ({
  color: "#6c757d",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(0.5),
}));

const StatusChip = styled(Chip)(({ status }) => ({
  borderRadius: "20px",
  fontWeight: 600,
  fontSize: "13px",
  ...(status === "expired" && {
    backgroundColor: "#ff4757",
    color: "white",
  }),
  ...(status === "scheduled" && {
    backgroundColor: "#ffa502",
    color: "white",
  }),
}));

const DetailButton = styled(Button)(({ theme }) => ({
  color: "#4285f4",
  fontSize: "14px",
  textTransform: "none",
  padding: 0,
  minWidth: "auto",
  "&:hover": {
    backgroundColor: "transparent",
    textDecoration: "underline",
  },
}));

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [openDetailDialog, setOpenDetailDialog] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState([]);

  // Lấy nhóm máu từ profile (Redux)
  const user = useSelector(state => state.auth.user);
  const bloodType = user?.bloodType || user?.bloodTypeName || "Chưa rõ";

  React.useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        const res = await fetch(`${apiUrl}/DonationRequest/upcoming/all-role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Lỗi khi lấy lịch hẹn');
        const data = await res.json();
        setUpcomingAppointments(data || []);
      } catch (error) {
        setUpcomingAppointments([]);
      }
    };
    fetchUpcomingAppointments();
  }, []);

  const handleTitleClick = (appointmentId) => {
    console.log(`Clicked appointment ${appointmentId}`);
  };

  const handleDetailClick = (appointmentId) => {
    const appointment = upcomingAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment({
        ...appointment,
        detail: appointment.detail || {} // Đảm bảo detail luôn là một object
      });
      setOpenDetailDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
    setSelectedAppointment(null);
  };

  // Hàm hiển thị trạng thái dạng Chip
  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            label="Hoàn thành"
            color="success"
            size="small"
          />
        );
      case 'scheduled':
      case 'Approved':
        return (
          <Chip
            label="Đã lên lịch"
            color="primary"
            size="small"
          />
        );
      case 'cancelled':
      case 'Cancelled':
      case 'Rejected':
        return (
          <Chip
            label="Đã hủy"
            color="error"
            size="small"
          />
        );
      case 'Pending':
        return (
          <Chip
            label="Chờ duyệt"
            color="warning"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        component="h1"
        sx={{ color: "#4285f4", fontWeight: 600, mb: 4 }}
      >
        Lịch hẹn sắp tới
      </Typography>
      {upcomingAppointments.length > 0 ? (
        upcomingAppointments.map((appointment, index) => (
          <Box key={index} sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Grid container spacing={2} sx={{ flex: 1 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Ngày dự kiến hiến</Typography>
                <Typography variant="body1" fontWeight="bold">{appointment.preferredDonationDate ? dayjs(appointment.preferredDonationDate).format('DD/MM/YYYY') : ''}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Đợt hiến máu</Typography>
                <Typography variant="body1" fontWeight="bold">{appointment.periodName}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                {getStatusChip(appointment.status)}
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              sx={{ ml: 2, minWidth: 120 }}
              onClick={() => {
                setSelectedAppointment({ ...appointment, detail: appointment.detail || {} });
                setOpenDetailDialog(true);
              }}
            >
              Xem chi tiết
            </Button>
          </Box>
        ))
      ) : (
        <Typography variant="body1" color="text.secondary">
          Không có lịch hẹn nào.
        </Typography>
      )}

      {/* Dialog Chi tiết lịch hẹn */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ bgcolor: '#4285f4', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Chi tiết lịch hẹn hiến máu
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedAppointment && (
            <Box>
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Mã đăng ký</Typography>
                    <Typography variant="body1" fontWeight="bold">#{selectedAppointment.donationId}</Typography>
                    <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                    {getStatusChip(selectedAppointment.status)}
                    <Typography variant="body2" color="text.secondary">Ngày dự kiến hiến</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedAppointment.preferredDonationDate ? dayjs(selectedAppointment.preferredDonationDate).format('DD/MM/YYYY') : ''}</Typography>
                    <Typography variant="body2" color="text.secondary">Đợt hiến máu</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedAppointment.periodName}</Typography>
                    <Typography variant="body2" color="text.secondary">Nhóm máu hiến</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedAppointment.bloodTypeName || 'Chưa rõ'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Địa điểm</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedAppointment.location || 'Chưa có thông tin'}</Typography>
                    <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                    <Typography variant="body1">{selectedAppointment.notes || ''}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentHistory;
