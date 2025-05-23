import React from 'react';
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'Ai có thể hiến máu?',
    answer: 'Người từ 18-60 tuổi, cân nặng trên 45kg, sức khỏe tốt, không mắc các bệnh lây nhiễm qua đường máu.'
  },
  {
    question: 'Hiến máu có ảnh hưởng đến sức khỏe không?',
    answer: 'Hiến máu hoàn toàn không ảnh hưởng đến sức khỏe nếu tuân thủ đúng hướng dẫn. Cơ thể sẽ hồi phục lượng máu đã hiến sau một thời gian ngắn.'
  },
  {
    question: 'Bao lâu thì được hiến máu lại?',
    answer: 'Nam: 12 tuần/lần, tối đa 4 lần/năm. Nữ: 16 tuần/lần, tối đa 3 lần/năm.'
  },
  {
    question: 'Cần chuẩn bị gì trước khi hiến máu?',
    answer: 'Ăn nhẹ, ngủ đủ giấc, mang theo giấy tờ tùy thân, không uống rượu bia trước khi hiến máu.'
  },
  {
    question: 'Sau khi hiến máu nên làm gì?',
    answer: 'Nghỉ ngơi tại chỗ 10-15 phút, uống nước, ăn nhẹ, tránh vận động mạnh trong ngày.'
  }
];

const FAQ = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Typography variant="h3" align="center" fontWeight={700} gutterBottom color="primary">
      Hỏi - Đáp về Hiến Máu
    </Typography>
    <Box sx={{ mt: 4 }}>
      {faqs.map((faq, idx) => (
        <Accordion key={idx} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  </Container>
);

export default FAQ; 