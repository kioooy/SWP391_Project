import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
  Grid,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Favorite,
  Person,
  CalendarToday,
  LocationOn,
  LocalHospital,
  Opacity,
  Print,
  Download,
  Edit,
  Add,
} from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from "react-redux";
import axios from "axios";
import { selectUser } from "../features/auth/authSlice";
import dayjs from "dayjs";

const BloodDonationCertificate = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) {
        setLoading(false);
        setError("Vui lòng đăng nhập để xem chứng chỉ.");
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let url = "/api/Certificate"; // Default for Admin/Staff

        if (user.role.toLowerCase() === "member") {
          url = `/api/Certificate/member/${user.userId}`;
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedCertificates = response.data.map((cert, index) => ({
          id: cert.donationId || index + 1,
          cccd: cert.citizenNumber,
          name: cert.fullName,
          dateOfBirth: dayjs(cert.dateOfBirth).format("DD/MM/YYYY"),
          address: cert.address,
          donationCenter: cert.name, // API returns hospital name as 'name'
          bloodAmount: `${cert.donationVolume}ml`,
          donationDate: dayjs(cert.preferredDonationDate).format("DD/MM/YYYY"),
          bloodType: cert.bloodTypeName,
          certificateNumber: `CT-${dayjs(cert.preferredDonationDate).year()}-${String(cert.donationId || index + 1).padStart(5, "0")}`,
        }));

        setCertificates(formattedCertificates);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải chứng chỉ. Vui lòng thử lại."
        );
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const [openDialog, setOpenDialog] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bloodAmounts = ["250ml", "350ml", "450ml", "500ml"];

  const handleOpenDialog = (certificate) => {
    setViewingCertificate(certificate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setViewingCertificate(null);
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      "A+": "#e53e3e",
      "A-": "#c53030",
      "B+": "#3182ce",
      "B-": "#2c5282",
      "AB+": "#805ad5",
      "AB-": "#6b46c1",
      "O+": "#38a169",
      "O-": "#2f855a",
    };
    return colors[bloodType] || "#718096";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#ffffff",
        borderRadius: 4,
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "#e53e3e",
                color: "#ffffff",
                width: 56,
                height: 56,
              }}
            >
              <Favorite sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#1a202c",
                  fontWeight: "bold",
                }}
              >
                Chứng chỉ hiến máu
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#718096",
                  fontStyle: "italic",
                }}
              >
                Lưu giữ và tôn vinh những lần hiến máu của bạn
              </Typography>
            </Box>
          </Box>
          {/* <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.3)",
              },
            }}
          >
            Thêm chứng chỉ
          </Button> */}
        </Box>

        {/* Certificates Grid */}
        {loading && <Typography>Đang tải chứng chỉ...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && certificates.length === 0 && (
          <Typography>Bạn chưa có chứng chỉ hiến máu nào.</Typography>
        )}
        <Grid container spacing={3}>
          {certificates.map((certificate) => (
            <Grid item xs={12} md={6} lg={4} key={certificate.id}>
              <Card
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Certificate Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: getBloodTypeColor(certificate.bloodType),
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Opacity />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#1a202c" }}
                        >
                          {certificate.name}
                        </Typography>
                        <Chip
                          label={certificate.bloodType}
                          size="small"
                          sx={{
                            bgcolor: getBloodTypeColor(certificate.bloodType),
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(certificate)}
                      sx={{ color: "#667eea" }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Box>

                  <Divider sx={{ mb: 2, borderColor: "rgba(0,0,0,0.08)" }} />

                  {/* Certificate Details */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Person sx={{ color: "#718096", fontSize: 18 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#718096", display: "block" }}
                        >
                          Số CCCD
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#2d3748" }}
                        >
                          {certificate.cccd}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <CalendarToday sx={{ color: "#718096", fontSize: 18 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#718096", display: "block" }}
                        >
                          Ngày sinh
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#2d3748" }}
                        >
                          {certificate.dateOfBirth}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <LocationOn sx={{ color: "#718096", fontSize: 18, mt: 0.2 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#718096", display: "block" }}
                        >
                          Địa chỉ
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#2d3748" }}
                        >
                          118 Hồng Bàng, Phường 12, Quận 5, TP.HCM
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <LocalHospital
                        sx={{ color: "#718096", fontSize: 18, mt: 0.2 }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#718096", display: "block" }}
                        >
                          Cơ sở tiếp nhận máu
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#2d3748" }}
                        >
                          {certificate.donationCenter}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                        mt: 1,
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          bgcolor: "rgba(102, 126, 234, 0.1)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#667eea", fontWeight: 600 }}
                        >
                          Lượng máu
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: "#667eea", fontWeight: "bold" }}
                        >
                          {certificate.bloodAmount}
                        </Typography>
                      </Paper>
                      <Paper
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#ef4444", fontWeight: 600 }}
                        >
                          Ngày hiến
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#ef4444", fontWeight: "bold" }}
                        >
                          {certificate.donationDate}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>

                  {/* Certificate Footer */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      mt: 3,
                      pt: 2,
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    {/*
                    <Box>
                      <IconButton size="small" sx={{ color: "#667eea" }}>
                        <Print />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "#667eea" }}>
                        <Download />
                      </IconButton>
                    </Box>
                    */}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* View Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#1a202c",
            }}
          >
            Thông tin chi tiết chứng chỉ
          </DialogTitle>
          <DialogContent>
            {viewingCertificate && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Số CCCD
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.cccd}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Họ và Tên
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.name}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Ngày sinh
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.dateOfBirth}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Nhóm máu
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.bloodType}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Địa Chỉ
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    118 Hồng Bàng, Phường 12, Quận 5, TP.HCM
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Cơ sở tiếp nhận máu
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.donationCenter}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Lượng máu hiến
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.bloodAmount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#718096", fontWeight: 500 }}>
                    Ngày hiến máu
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#1a202c", fontWeight: 600 }}>
                    {viewingCertificate.donationDate}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            {/* <Button onClick={handleCloseDialog} sx={{ color: "#718096" }}>
              Hủy
            </Button> */}
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{
                bgcolor: "#667eea",
                "&:hover": {
                  bgcolor: "#5a67d8",
                },
              }}
            >
             Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default BloodDonationCertificate;
