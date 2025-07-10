import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

const HealthSurveyReview = ({ formData }) => {
  if (!formData || typeof formData !== 'object') return <Typography>Không có thông tin</Typography>;
  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="bold" color="primary.main">
        Phiếu khảo sát đã chọn:
      </Typography>
      {/* Câu 1 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          1. Anh/chị từng hiến máu chưa?
        </Typography>
        <Typography pl={2}>
          {formData['1.1'] && <span>- Có<br/></span>}
          {formData['1.2'] && <span>- Không<br/></span>}
        </Typography>
      </Box>
      {/* Câu 2 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          2. Hiện tại, anh/ chị có mắc bệnh lý nào không?
        </Typography>
        <Stack pl={2}>
          {formData['2.1'] && <Typography>- Có</Typography>}
          {formData['2.1_detail'] && <Typography>+ Chi tiết: {formData['2.1_detail']}</Typography>}
          {formData['2.2'] && <Typography>- Không</Typography>}
        </Stack>
      </Box>
      {/* Câu 3 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          3. Trước đây, anh/chị có từng mắc một trong các bệnh...
        </Typography>
        <Stack pl={2}>
          {formData['3.1'] && <Typography>- Có</Typography>}
          {formData['3.2'] && <Typography>- Không</Typography>}
          {formData['3.3'] && <Typography>- Bệnh khác</Typography>}
          {formData['3.3_detail'] && <Typography>+ Chi tiết: {formData['3.3_detail']}</Typography>}
        </Stack>
      </Box>
      {/* Câu 4 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          4. Trong 12 tháng gần đây, anh/chị có:
        </Typography>
        <Stack pl={2}>
          {formData['4.1'] && <Typography>- Khỏi bệnh sau khi mắc một trong các bệnh: sốt rét, giang mai, lao, viêm não-màng não, uốn ván, phẫu thuật ngoại khoa?</Typography>}
          {formData['4.2'] && <Typography>- Được truyền máu hoặc các chế phẩm máu?</Typography>}
          {formData['4.3'] && <Typography>- Tiêm Vacxin? {formData['4.3_detail'] && `(Loại vacxin: ${formData['4.3_detail']})`}</Typography>}
          {formData['4.4'] && <Typography>- Không</Typography>}
        </Stack>
      </Box>
      {/* Câu 5 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          5. Trong 06 tháng gần đây, anh/chị có:
        </Typography>
        <Stack pl={2}>
          {formData['5.1'] && <Typography>- Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tủy, viêm tủy xương?</Typography>}
          {formData['5.2'] && <Typography>- Sút cân nhanh không rõ nguyên nhân?</Typography>}
          {formData['5.3'] && <Typography>- Nổi hạch kéo dài?</Typography>}
          {formData['5.4'] && <Typography>- Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi,…)?</Typography>}
          {formData['5.5'] && <Typography>- Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?</Typography>}
          {formData['5.6'] && <Typography>- Sử dụng ma túy?</Typography>}
          {formData['5.7'] && <Typography>- Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?</Typography>}
          {formData['5.8'] && <Typography>- Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?</Typography>}
          {formData['5.9'] && <Typography>- Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?</Typography>}
          {formData['5.10'] && <Typography>- Quan hệ tình dục với người cùng giới?</Typography>}
          {formData['5.11'] && <Typography>- Không</Typography>}
        </Stack>
      </Box>
      {/* Câu 6 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          6. Trong 01 tháng gần đây, anh/chị có:
        </Typography>
        <Stack pl={2}>
          {formData['6.1'] && <Typography>- Khỏi bệnh sau khi mắc bệnh viêm đường tiết niệu, viêm da nhiễm trùng, viêm phế quản, viêm phổi, sởi, ho gà, quai bị, sốt xuất huyết, kiết lỵ, tả, Rubella?</Typography>}
          {formData['6.2'] && <Typography>- Đi vào vùng có dịch bệnh lưu hành (sốt rét, sốt xuất huyết, Zika,…)?</Typography>}
          {formData['6.3'] && <Typography>- Không</Typography>}
        </Stack>
      </Box>
      {/* Câu 7 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          7. Trong 14 ngày gần đây, anh/chị có:
        </Typography>
        <Stack pl={2}>
          {formData['7.1'] && <Typography>- Bị cúm, cảm lạnh, ho, nhức đầu, sốt, đau họng?</Typography>}
          {formData['7.2'] && <Typography>- Không</Typography>}
          {formData['7.3'] && <Typography>- Khác (cụ thể): {formData['7.3_detail']}</Typography>}
        </Stack>
      </Box>
      {/* Câu 8 */}
      <Box>
        <Typography fontWeight="bold" color="primary.main">
          8. Trong 07 ngày gần đây, anh/chị có:
        </Typography>
        <Stack pl={2}>
          {formData['8.1'] && <Typography>- Dùng thuốc kháng sinh, kháng viêm, Aspirin, Corticoid?</Typography>}
          {formData['8.2'] && <Typography>- Không</Typography>}
          {formData['8.3'] && <Typography>- Khác (cụ thể): {formData['8.3_detail']}</Typography>}
        </Stack>
      </Box>
      
    </Stack>
  );
};

export default HealthSurveyReview; 