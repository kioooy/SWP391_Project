import React from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const newsList = [
  {
    id: 1,
    title: 'Ngày hội hiến máu toàn quốc 2024',
    date: '10/06/2024',
    description: 'Sự kiện hiến máu lớn nhất năm 2024 đã thu hút hơn 10.000 người tham gia trên toàn quốc. Chương trình được tổ chức đồng thời tại 63 tỉnh thành, với sự tham gia của các bệnh viện, trung tâm y tế và các tổ chức tình nguyện. Kết quả đạt được là hơn 15.000 đơn vị máu, đáp ứng nhu cầu cấp cứu và điều trị cho bệnh nhân trong cả nước. Đặc biệt, sự kiện năm nay còn có sự tham gia của nhiều nghệ sĩ nổi tiếng, góp phần lan tỏa thông điệp về ý nghĩa của việc hiến máu tình nguyện. Các hoạt động văn nghệ, tọa đàm và triển lãm về hiến máu cũng được tổ chức song song, thu hút đông đảo người dân tham gia. Đây là cơ hội để nâng cao nhận thức cộng đồng về tầm quan trọng của việc hiến máu tình nguyện trong việc cứu sống người bệnh.'
  },
  {
    id: 2,
    title: 'Câu chuyện người hiến máu tiêu biểu',
    date: '05/06/2024',
    description: 'Anh Nguyễn Văn A, 45 tuổi, đã hiến máu 30 lần liên tiếp trong suốt 15 năm qua. Với mỗi lần hiến 350ml máu, anh đã góp phần cứu sống hàng trăm bệnh nhân. "Tôi bắt đầu hiến máu từ năm 2009, sau khi chứng kiến người thân được cứu sống nhờ máu hiến tặng. Từ đó, tôi luôn duy trì thói quen hiến máu định kỳ 3 tháng một lần", anh A chia sẻ. Câu chuyện của anh đã truyền cảm hứng cho nhiều người tham gia hiến máu tình nguyện. Năm 2023, anh được vinh danh là "Người hiến máu tiêu biểu toàn quốc" và nhận được bằng khen từ Bộ Y tế. Không chỉ dừng lại ở việc hiến máu, anh còn tích cực tham gia các hoạt động tuyên truyền, vận động người dân tham gia hiến máu. Anh đã thành lập nhóm "Những người bạn hiến máu" với hơn 500 thành viên, thường xuyên tổ chức các buổi hiến máu nhân đạo tại địa phương.'
  },
  {
    id: 3,
    title: 'Lợi ích sức khỏe khi hiến máu định kỳ',
    date: '01/06/2024',
    description: 'Theo nghiên cứu mới nhất từ Viện Huyết học - Truyền máu Trung ương, việc hiến máu định kỳ mang lại nhiều lợi ích sức khỏe đáng kể. Người hiến máu thường xuyên có nguy cơ mắc bệnh tim mạch thấp hơn 30% so với người không hiến máu. Ngoài ra, quá trình hiến máu giúp kích thích tủy xương sản xuất tế bào máu mới, cải thiện lưu thông máu và giảm nguy cơ mắc các bệnh về máu. Mỗi lần hiến máu, người hiến còn được kiểm tra sức khỏe miễn phí và nhận kết quả xét nghiệm về các bệnh truyền nhiễm như HIV, viêm gan B, C. Nghiên cứu cũng chỉ ra rằng việc hiến máu thường xuyên giúp giảm nồng độ sắt trong máu, từ đó giảm nguy cơ mắc các bệnh liên quan đến tích tụ sắt như bệnh tim, đột quỵ và một số bệnh ung thư. Đây là một trong những cách đơn giản và hiệu quả để duy trì sức khỏe tốt.'
  },
  {
    id: 4,
    title: 'Công nghệ mới trong xét nghiệm máu',
    date: '28/05/2024',
    description: 'Viện Huyết học - Truyền máu Trung ương đã triển khai hệ thống xét nghiệm máu thế hệ mới với công nghệ NAT (Nucleic Acid Testing). Công nghệ này cho phép phát hiện virus trong máu chỉ sau 6-8 giờ kể từ khi nhiễm bệnh, thay vì 3-4 tuần như phương pháp truyền thống. Hệ thống mới cũng được tích hợp trí tuệ nhân tạo (AI) để phân tích và dự đoán các nguy cơ tiềm ẩn trong máu hiến tặng. Đây là bước tiến quan trọng trong việc đảm bảo an toàn truyền máu và nâng cao chất lượng dịch vụ y tế. Công nghệ NAT sử dụng kỹ thuật khuếch đại gen để phát hiện các mầm bệnh ngay cả khi chúng có số lượng rất nhỏ trong máu. Điều này giúp giảm thiểu tối đa nguy cơ lây nhiễm bệnh qua đường truyền máu. Hệ thống AI được tích hợp có khả năng học hỏi và cải thiện độ chính xác theo thời gian, giúp các bác sĩ đưa ra quyết định nhanh chóng và chính xác hơn.'
  },
  {
    id: 5,
    title: 'Chương trình hiến máu nhân đạo tại các trường đại học',
    date: '25/05/2024',
    description: 'Chương trình "Sinh viên với hiến máu tình nguyện" đã được triển khai tại hơn 50 trường đại học trên cả nước. Trong năm học 2023-2024, các trường đại học đã tổ chức hơn 200 buổi hiến máu, thu hút hơn 50.000 sinh viên tham gia. Đặc biệt, Đại học Y Hà Nội và Đại học Y Dược TP.HCM đã thành lập các câu lạc bộ hiến máu tình nguyện, tổ chức các buổi tọa đàm và hội thảo về hiến máu. Chương trình không chỉ góp phần cung cấp máu cho bệnh nhân mà còn giáo dục thế hệ trẻ về tinh thần tương thân tương ái. Các hoạt động ngoại khóa như cuộc thi tìm hiểu về hiến máu, triển lãm tranh ảnh và các buổi giao lưu với người hiến máu tiêu biểu đã được tổ chức thường xuyên. Nhiều sinh viên sau khi tham gia chương trình đã trở thành tình nguyện viên tích cực, góp phần lan tỏa thông điệp về hiến máu tình nguyện trong cộng đồng.'
  },
  {
    id: 6,
    title: 'Kỷ lục mới về số lượng đơn vị máu hiến tặng',
    date: '20/05/2024',
    description: 'Ngân hàng máu quốc gia đã đạt kỷ lục mới với hơn 1 triệu đơn vị máu được hiến tặng trong quý đầu năm 2024, tăng 15% so với cùng kỳ năm ngoái. Thành tích này đạt được nhờ chiến dịch "Hiến máu cứu người" được triển khai rộng rãi tại 63 tỉnh thành. Đặc biệt, số lượng người hiến máu lần đầu tăng 25%, cho thấy sự lan tỏa mạnh mẽ của phong trào hiến máu tình nguyện. Bộ Y tế đánh giá đây là bước tiến quan trọng trong việc đảm bảo nguồn máu an toàn cho công tác điều trị và cấp cứu. Chiến dịch đã nhận được sự hưởng ứng tích cực từ các doanh nghiệp, tổ chức xã hội và người dân. Nhiều đơn vị đã tổ chức các chương trình hiến máu tại chỗ, tạo điều kiện thuận lợi cho nhân viên tham gia. Các hoạt động tuyên truyền trên mạng xã hội và truyền thông đại chúng đã góp phần nâng cao nhận thức cộng đồng về tầm quan trọng của việc hiến máu tình nguyện.'
  }
];

const News = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Typography variant="h3" align="center" fontWeight={700} gutterBottom color="primary">
      Tin Tức
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {newsList.map((news) => (
          <Grid item xs={12} md={4} key={news.id}>
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
                  component={RouterLink}
                  to={`/news/${news.id}`}
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'primary.main', 
                    cursor: 'pointer', 
                    display: 'block',
                    mb: 1,
                    '&:hover': { 
                      color: 'primary.dark',
                      textDecoration: 'underline' 
                    }
                  }}
                >
                  {news.title}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mb: 2,
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {news.date}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {news.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  component={RouterLink} 
                  to={`/news/${news.id}`}
                  sx={{
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                >
                  Xem chi tiết
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Container>
);

export default News; 