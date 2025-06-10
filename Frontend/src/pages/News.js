import React from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const bloodTypes = [
  {
    id: 1,
    name: 'Nhóm máu O',
    description: 'Nhóm máu O là nhóm máu phổ biến nhất. Người có nhóm máu O có thể hiến máu cho tất cả các nhóm máu khác (O, A, B, AB), nên còn gọi là "người cho máu phổ quát". Tuy nhiên, họ chỉ có thể nhận máu từ người cùng nhóm O.',
    details: 'Nhóm máu O không có kháng nguyên A hoặc B trên bề mặt hồng cầu, nhưng có cả kháng thể kháng A và kháng B trong huyết tương. Điều này giúp máu O phù hợp với nhiều người nhận khác.'
  },
  {
    id: 2,
    name: 'Nhóm máu A',
    description: 'Người có nhóm máu A có thể nhận máu từ nhóm A và O, và có thể hiến máu cho người nhóm A và AB.',
    details: 'Nhóm máu A có kháng nguyên A trên bề mặt hồng cầu và kháng thể kháng B trong huyết tương.'
  },
  {
    id: 3,
    name: 'Nhóm máu B',
    description: 'Người có nhóm máu B có thể nhận máu từ nhóm B và O, và có thể hiến máu cho người nhóm B và AB.',
    details: 'Nhóm máu B có kháng nguyên B trên bề mặt hồng cầu và kháng thể kháng A trong huyết tương.'
  },
  {
    id: 4,
    name: 'Nhóm máu AB',
    description: 'Người có nhóm máu AB có thể nhận máu từ tất cả các nhóm máu khác (A, B, AB, O), nên còn gọi là "người nhận máu phổ quát". Tuy nhiên, họ chỉ có thể hiến máu cho người cùng nhóm AB.',
    details: 'Nhóm máu AB có cả kháng nguyên A và B trên bề mặt hồng cầu, nhưng không có kháng thể kháng A hoặc B trong huyết tương.'
  },
  {
    id: 5,
    name: 'Yếu tố Rh (Rh+ và Rh-)',
    description: 'Ngoài các nhóm máu chính (A, B, AB, O), máu còn được phân loại theo yếu tố Rh. Nếu có Rh, gọi là Rh dương (Rh+); nếu không có, gọi là Rh âm (Rh-).',
    details: 'Người Rh- chỉ nên nhận máu Rh- để tránh phản ứng miễn dịch. Người Rh+ có thể nhận cả hai loại Rh+ và Rh-.'
  },
  {
    id: 6,
    name: 'Tại sao biết nhóm máu lại quan trọng?',
    description: 'Biết nhóm máu giúp đảm bảo an toàn khi truyền máu, cấp cứu, phẫu thuật hoặc khi hiến máu. Truyền nhầm nhóm máu có thể gây nguy hiểm đến tính mạng.',
    details: 'Khi cần truyền máu, bác sĩ sẽ kiểm tra nhóm máu để chọn loại máu phù hợp, tránh các phản ứng miễn dịch nguy hiểm.'
  }
];

const News = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Typography variant="h3" align="center" fontWeight={700} gutterBottom color="primary">
      Tài liệu về các loại máu
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {bloodTypes.map((type) => (
          <Grid item xs={12} md={4} key={type.id}>
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ 
                    color: 'primary.main', 
                    mb: 1,
                  }}
                >
                  {type.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 2
                  }}
                >
                  {type.description}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'text.secondary' }}
                >
                  {type.details}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Container>
);

export default News; 