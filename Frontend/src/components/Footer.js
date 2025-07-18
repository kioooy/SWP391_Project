import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
/* import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube'; */
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import { Link as RouterLink } from 'react-router-dom';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  marginTop: 'auto',
  width: '100%',
  padding: 0,
}));

const FooterSection = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(2),
}));

const FooterBottom = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  padding: theme.spacing(2, 0),
}));

/* const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  margin: theme.spacing(0, 0.5),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
})); */

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  textDecoration: 'none',
  display: 'block',
  padding: theme.spacing(0.5, 0),
  transition: 'color 0.3s ease',
  '&:hover': {
    color: 'white',
    textDecoration: 'none',
  },
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main,
  },
}));

const Footer = () => {
  const theme = useTheme();

  const footerLinks = [
    { label: 'Trang Chủ', path: '/' },
    { label: 'Lịch Sử Đặt Hẹn', path: '/appointment-history' },
    { label: 'Lịch sử truyền máu', path: '/transfusion-history' },
    { label: 'Hồ sơ truyền máu', path: '/user-profile-recipient' },
    { label: 'Hỏi & Đáp', path: '/faq' },
    { label: 'Tin Tức', path: '/news' },
    { label: 'Liên Hệ', path: '/contact' },
  ];

  const quickLinks = [
    { label: 'Đăng Ký Hiến Máu', path: '/register' },
    { label: 'Tra Cứu Kết Quả', path: '/results' },
    { label: 'Hướng Dẫn Hiến Máu', path: '/guide' },
    { label: 'Câu Hỏi Thường Gặp', path: '/faq' },
    { label: 'Chính Sách Bảo Mật', path: '/privacy' },
  ];

  return (
    <FooterContainer>
      <FooterSection sx={{ px: { xs: 2, md: 10 } }}>
        <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BloodtypeIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.secondary.main }} />
                  <Typography variant="h5" fontWeight="bold">
                    Hệ Thống Hiến Máu
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7 }}>
                  Chúng tôi cam kết mang đến dịch vụ hiến máu an toàn, chuyên nghiệp và nhân văn.
                  Mỗi giọt máu bạn hiến tặng sẽ góp phần cứu sống những sinh mệnh quý giá.
                </Typography>
              </Box>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Thông tin liên hệ
              </Typography>

              <ContactItem>
                <LocationOnIcon />
                <Typography variant="body2">
                118 Hồng Bàng, Phường 12, Quận 5, TP.HCM
                </Typography>
              </ContactItem>

              <ContactItem>
                <PhoneIcon />
                <Typography variant="body2">
                  Hotline: 02839575334
                </Typography>
              </ContactItem>

              <ContactItem>
                <EmailIcon />
                <Typography variant="body2">
                  Email: bv.tmhh@tphcm.gov.vn
                </Typography>
              </ContactItem>

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  🩸 Cấp cứu 24/7
                </Typography>
                <Typography variant="body2">
                  Hotline cấp cứu: <strong>115</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </FooterSection>
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        <FooterBottom>
          <Box>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', fontWeight: 'bold' }}>
                  © 2025 Hệ Thống Hiến Máu Việt Nam. Tất cả quyền được bảo lưu.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </FooterBottom>
    </FooterContainer>
  );
};

export default Footer; 