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
  Badge,
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
  Close,
  BadgeOutlined
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import axios from 'axios';

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
  const [hospitalLocation, setHospitalLocation] = React.useState({ name: '', address: '' });
  const [openCancelDialog, setOpenCancelDialog] = React.useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = React.useState(null);
  const [userDetail, setUserDetail] = React.useState(null);

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

  const handleDetailClick = async (appointmentId) => {
    const appointment = upcomingAppointments.find(app => app.donationId === appointmentId);
    if (appointment) {
      setSelectedAppointment({
        ...appointment,
        detail: appointment.detail || {}
      });
      // Lấy thông tin user đăng ký từ API /User/profile (giống UserProfile)
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        const res = await axios.get(`${apiUrl}/User/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = Array.isArray(res.data) ? res.data[0] : res.data;
        setUserDetail(userData);
      } catch (err) {
        setUserDetail(null);
      }
      // Gọi API lấy địa điểm bệnh viện như cũ
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        const res = await fetch(`${apiUrl}/Hospital/location?periodId=${appointment.periodId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHospitalLocation({
            name: data?.name || '',
            address: data?.address || data?.location || 'Chưa có thông tin'
          });
        } else {
          setHospitalLocation({ name: '', address: 'Chưa có thông tin' });
        }
      } catch {
        setHospitalLocation({ name: '', address: 'Chưa có thông tin' });
      }
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
      case 'Completed':
        return (
          <Chip
            label="Hoàn thành"
            size="small"
            sx={{ backgroundColor: '#4caf50', color: 'white', fontWeight: 600 }}
          />
        );
      case 'scheduled':
      case 'Approved':
        return (
          <Chip
            label="Đã lên lịch"
            color="success"
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

  // Hàm hủy lịch hẹn
  const handleOpenCancelDialog = (appointment) => {
    setAppointmentToCancel(appointment);
    setOpenCancelDialog(true);
  };
  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      await axios.patch(`${apiUrl}/DonationRequest/${appointmentToCancel.donationId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenCancelDialog(false);
      setAppointmentToCancel(null);
      // Reload lại danh sách lịch hẹn
      const res = await axios.get(`${apiUrl}/DonationRequest/upcoming/all-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingAppointments(res.data || []);
    } catch (error) {
      setOpenCancelDialog(false);
      setAppointmentToCancel(null);
      alert('Lỗi khi hủy lịch hẹn!');
    }
  };
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setAppointmentToCancel(null);
  };

  return (
    <Container maxWidth="lg">
      {upcomingAppointments.length > 0 ? (
        upcomingAppointments.map((appointment, index) => (
          <Box key={index} sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Grid container spacing={2} sx={{ flex: 1 }}>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" color="text.secondary">Ngày đặt lịch</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {appointment.requestDate
                    ? dayjs(appointment.requestDate).format('DD/MM/YYYY')
                    : appointment.RequestDate
                      ? dayjs(appointment.RequestDate).format('DD/MM/YYYY')
                      : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary" noWrap>Ngày dự kiến hiến máu</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {appointment.preferredDonationDate ? dayjs(appointment.preferredDonationDate).format('DD/MM/YYYY') : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">Đợt hiến máu</Typography>
                <Typography variant="body1" fontWeight="bold">{appointment.periodName}</Typography>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, ml: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Trạng thái</Typography>
                {getStatusChip(appointment.status)}
              </Box>
              <Button
                variant="outlined"
                sx={{ minWidth: 120 }}
                onClick={() => {
                  handleDetailClick(appointment.donationId);
                }}
              >
                Xem chi tiết
              </Button>
              {(appointment.status === 'scheduled' || appointment.status === 'Approved') && (
                <Button
                  variant="contained"
                  color="error"
                  sx={{ minWidth: 120 }}
                  onClick={() => handleOpenCancelDialog(appointment)}
                >
                  Hủy lịch hẹn
                </Button>
              )}
            </Box>
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
                  {/* Thông tin người dùng bên trái */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                      Thông tin người dùng
                    </Typography>
                    {(() => {
                      let user = null;
                      try {
                        user = JSON.parse(localStorage.getItem('user'));
                      } catch {}
                      const fullName = userDetail?.fullName || user?.fullName || user?.member?.fullName || 'Chưa cập nhật';
                      const citizenNumber = userDetail?.citizenNumber || user?.citizenNumber || user?.member?.citizenNumber || 'Chưa cập nhật';
                      const bloodType = userDetail?.bloodTypeName || user?.bloodTypeName || user?.bloodType || user?.member?.bloodTypeName || 'Chưa cập nhật';
                      const phoneNumber = userDetail?.phoneNumber || user?.phone || user?.phoneNumber || user?.member?.phoneNumber || 'Chưa cập nhật';
                      const dateOfBirth = userDetail?.dateOfBirth || user?.dateOfBirth || user?.member?.dateOfBirth || null;
                      return (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 2 }}>
                              {(fullName || 'U').charAt(0)}
                            </Avatar>
                            <Typography variant="body1" fontWeight="bold">{fullName}</Typography>
                          </Box>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Số CCCD</Typography>
                            <Typography variant="body1" fontWeight="bold">{citizenNumber}</Typography>
                          </Box>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Nhóm máu</Typography>
                            <Typography variant="body1" fontWeight="bold">{bloodType}</Typography>
                          </Box>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                            <Typography variant="body1" fontWeight="bold">{phoneNumber}</Typography>
                          </Box>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Ngày sinh</Typography>
                            <Typography variant="body1" fontWeight="bold">{dateOfBirth ? dayjs(dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Typography>
                          </Box>
                        </>
                      );
                    })()}
                  </Grid>
                  {/* Thông tin hiến máu bên phải */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                      Thông tin hiến máu
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Mã đăng ký</Typography>
                      <Typography variant="body1" fontWeight="bold">#{selectedAppointment.donationId}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                      {getStatusChip(selectedAppointment.status)}
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Ngày dự kiến hiến</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedAppointment.preferredDonationDate ? dayjs(selectedAppointment.preferredDonationDate).format('DD/MM/YYYY') : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Đợt hiến máu</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedAppointment.periodName}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Thời gian</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedAppointment.periodDateFrom && selectedAppointment.periodDateTo
                          ? `${dayjs(selectedAppointment.periodDateFrom).format('HH:mm')} - ${dayjs(selectedAppointment.periodDateTo).format('HH:mm')}`
                          : 'Không xác định'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Lượng máu hiến</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedAppointment.donationVolume ? `${selectedAppointment.donationVolume} ml` : 'Không xác định'}
                      </Typography>
                    </Box>
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
      {/* Dialog xác nhận hủy lịch hẹn */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          Xác nhận hủy lịch hẹn
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn hủy lịch hẹn này không?
          </Typography>
          {appointmentToCancel && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                Thông tin lịch hẹn:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Ngày hẹn:</strong> {appointmentToCancel.periodDateFrom ? dayjs(appointmentToCancel.periodDateFrom).format('DD/MM/YYYY') : 'Không xác định'}
              </Typography>
              {/* <Typography variant="body2"> */}
                {/* <strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học */}
              {/* </Typography> */}
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontStyle: 'italic' }}>
            ⚠️ Hành động này không thể hoàn tác. Lịch hẹn sẽ bị hủy vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} variant="outlined">
            Không hủy
          </Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error">
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentHistory;
