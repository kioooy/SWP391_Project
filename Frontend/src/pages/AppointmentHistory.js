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
  const [appointments, setAppointments] = React.useState([]);

  // Load lịch hẹn từ localStorage khi component mount
  React.useEffect(() => {
    const loadAppointments = () => {
      try {
        console.log('Loading appointments from localStorage...');
        const storedAppointments = JSON.parse(localStorage.getItem('userAppointments') || '[]');
        
        // Ensure all loaded appointments have a 'detail' object
        const processedAppointments = storedAppointments.map(app => ({
          ...app,
          detail: app.detail || {} // Ensure detail is an object
        }));
        
        console.log('Processed appointments:', processedAppointments);
        setAppointments(processedAppointments);
      } catch (error) {
        console.error('Lỗi khi load lịch hẹn:', error);
        // Fallback to default data if localStorage fails
        const fallbackData = [
          {
            id: 1,
            title: "466 Nguyễn Thị minh Khai (thời gian làm việc từ 7g đến 11g)",
            location: "466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh",
            time: "07:00 đến 11:00 - 22/06/2025",
            status: "expired",
            statusText: "Đã xoá",
            detail: {
              appointmentId: "AP-2025-001",
              patientName: "Nguyễn Văn Minh",
              patientId: "079201234567",
              phone: "0901234567",
              email: "nguyenvanminh@gmail.com",
              bloodType: "O+",
              donationCenter: "Trung tâm Huyết học - Truyền máu TP.HCM",
              centerAddress: "466 Nguyễn Thị Minh Khai, Phường 02, Quận 3, TP.HCM",
              centerPhone: "028 3930 1234",
              appointmentDate: "22/06/2025",
              appointmentTime: "07:00 - 11:00",
              donationType: "Hiến máu tình nguyện",
              bloodAmount: "350ml",
              notes: "Bệnh nhân cần nhịn ăn 4 giờ trước khi hiến máu",
              cancellationReason: "Bệnh nhân hủy lịch do lý do cá nhân",
              cancellationDate: "20/06/2025",
              cancellationTime: "14:30",
              staffName: "Trần Thị Lan",
              staffPhone: "0909876543"
            }
          },
          {
            id: 2,
            title: "466 Nguyễn Thị minh Khai (thời gian làm việc từ 7g đến 11g)",
            location: "466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh",
            time: "07:00 đến 11:00 - 16/06/2025",
            status: "scheduled",
            statusText: "Đã hẹn lịch",
            detail: {
              appointmentId: "AP-2025-002",
              patientName: "Nguyễn Văn Minh",
              patientId: "079201234567",
              phone: "0901234567",
              email: "nguyenvanminh@gmail.com",
              bloodType: "O+",
              donationCenter: "Trung tâm Huyết học - Truyền máu TP.HCM",
              centerAddress: "466 Nguyễn Thị Minh Khai, Phường 02, Quận 3, TP.HCM",
              centerPhone: "028 3930 1234",
              appointmentDate: "16/06/2025",
              appointmentTime: "07:00 - 11:00",
              donationType: "Hiến máu tình nguyện",
              bloodAmount: "350ml",
              notes: "Bệnh nhân cần nhịn ăn 4 giờ trước khi hiến máu",
              preparationNotes: [
                "Ăn nhẹ trước khi hiến máu",
                "Uống nhiều nước",
                "Mang theo CMND/CCCD",
                "Không uống rượu bia 24h trước"
              ],
              staffName: "Trần Thị Lan",
              staffPhone: "0909876543"
            }
          },
        ].map(app => ({ // Ensure fallback data also has detail
          ...app,
          detail: app.detail || {} 
        }));
        console.log('Using fallback data:', fallbackData);
        setAppointments(fallbackData);
      }
    };
    loadAppointments();
  }, []);

  const handleTitleClick = (appointmentId) => {
    console.log(`Clicked appointment ${appointmentId}`);
  };

  const handleDetailClick = (appointmentId) => {
    const appointment = appointments.find(app => app.id === appointmentId);
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

  return (
    <Container maxWidth="lg">
      {console.log('AppointmentHistory rendering, appointments:', appointments)}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          color: "#4285f4",
          fontWeight: 600,
          mb: 4,
        }}
      >
        Lịch sử đặt hẹn
      </Typography>

      {/* Debug info */}
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Debug: Có {appointments.length} lịch hẹn được tải
        </Typography>
      </Box>

      <Box>
        {appointments.map((appointment) => (
          <StyledCard key={appointment.id}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Blood Drop Avatar */}
                <Box sx={{ position: "relative", mr: 2 }}>
                  <BloodDropAvatar>
                    <BloodDropIcon />
                  </BloodDropAvatar>
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: -15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "white",
                      color: "#6c757d",
                      fontWeight: 500,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      whiteSpace: "nowrap",
                      fontSize: "12px",
                    }}
                  >
                    Hiến máu
                  </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, mr: 2 }}>
                  <AppointmentTitle
                    onClick={() => handleTitleClick(appointment.id)}
                  >
                    {appointment.title}
                  </AppointmentTitle>

                  <InfoText>
                    <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                    {appointment.location}
                  </InfoText>

                  <InfoText>
                    <AccessTime sx={{ fontSize: 16, mr: 1 }} />
                    {appointment.time}
                  </InfoText>
                </Box>

                {/* Actions */}
                <Stack alignItems="flex-end" spacing={1}>
                  <StatusChip
                    label={appointment.statusText}
                    status={appointment.status}
                  />
                  <DetailButton
                    endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                    onClick={() => handleDetailClick(appointment.id)}
                  >
                    Xem chi tiết
                  </DetailButton>
                </Stack>
              </Box>
            </CardContent>
          </StyledCard>
        ))}
      </Box>

      {/* Dialog Chi tiết lịch hẹn */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#4285f4', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight="bold">
            Chi tiết lịch hẹn hiến máu
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedAppointment && (() => {
            const detail = selectedAppointment.detail || {}; // Đảm bảo detail luôn là một object ở đây
            return (
              <Box>
                {/* Header với thông tin cơ bản */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Bloodtype sx={{ color: '#ff4757', mr: 1, fontSize: 24 }} />
                        <Typography variant="h6" fontWeight="bold" color="#4285f4">
                          {detail.appointmentId}
                        </Typography>
                      </Box>
                      <Chip
                        label={selectedAppointment.statusText}
                        status={selectedAppointment.status}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        <strong>Loại hiến máu:</strong> {detail.donationType}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>Lượng máu:</strong> {detail.bloodAmount}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ mr: 1, color: '#4285f4' }} />
                        <Typography variant="body1" fontWeight="bold">
                          {detail.appointmentDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ mr: 1, color: '#4285f4' }} />
                        <Typography variant="body1" fontWeight="bold">
                          {detail.appointmentTime}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, color: '#4285f4' }} />
                        <Typography variant="body1" fontWeight="bold">
                          {detail.donationCenter}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Grid container spacing={3}>
                  {/* Thông tin người hiến máu */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" fontWeight="bold" color="#4285f4" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        Thông tin người hiến máu
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Họ và tên</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.patientName}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Số CCCD</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.patientId}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.phone}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.email}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Nhóm máu</Typography>
                        <Chip 
                          label={detail.bloodType} 
                          sx={{ bgcolor: '#ff4757', color: 'white', fontWeight: 'bold' }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Thông tin trung tâm */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" fontWeight="bold" color="#4285f4" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <LocalHospital sx={{ mr: 1 }} />
                        Thông tin trung tâm
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Tên trung tâm</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.donationCenter}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                        <Typography variant="body1">{detail.centerAddress}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.centerPhone}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Nhân viên phụ trách</Typography>
                        <Typography variant="body1" fontWeight="bold">{detail.staffName}</Typography>
                        <Typography variant="body2" color="text.secondary">{detail.staffPhone}</Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Thông tin bổ sung */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" color="#4285f4" sx={{ mb: 2 }}>
                        Thông tin bổ sung
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Ghi chú</Typography>
                        <Typography variant="body1">{detail.notes}</Typography>
                      </Box>

                      {selectedAppointment.status === "scheduled" && detail.preparationNotes && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Hướng dẫn chuẩn bị:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2 }}>
                            {detail.preparationNotes.map((note, index) => (
                              <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                                {note}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {selectedAppointment.status === "expired" && detail.cancellationReason && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Lý do hủy lịch:
                          </Typography>
                          <Typography variant="body1" color="#ff4757" fontWeight="bold">
                            {detail.cancellationReason}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Thời gian hủy: {detail.cancellationDate} lúc {detail.cancellationTime}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            color="primary"
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentHistory;
