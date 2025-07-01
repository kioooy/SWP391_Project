# Chức Năng Tạo Đợt Hiến Máu

## Tổng Quan
Chức năng tạo đợt hiến máu cho phép Staff và Admin tạo, quản lý và theo dõi các đợt hiến máu trong hệ thống. **Địa điểm hiến máu được lấy tự động từ thông tin bệnh viện duy nhất trong hệ thống.**

## Các Component Đã Tạo

### 1. CreateBloodDonationPeriod.js
**Vị trí:** `src/components/CreateBloodDonationPeriod.js`

**Chức năng:**
- Form tạo đợt hiến máu mới với validation đầy đủ
- **Tự động lấy thông tin bệnh viện duy nhất từ API**
- **Hiển thị thông tin bệnh viện và tự động điền địa điểm**
- Sử dụng Material-UI và Formik
- Validation với Yup schema
- DateTime picker cho thời gian bắt đầu và kết thúc

**Các trường thông tin:**
- Tên đợt hiến máu (bắt buộc, tối đa 100 ký tự)
- **Địa điểm (tự động từ bệnh viện duy nhất)**
- Trạng thái (Active/Completed/Cancelled)
- Thời gian bắt đầu (bắt buộc, phải lớn hơn thời gian hiện tại)
- Thời gian kết thúc (bắt buộc, phải sau thời gian bắt đầu)
- Số lượng mục tiêu (bắt buộc, số dương)
- URL hình ảnh (tùy chọn)

### 2. BloodDonationPeriodCard.js
**Vị trí:** `src/components/BloodDonationPeriodCard.js`

**Chức năng:**
- Hiển thị thông tin đợt hiến máu dưới dạng card
- Hiển thị tiến độ hiến máu với progress bar
- Chip trạng thái với màu sắc tương ứng
- Nút đăng ký hiến máu cho đợt đang diễn ra

### 3. BloodDonationPeriods.js
**Vị trí:** `src/pages/BloodDonationPeriods.js`

**Chức năng:**
- Trang hiển thị danh sách đợt hiến máu cho người dùng thông thường
- Tìm kiếm và lọc theo trạng thái
- Tabs: Tất cả, Đang diễn ra, Sắp diễn ra, Đã hoàn thành
- Responsive grid layout

### 4. BloodDonationPeriodManagement.js (Cập nhật)
**Vị trí:** `src/pages/BloodDonationPeriodManagement.js`

**Chức năng:**
- Quản lý đợt hiến máu cho Staff/Admin
- Bảng hiển thị với Material-UI Table
- Nút tạo đợt hiến máu mới
- Chỉnh sửa trạng thái inline
- Xóa đợt hiến máu với xác nhận

## API Endpoints

### Backend (BloodDonationPeriodController.cs)

| Method | Endpoint | Quyền | Chức năng |
|--------|----------|-------|-----------|
| `POST` | `/api/BloodDonationPeriod` | Staff, Admin | Tạo đợt hiến máu mới |
| `GET` | `/api/BloodDonationPeriod` | Public | Lấy đợt hiến máu đang hoạt động |
| `GET` | `/api/BloodDonationPeriod/all` | Staff, Admin | Lấy tất cả đợt hiến máu |
| `GET` | `/api/BloodDonationPeriod/{id}` | Staff, Admin | Lấy chi tiết đợt hiến máu |
| `PUT` | `/api/BloodDonationPeriod/{id}` | Staff, Admin | Cập nhật đợt hiến máu |
| `PATCH` | `/api/BloodDonationPeriod/{id}/status` | Staff, Admin | Cập nhật trạng thái |
| `DELETE` | `/api/BloodDonationPeriod/{id}` | Staff, Admin | Xóa đợt hiến máu |

### Backend (HospitalController.cs)

| Method | Endpoint | Quyền | Chức năng |
|--------|----------|-------|-----------|
| `GET` | `/api/Hospital` | Public | **Lấy thông tin bệnh viện duy nhất** |
| `PUT` | `/api/Hospital/{id}/location` | Admin | Cập nhật vị trí bệnh viện |

## Cách Sử Dụng

### Cho Staff/Admin:
1. Truy cập `/manage-blood-periods`
2. Nhấn nút "Tạo Đợt Hiến Máu Mới"
3. **Xem thông tin bệnh viện được hiển thị tự động**
4. Điền thông tin còn lại và submit
5. Quản lý trạng thái và xóa đợt hiến máu

### Cho Người Dùng Thông Thường:
1. Truy cập `/blood-donation-periods`
2. Xem danh sách đợt hiến máu
3. Tìm kiếm và lọc theo trạng thái
4. Đăng ký hiến máu cho đợt đang diễn ra

## Tính Năng Đặc Biệt

### Validation
- Tên đợt: Bắt buộc, tối đa 100 ký tự
- **Địa điểm: Tự động từ bệnh viện duy nhất**
- Thời gian: Bắt đầu phải sau hiện tại, kết thúc phải sau bắt đầu
- Số lượng mục tiêu: Số dương
- URL hình ảnh: Định dạng URL hợp lệ

### Tự Động Cập Nhật Trạng Thái
- Backend tự động cập nhật trạng thái "Completed" cho đợt đã hết hạn
- Chỉ hiển thị đợt "Active" cho người dùng thông thường

### Bảo Mật
- Chỉ Staff/Admin có thể tạo, chỉnh sửa, xóa đợt hiến máu
- Kiểm tra quyền truy cập với JWT token
- Validation dữ liệu đầu vào

### Tích Hợp Bệnh Viện
- **Địa điểm hiến máu được lấy tự động từ thông tin bệnh viện duy nhất**
- **Format: "Tên Bệnh Viện - Địa Chỉ"**
- **Hiển thị thông tin bệnh viện đầy đủ (tên, địa chỉ, số điện thoại)**
- **Không thể tạo đợt hiến máu nếu không có thông tin bệnh viện**

## Cài Đặt và Chạy

### Frontend:
```bash
cd Frontend
npm install
npm start
```

### Backend:
```bash
cd "Blood Donation Support"
dotnet run
```

## Lưu Ý
- Cần đăng nhập với quyền Staff hoặc Admin để tạo đợt hiến máu
- Đợt hiến máu đã có yêu cầu hiến máu không thể xóa
- Hình ảnh đợt hiến máu là tùy chọn
- Tiến độ hiến máu được tính tự động dựa trên số lượng hiện tại và mục tiêu
- **Địa điểm hiến máu được lấy từ bệnh viện duy nhất trong hệ thống**
- **Cần có dữ liệu bệnh viện trong database trước khi tạo đợt hiến máu**
- **Phù hợp cho phần mềm quản lý hiến máu của 1 cơ sở y tế duy nhất** 