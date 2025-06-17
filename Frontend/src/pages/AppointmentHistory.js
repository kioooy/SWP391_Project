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
} from "@mui/material";
import { LocationOn, AccessTime, OpenInNew } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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
  const appointments = [
    {
      id: 1,
      title: "466 Nguyễn Thị minh Khai (thời gian làm việc từ 7g đến 11g)",
      location: "466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh",
      time: "07:00 đến 11:00 - 22/06/2025",
      status: "expired",
      statusText: "Đã xoá",
    },
    {
      id: 2,
      title: "466 Nguyễn Thị minh Khai (thời gian làm việc từ 7g đến 11g)",
      location: "466 Nguyễn Thị Minh Khai Phường 02, Quận 3, Tp Hồ Chí Minh",
      time: "07:00 đến 11:00 - 16/06/2025",
      status: "scheduled",
      statusText: "Đã hẹn lịch",
    },
  ];

  const handleTitleClick = (appointmentId) => {
    console.log(`Clicked appointment ${appointmentId}`);
  };

  const handleDetailClick = (appointmentId) => {
    console.log(`View details for appointment ${appointmentId}`);
  };

  return (
    <Container maxWidth="lg">
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
    </Container>
  );
};

export default AppointmentHistory;
