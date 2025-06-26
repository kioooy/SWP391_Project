import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Container,
  TextField,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  Divider,
  Fab,
  Stack,
  Chip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CertificateIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import BadgeIcon from '@mui/icons-material/Badge';
import NoAlcoholIcon from '@mui/icons-material/SmokeFree';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import FitnessIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScienceIcon from '@mui/icons-material/Science';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useSelector } from 'react-redux';

const Home = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Lấy user từ redux
  const user = useSelector((state) => state.auth.user);
  // Lấy thông tin member nếu có
  const isDonor = user && (user.isDonor || (user.member && user.member.isDonor));
  const isRecipient = user && (user.isRecipient || (user.member && user.member.isRecipient));

  // Nếu là member truyền máu (isRecipient)
  if (isRecipient) {
    return (
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={6} sx={{ p: 6, maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
          <BloodtypeIcon sx={{ fontSize: 60, color: '#e53e3e', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" color="#e53e3e" gutterBottom>
            Xin chào người nhận máu!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tài khoản của bạn là tài khoản truyền máu. Vui lòng liên hệ với bệnh viện hoặc các điểm hiến máu để được hỗ trợ.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Nếu bạn cần hỗ trợ khẩn cấp, hãy sử dụng chức năng tìm kiếm người hiến máu hoặc liên hệ tổng đài hỗ trợ.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Nếu là member hiến máu (isDonor) hoặc chưa đăng nhập, giữ nguyên giao diện cũ
  const handleSearch = () => {
    if (!fromDate || !toDate) return;
    navigate(`/events?from=${dayjs(fromDate).format('YYYY-MM-DD')}&to=${dayjs(toDate).format('YYYY-MM-DD')}`);
  };

  const handleBookNow = () => {
    const isAuthenticated = localStorage.getItem('token') !== null || localStorage.getItem('isTestUser') === 'true';
    if (isAuthenticated) {
      navigate('/booking');
    } else {
      navigate('/login');
    }
  };

  // Dữ liệu quyền lợi người hiến máu
  const benefits = [
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: "Được tư vấn về sức khoẻ",
      items: [
        "Được giải thích về quy trình hiến máu và các tai biến có thể xảy ra trong và sau khi hiến máu.",
        "Được cung cấp thông tin về dấu hiệu, triệu chứng do nhiễm vi rút viêm gan, HIV và các bệnh lây qua đường truyền máu, tình dục khác.",
        "Được xét nghiệm sàng lọc một số vi rút lây qua đường truyền máu, tình dục (HIV, Giang mai, viêm gan,…) sau khi hiến máu.",
        "Được tư vấn hướng dẫn cách chăm sóc sức khỏe, tư vấn về kết quả bất thường sau hiến máu.",
        "Được bảo mật về kết quả khám lâm sàng, kết quả xét nghiệm."
      ]
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: "Được bồi dưỡng trực tiếp",
      items: [
        "Ăn nhẹ, nước uống tại chỗ: tương đương 30.000 đồng (1 chai trà xanh không độ, 01 hộp chocopie 66gram, 01 hộp bánh Goute 35,5gram).",
        "Hỗ trợ chi phí đi lại (bằng tiền mặt): 50.000 đồng.",
        "Nhận phần quà tặng giá trị tương đương:",
        "  • 100.000đ khi hiến máu 250ml",
        "  • 150.000đ khi hiến máu 350ml",
        "  • 180.000đ khi hiến máu 450ml"
      ]
    },
    {
      icon: <CertificateIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: "Được cấp Giấy chứng nhận hiến máu tình nguyện",
      items: [
        "1. Giấy chứng nhận được trao cho người hiến máu sau mỗi lần hiến máu tình nguyện.",
        "2. Có giá trị để được truyền máu miễn phí bằng số lượng máu đã hiến, khi bản thân người hiến có nhu cầu sử dụng máu tại tất cả các cơ sở y tế công lập trên toàn quốc.",
        "3. Người hiến máu cần xuất trình Giấy chứng nhận để làm cơ sở cho các cơ sở y tế thực hiện việc truyền máu miễn phí.",
        "4. Cơ sở y tế có trách nhiệm ký, đóng dấu, xác nhận số lượng máu đã truyền miễn phí cho người hiến máu vào giấy chứng nhận."
      ]
    }
  ];

  // Dữ liệu tiêu chuẩn tham gia hiến máu
  const donationStandards = [
    {
      icon: <BadgeIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      text: "Mang theo chứng minh nhân dân/hộ chiếu"
    },
    {
      icon: <NoAlcoholIcon sx={{ fontSize: 40, color: '#F44336' }} />,
      text: "Không nghiện ma túy, rượu bia và các chất kích thích"
    },
    {
      icon: <CoronavirusIcon sx={{ fontSize: 40, color: '#FF5722' }} />,
      text: "Không mắc hoặc không có các hành vi nguy cơ lây nhiễm HIV, không nhiễm viêm gan B, viêm gan C, và các virus lây qua đường truyền máu"
    },
    {
      icon: <FitnessIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      text: "Cân nặng: Nam ≥ 45 kg, Nữ ≥ 45 kg"
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40, color: '#E91E63' }} />,
      text: "Không mắc các bệnh mãn tính hoặc cấp tính về tim mạch, huyết áp, hô hấp, dạ dày…"
    },
    {
      icon: <BloodtypeIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      text: "Chỉ số huyết sắc tố (Hb) ≥120g/l (≥125g/l nếu hiến từ 350ml trở lên)"
    },
    {
      icon: <PersonIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      text: "Người khỏe mạnh trong độ tuổi từ đủ 18 đến 60 tuổi"
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 40, color: '#795548' }} />,
      text: "Thời gian tối thiểu giữa 2 lần hiến máu là 12 tuần đối với cả Nam và Nữ"
    },
    {
      icon: <ScienceIcon sx={{ fontSize: 40, color: '#607D8B' }} />,
      text: "Kết quả test nhanh âm tính với kháng nguyên bề mặt của siêu vi B"
    }
  ];

  // Dữ liệu FAQ
  const faqData = [
    {
      question: "Ai có thể tham gia hiến máu?",
      answer: [
        "Tất cả mọi người từ 18 - 60 tuổi, thực sự tình nguyện hiến máu của mình để cứu chữa người bệnh.",
        "Cân nặng ít nhất là 45kg đối với phụ nữ, nam giới. Lượng máu hiến mỗi lần không quá 9ml/kg cân nặng và không quá 500ml mỗi lần.",
        "Không bị nhiễm hoặc không có các hành vi lây nhiễm HIV và các bệnh lây nhiễm qua đường truyền máu khác.",
        "Thời gian giữa 2 lần hiến máu là 12 tuần đối với cả Nam và Nữ.",
        "Có giấy tờ tùy thân."
      ]
    },
    {
      question: "Ai là người không nên hiến máu?",
      answer: [
        "Người đã nhiễm hoặc đã thực hiện hành vi có nguy cơ nhiễm HIV, viêm gan B, viêm gan C, và các vius lây qua đường truyền máu.",
        "Người có các bệnh mãn tính: tim mạch, huyết áp, hô hấp, dạ dày…"
      ]
    },
    {
      question: "Máu của tôi sẽ được làm những xét nghiệm gì?",
      answer: [
        "Tất cả những đơn vị máu thu được sẽ được kiểm tra nhóm máu (hệ ABO, hệ Rh), HIV, virus viêm gan B, virus viêm gan C, giang mai, sốt rét.",
        "Bạn sẽ được thông báo kết quả, được giữ kín và được tư vấn (miễn phí) khi phát hiện ra các bệnh nhiễm trùng nói trên."
      ]
    }
  ];

  // Dữ liệu lời khuyên
  const adviceData = [
    {
      type: "should",
      title: "Nên:",
      color: "#00B8CC",
      icon: <CheckCircleIcon />,
      items: [
        "Ăn nhẹ và uống nhiều nước (300-500ml) trước khi hiến máu.",
        "Đè chặt miếng bông gòn cầm máu nơi kim chích 10 phút, giữ băng keo cá nhân trong 4-6 giờ.",
        "Nằm và ngồi nghỉ tại chỗ 10 phút sau khi hiến máu.",
        "Nằm nghỉ đầu thấp, kê chân cao nếu thấy chóng mặt, mệt, buồn nôn.",
        "Chườm lạnh (túi chườm chuyên dụng hoặc cho đá vào khăn) chườm vết chích nếu bị sưng, bầm tím."
      ]
    },
    {
      type: "shouldnot",
      title: "Không nên:",
      color: "#ED2E2E",
      icon: <CancelIcon />,
      items: [
        "Uống sữa, rượu bia trước khi hiến máu.",
        "Lái xe đi xa, khuân vác, làm việc nặng hoặc luyện tập thể thao gắng sức trong ngày lấy máu."
      ]
    },
    {
      type: "note",
      title: "Lưu ý:",
      color: "#FF8127",
      icon: <WarningIcon />,
      items: [
        "Nếu phát hiện chảy máu tại chỗ chích:",
        "  • Giơ tay cao.",
        "  • Lấy tay kia ấn nhẹ vào miếng bông hoặc băng dính.",
        "  • Liên hệ nhân viên y tế để được hỗ trợ khi cần thiết."
      ]
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Hero Section - Đặt lịch hiến máu */}
      <Box
        sx={{
          background: '#fff',
          color: '#333',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'none',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, color: '#e53e3e' }}>
              Đặt lịch hiến máu
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, opacity: 0.9, fontWeight: 300, color: '#e53e3e' }}>
              Cùng nhau cứu sống những sinh mệnh quý giá
            </Typography>
            {/* <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Chip label="Miễn phí" sx={{ fontWeight: 'bold', backgroundColor: '#F8FBFD', color: '#e53e3e', border: '1px solid #e53e3e' }} />
              <Chip label="An toàn" sx={{ fontWeight: 'bold', backgroundColor: '#F8FBFD', color: '#e53e3e', border: '1px solid #e53e3e' }} />
              <Chip label="Có bồi dưỡng" sx={{ fontWeight: 'bold', backgroundColor: '#F8FBFD', color: '#e53e3e', border: '1px solid #e53e3e' }} />
            </Stack> */}
          </Box>

          {/* Quick Booking */}
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              maxWidth: 600,
              mx: 'auto',
              background: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid #333'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <VolunteerActivismIcon sx={{ fontSize: 48, color: '#e53e3e', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color="#e53e3e" gutterBottom>
                Đặt lịch ngay hôm nay
              </Typography>
              <Typography variant="body2" color="#e53e3e">
                Chọn thời gian phù hợp với bạn để tham gia hiến máu tình nguyện
              </Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Từ ngày"
                      value={fromDate}
                      onChange={setFromDate}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Đến ngày"
                      value={toDate}
                      onChange={setToDate}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    disabled={!fromDate || !toDate}
                    startIcon={<CalendarTodayIcon />}
                    sx={{ py: 1.5, px: 4 }}
                  >
                    Tìm kiếm lịch trình
                  </Button>
                </Box>
              </Stack>
            </LocalizationProvider>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, backgroundColor: '#fff' }}>
        {/* Section quyền lợi người hiến máu */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#e53e3e' }}>
              Quyền lợi của người hiến máu
            </Typography>
            <Typography variant="h6" sx={{ color: '#e53e3e', maxWidth: 600, mx: 'auto' }}>
              Người hiến máu tình nguyện sẽ được những quyền lợi hấp dẫn sau
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                    },
                    borderRadius: 3,
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          mb: 2
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ textAlign: 'center' }}>
                        {benefit.title}
                      </Typography>
                    </Box>
                    <List dense>
                      {benefit.items.map((item, itemIndex) => (
                        <ListItem key={itemIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{ fontSize: '0.9rem', lineHeight: 1.6 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section tiêu chuẩn tham gia hiến máu */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#e53e3e' }}>
              Tiêu chuẩn tham gia hiến máu
            </Typography>
            <Typography variant="h6" sx={{ color: '#e53e3e', maxWidth: 600, mx: 'auto' }}>
              Các điều kiện cần thiết để đảm bảo an toàn cho người hiến và người nhận
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {donationStandards.map((standard, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      borderColor: '#e53e3e'
                    }
                  }}
                >
                  <Box sx={{ mr: 3, flexShrink: 0 }}>
                    {standard.icon}
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                    {standard.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Section lưu ý quan trọng */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#e53e3e' }}>
              Thông tin quan trọng
            </Typography>
            <Typography variant="h6" sx={{ color: '#e53e3e', maxWidth: 600, mx: 'auto' }}>
              Những điều bạn cần biết trước khi quyết định hiến máu
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqData.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&.Mui-expanded': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 3, py: 2 }}
                >
                  <Typography variant="h6" fontWeight="medium" color="#e53e3e">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                  <List>
                    {faq.answer.map((item, itemIndex) => (
                      <ListItem key={itemIndex} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${item}`}
                          primaryTypographyProps={{ lineHeight: 1.6 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Section lời khuyên */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#e53e3e' }}>
              Hướng dẫn hiến máu an toàn
            </Typography>
            <Typography variant="h6" sx={{ color: '#e53e3e', maxWidth: 600, mx: 'auto' }}>
              Lời khuyên từ chuyên gia về cách chuẩn bị và chăm sóc sau hiến máu
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {adviceData.map((advice, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    height: '100%',
                    borderLeft: `6px solid ${advice.color}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ bgcolor: advice.color, mr: 2, width: 56, height: 56 }}>
                      {advice.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: advice.color }}>
                      {advice.title}
                    </Typography>
                  </Box>
                  <List dense>
                    {advice.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ fontSize: '0.9rem', lineHeight: 1.6 }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Thông tin bác sĩ */}
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">
                      Bác sĩ Ngô Văn Tân
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Trưởng khoa Khoa Tiếp nhận hiến máu. Bệnh viện Truyền máu Huyết học
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;