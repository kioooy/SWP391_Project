import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const newsList = [
  {
    id: 1,
    title: 'Ngày hội hiến máu toàn quốc 2024',
    date: '10/06/2024',
    description: 'Sự kiện hiến máu lớn nhất năm 2024 đã thu hút hàng ngàn người tham gia trên toàn quốc, góp phần cứu sống nhiều bệnh nhân.',
    content: `Ngày hội hiến máu toàn quốc 2024 đã diễn ra thành công tốt đẹp với sự tham gia của hơn 10,000 người trên toàn quốc. 
    Sự kiện này đã thu được hơn 5,000 đơn vị máu, đáp ứng nhu cầu cấp thiết của các bệnh viện trong cả nước.
    
    Đặc biệt, sự kiện năm nay còn có sự tham gia của nhiều nghệ sĩ nổi tiếng, góp phần lan tỏa thông điệp về tầm quan trọng của việc hiến máu.
    
    Ban tổ chức cho biết sẽ tiếp tục tổ chức các sự kiện tương tự trong thời gian tới để đảm bảo nguồn máu dự trữ cho các trường hợp khẩn cấp.`
  },
  {
    id: 2,
    title: 'Câu chuyện người hiến máu tiêu biểu',
    date: '05/06/2024',
    description: 'Chia sẻ về hành trình hiến máu của anh Nguyễn Văn A, người đã hiến máu 30 lần liên tiếp.',
    content: `Anh Nguyễn Văn A, 45 tuổi, đã có 15 năm kinh nghiệm hiến máu với tổng số 30 lần hiến. 
    Anh bắt đầu hiến máu từ năm 2009 sau khi chứng kiến một người thân được cứu sống nhờ máu hiến tặng.
    
    "Mỗi lần hiến máu là một lần tôi cảm thấy mình đã làm được điều gì đó có ý nghĩa cho cộng đồng", anh A chia sẻ.
    
    Anh cũng là người tích cực vận động bạn bè, người thân tham gia hiến máu và đã thành lập một nhóm tình nguyện viên với hơn 100 thành viên.`
  },
  {
    id: 3,
    title: 'Lợi ích sức khỏe khi hiến máu định kỳ',
    date: '01/06/2024',
    description: 'Hiến máu không chỉ giúp cứu người mà còn mang lại nhiều lợi ích sức khỏe cho bản thân người hiến.',
    content: `Theo các nghiên cứu y khoa, hiến máu định kỳ mang lại nhiều lợi ích sức khỏe:
    
    1. Giảm nguy cơ mắc bệnh tim mạch
    2. Giúp cơ thể tạo máu mới, tăng cường sức khỏe
    3. Được kiểm tra sức khỏe miễn phí
    4. Giảm nguy cơ mắc bệnh ung thư
    
    Các chuyên gia khuyến cáo người khỏe mạnh nên hiến máu 3-4 lần mỗi năm để duy trì sức khỏe tốt và góp phần cứu người.`
  }
];

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const news = newsList.find(item => item.id === parseInt(id));

  if (!news) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5" align="center">Không tìm thấy tin tức</Typography>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/news')}
          >
            Quay lại trang tin tức
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/news')}
        sx={{ mb: 4 }}
      >
        Quay lại
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {news.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {news.date}
        </Typography>
        <Typography variant="body1" sx={{ mt: 4, whiteSpace: 'pre-line' }}>
          {news.content}
        </Typography>
      </Paper>
    </Container>
  );
};

export default NewsDetail; 