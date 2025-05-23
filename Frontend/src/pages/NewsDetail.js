import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';

const newsList = [
  {
    id: 1,
    title: 'Ngày hội hiến máu toàn quốc 2024',
    date: '10/06/2024',
    content: `Ngày hội hiến máu toàn quốc 2024 đã diễn ra thành công với sự tham gia của hàng ngàn người trên khắp cả nước. Sự kiện không chỉ góp phần cứu sống nhiều bệnh nhân mà còn lan tỏa tinh thần nhân ái, sẻ chia trong cộng đồng. Các hoạt động bên lề như tư vấn sức khỏe, giao lưu văn nghệ cũng thu hút đông đảo người tham dự.`
  },
  {
    id: 2,
    title: 'Câu chuyện người hiến máu tiêu biểu',
    date: '05/06/2024',
    content: `Anh Nguyễn Văn A là tấm gương sáng trong phong trào hiến máu tình nguyện với 30 lần hiến máu liên tiếp. Anh chia sẻ: "Mỗi lần hiến máu là một lần tôi cảm thấy hạnh phúc vì biết rằng giọt máu của mình có thể cứu sống ai đó." Câu chuyện của anh đã truyền cảm hứng cho nhiều người cùng tham gia hiến máu.`
  },
  {
    id: 3,
    title: 'Lợi ích sức khỏe khi hiến máu định kỳ',
    date: '01/06/2024',
    content: `Hiến máu định kỳ không chỉ giúp cứu người mà còn mang lại nhiều lợi ích sức khỏe cho bản thân như giảm nguy cơ mắc các bệnh tim mạch, kích thích quá trình tạo máu mới, kiểm tra sức khỏe định kỳ miễn phí.`
  }
];

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const news = newsList.find(n => n.id === Number(id));

  if (!news) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" color="error" align="center">Bài báo không tồn tại.</Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/news')}>Quay lại Tin Tức</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button variant="outlined" color="primary" onClick={() => navigate('/news')} sx={{ mb: 3 }}>
        Quay lại Tin Tức
      </Button>
      <Typography variant="h3" fontWeight={700} gutterBottom color="primary">
        {news.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {news.date}
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{news.content}</Typography>
      </Box>
    </Container>
  );
};

export default NewsDetail; 