import React from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMemo } from "react";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 1000,
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  borderRadius: "12px",
}));

const BloodDonationIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px 20px",
  borderRadius: "12px",
  marginBottom: "20px",
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: "120px",
  height: "120px",
  backgroundColor: "#4285f4",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "20px",
  position: "relative",
}));

const InfoRow = styled(Box)(({ theme, isEven }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 10px",
  backgroundColor: isEven ? "#f8f9fa" : "white",
  borderBottom: "1px solid #e9ecef",
  "&:last-child": {
    borderBottom: "none",
  },
  "&:first-of-type": {
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  },
  "&:last-of-type": {
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
  },
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  marginBottom: "24px",
  backgroundColor: "white",
  overflow: "hidden",
  borderRadius: "12px",
  border: "1px solid #e9ecef",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: "#1976d2",
  fontWeight: "600",
  fontSize: "18px",
  padding: "20px 10px 5px 10px",
  marginBottom: 0,
  //   borderBottom: "1px solid #e9ecef",
}));

const DocumentIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="white"
    style={{
      position: "absolute",
      bottom: -8,
      right: -8,
      backgroundColor: "#4caf50",
      borderRadius: "50%",
      padding: "4px",
    }}
  >
    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
  </svg>
);

const getUserProfile = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("userProfile"));
    if (!profile) return {};
    return {
      fullName: `${profile.lastName} ${profile.firstName}`,
      cmnd: profile.citizenId || "",
      cccd: "", // nếu cần
      passport: "", // nếu cần
      birthDate: profile.dateOfBirth || "",
      gender: profile.gender || "",
      occupation: profile.occupation || "",
      unit: "", // nếu cần
      bloodGroup: profile.bloodType || "",
      address: profile.address || "",
      mobilePhone: profile.phoneNumber || "",
      homePhone: profile.landlinePhone || "",
      email: profile.email || "",
    };
  } catch (err) {
    return {};
  }
};

const BloodDonationForm = () => {
  const userProfile = useMemo(() => getUserProfile(), []);

  const personalInfoData = [
    { label: "Họ và tên:", value: userProfile.fullName },
    { label: "Số CMND:", value: userProfile.cmnd },
    { label: "Số CCCD:", value: userProfile.cccd },
    { label: "Số hộ chiếu:", value: userProfile.passport },
    { label: "Ngày sinh:", value: userProfile.birthDate },
    { label: "Giới tính:", value: userProfile.gender },
    { label: "Nghề nghiệp:", value: userProfile.occupation },
    { label: "Đơn vị:", value: userProfile.unit },
    { label: "Nhóm máu:", value: userProfile.bloodGroup },
  ];

  const contactInfoData = [
    { label: "Địa chỉ liên hệ:", value: userProfile.address },
    { label: "Điện thoại di động:", value: userProfile.mobilePhone },
    { label: "Điện thoại bàn:", value: userProfile.homePhone },
    { label: "Email:", value: userProfile.email },
  ];

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <StyledCard>
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "600",
              mb: 2,
            }}
          >
            Thông tin đăng ký hiến máu
          </Typography>

          <Grid container spacing={2}>
            {/* Left Column - Form */}
            <Grid item xs={12} md={5}>
              {/* Personal Information Section */}
              <SectionCard elevation={0}>
                <SectionTitle>Thông tin cá nhân</SectionTitle>
                <Box>
                  {personalInfoData.map((item, index) => (
                    <InfoRow key={index} isEven={index % 2 === 1}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "#495057" }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#212529",
                          fontWeight:
                            item.value !== "" && item.value !== "-" ? 600 : 400,
                          maxWidth: "200px",
                          textAlign: "right",
                        }}
                      >
                        {item.value !== "" ? item.value : "-"}
                      </Typography>
                    </InfoRow>
                  ))}
                </Box>
              </SectionCard>

              {/* Contact Information Section */}
              <SectionCard elevation={0}>
                <SectionTitle>Thông tin liên hệ</SectionTitle>
                <Box>
                  {contactInfoData.map((item, index) => (
                    <InfoRow key={index} isEven={index % 2 === 1}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "#495057" }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#212529",
                          fontWeight:
                            item.value !== "" && item.value !== "-" ? 600 : 400,
                          maxWidth: "250px",
                          textAlign: "right",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value !== "" ? item.value : "-"}
                      </Typography>
                    </InfoRow>
                  ))}
                </Box>
              </SectionCard>
            </Grid>

            {/* Right Column - Registration Form Status */}
            <Grid item xs={12} md={7}>
              <SectionCard elevation={0}>
                <SectionTitle>Phiếu đăng ký hiến máu</SectionTitle>
                <BloodDonationIcon>
                  <IconContainer>
                    <DocumentIcon />
                    <CheckIcon />
                  </IconContainer>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#6c757d",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    Chưa có phiếu đăng ký hiến máu
                  </Typography>
                </BloodDonationIcon>
              </SectionCard>
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1,
                backgroundColor: "#4285f4",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#3367d6",
                },
              }}
            >
              Đăng ký hiến máu
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default BloodDonationForm;
