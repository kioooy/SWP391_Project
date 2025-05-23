import React from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const newsList = [
  {
    id: 1,
    title: 'Ngày hội hiến máu toàn quốc 2024',
    date: '10/06/2024',
    description: 'Sự kiện hiến máu lớn nhất năm 2024 đã thu hút hàng ngàn người tham gia trên toàn quốc, góp phần cứu sống nhiều bệnh nhân.'
  },
  {
    id: 2,
    title: 'Câu chuyện người hiến máu tiêu biểu',
    date: '05/06/2024',
    description: 'Chia sẻ về hành trình hiến máu của anh Nguyễn Văn A, người đã hiến máu 30 lần liên tiếp.'
  },
  {
    id: 3,
    title: 'Lợi ích sức khỏe khi hiến máu định kỳ',
    date: '01/06/2024',
    description: 'Hiến máu không chỉ giúp cứu người mà còn mang lại nhiều lợi ích sức khỏe cho bản thân người hiến.'
  }
];

const News = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Typography variant="h3" align="center" fontWeight={700} gutterBottom color="primary">
      Tin Tức
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {newsList.map((news, idx) => (
          <Grid item xs={12} md={4} key={news.id}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  component={RouterLink}
                  to={`/news/${news.id}`}
                  sx={{ textDecoration: 'none', color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {news.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">{news.date}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{news.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" component={RouterLink} to={`/news/${news.id}`}>Xem chi tiết</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Container>
);

export default News; 