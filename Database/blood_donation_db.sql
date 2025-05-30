-- Blood Donation Management System Database Schema
-- Created: 2025-05-30
-- Cập nhật: 2025-05-30
--
-- Cơ sở dữ liệu này quản lý hệ thống hiến máu của một cơ sở y tế, bao gồm:
-- - Quản lý người dùng và thành viên
-- - Quản lý các loại máu và thành phần máu
-- - Quản lý yêu cầu hiến máu và yêu cầu nhận máu
-- - Quản lý các đơn vị máu và giai đoạn hiến máu
-- - Quản lý blog và thông báo

-- Drop existing tables if they exist (in reverse order of creation to handle dependencies)
DROP TABLE IF EXISTS BloodCompatibilityRules;
DROP TABLE IF EXISTS DonationRequestsDetails;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS BloodRequests;
DROP TABLE IF EXISTS DonationRequests;
DROP TABLE IF EXISTS BloodDonationPeriod;
DROP TABLE IF EXISTS BloodComponents;
DROP TABLE IF EXISTS BloodUnits;
DROP TABLE IF EXISTS Members;
DROP TABLE IF EXISTS BlogComments;
DROP TABLE IF EXISTS Blog;
DROP TABLE IF EXISTS BloodTypes;
DROP TABLE IF EXISTS Users;

-- Create Users table
-- Bảng này lưu trữ thông tin về tất cả người dùng trong hệ thống (admin, nhân viên, thành viên, khách)
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber VARCHAR(20),
    DateOfBirth DATE,
    Gender VARCHAR(10) CHECK (Gender IN ('Male', 'Female', 'Other')),
    Address NVARCHAR(255),
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Admin', 'Staff', 'Member', 'Guest')), -- Vai trò: Admin (quản trị viên), Staff (nhân viên), Member (thành viên), Guest (khách)
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Create BloodTypes table
-- Bảng này lưu trữ các loại nhóm máu (A+, A-, B+, B-, AB+, AB-, O+, O-)
CREATE TABLE BloodTypes (
    BloodTypeId INT PRIMARY KEY IDENTITY(1,1),
    BloodTypeName VARCHAR(10) NOT NULL UNIQUE
);

-- Create Blog table
-- Bảng này lưu trữ các bài viết blog chia sẻ kinh nghiệm hiến máu, thông tin về các loại máu
CREATE TABLE Blog (
    PostId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Content NTEXT NOT NULL,
    PublishedDate DATETIME DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    ImageUrl NVARCHAR(255),
    Category NVARCHAR(50), -- can nhac
    Tags NVARCHAR(255), --can nhac
    ViewCount INT DEFAULT 0,-- diem so luot xem bai viet, can nhac
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Draft', 'Published', 'Archived')),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Create BlogComments table
-- Bảng này lưu trữ các bình luận của người dùng trên các bài viết blog , can nhac
CREATE TABLE BlogComments (
    CommentId INT PRIMARY KEY IDENTITY(1,1),
    PostId INT NOT NULL,
    UserId INT NOT NULL,
    Content NVARCHAR(1000) NOT NULL,
    CommentDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PostId) REFERENCES Blog(PostId) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Create Members table
-- Bảng này lưu trữ thông tin chi tiết về các thành viên đã đăng ký (người hiến máu hoặc người nhận máu)
CREATE TABLE Members (
    UserId INT PRIMARY KEY,
    BloodTypeId INT,
    CitizenNumber VARCHAR(20) UNIQUE,
    Weight DECIMAL(5, 2),
    Height DECIMAL(5, 2), -- Chiều cao (cm), cần để tính chỉ số BMI và đánh giá tình trạng sức khỏe
    LastDonationDate DATE,
    RecoveryDueDate DATE,
    IsDonor BIT DEFAULT 0, -- Đánh dấu người dùng là người hiến máu
    IsRecipient BIT DEFAULT 0, -- Đánh dấu người dùng là người nhận máu
    MedicalConditions NVARCHAR(500), -- Các tình trạng y tế, xem xét
    Allergies NVARCHAR(255), -- Thông tin về dị ứng, xem xét
    EmergencyContactName NVARCHAR(100), -- Tên người liên hệ khẩn cấp
    EmergencyContactPhone VARCHAR(20), -- SĐT người liên hệ khẩn cấp
    DonationCount INT DEFAULT 0, -- Số lần hiến máu
    LastCheckupDate DATE, -- Ngày khám sức khỏe gần nhất
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    FOREIGN KEY (BloodTypeId) REFERENCES BloodTypes(BloodTypeId)
);

-- Create BloodComponents table
-- Bảng này quản lý các thành phần máu (máu toàn phần, hồng cầu, huyết tương, tiểu cầu)
-- Mỗi thành phần máu có thời hạn sử dụng và điều kiện bảo quản khác nhau
CREATE TABLE BloodComponents (
    ComponentId INT PRIMARY KEY IDENTITY(1,1),
    ComponentName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    ShelfLifeDays INT NOT NULL, -- Thời hạn sử dụng tiêu chuẩn tính bằng ngày, dùng để tính ExpiryDate cho đơn vị máu
    StorageConditions NVARCHAR(255)
);

-- Create BloodUnits table
-- Bảng này lưu trữ thông tin về các đơn vị máu có trong kho của cơ sở y tế
CREATE TABLE BloodUnits (
    BloodUnitId INT PRIMARY KEY IDENTITY(1,1),
    BloodTypeId INT NOT NULL,
    ComponentId INT NOT NULL,
    DonorId INT, -- Người hiến máu (nếu có)
    AddDate DATETIME DEFAULT GETDATE(),
    ExpiryDate DATETIME NOT NULL,  --Mỗi loại thành phần máu có thời hạn sử dụng tiêu chuẩn (ShelfLifeDays) riêng
    -- Ngày hết hạn (ExpiryDate) của mỗi đơn vị máu được tính bằng ngày thu thập (AddDate) cộng với thời hạn sử dụng tiêu chuẩn (ShelfLifeDays) của thành phần máu tương ứng
    Volume DECIMAL(6, 2) NOT NULL, -- in milliliters
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Available', 'Reserved', 'Used', 'Expired', 'Discarded')), -- Trạng thái: Available (có sẵn), Reserved (đã đặt trước), Used (đã sử dụng), Expired (hết hạn), Discarded (bỏ đi),
    FOREIGN KEY (BloodTypeId) REFERENCES BloodTypes(BloodTypeId),
    FOREIGN KEY (ComponentId) REFERENCES BloodComponents(ComponentId),
    FOREIGN KEY (DonorId) REFERENCES Members(UserId)
);

-- Create BloodDonationPeriod table
-- Bảng này quản lý các giai đoạn/sự kiện hiến máu được tổ chức bởi cơ sở y tế
CREATE TABLE BloodDonationPeriod (
    PeriodId INT PRIMARY KEY IDENTITY(1,1),
    PeriodName NVARCHAR(100) NOT NULL,
    Location NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    OrganizerId INT, -- Người tổ chức
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Scheduled', 'Active', 'Completed', 'Cancelled')),
    PeriodDateFrom DATETIME NOT NULL,
    PeriodDateTo DATETIME NOT NULL,
    TargetQuantity INT NOT NULL,
    CurrentQuantity INT DEFAULT 0, -- Số lượng hiện tại đã thu thập được
    ImageUrl NVARCHAR(255), -- Hình ảnh sự kiện
    FOREIGN KEY (OrganizerId) REFERENCES Users(UserId)
);

-- Create DonationRequests table
-- Bảng này quản lý các yêu cầu hiến máu từ các thành viên
CREATE TABLE DonationRequests (
    RequestId INT PRIMARY KEY IDENTITY(1,1),
    MemberId INT NOT NULL,
    PeriodId INT NOT NULL,
    ComponentId INT NOT NULL, -- Thành phần máu muốn hiến
    PreferredDonationDate DATETIME,
    ActualDonationDate DATETIME, -- Ngày thực hiện hiến máu
    ResponsibleByUserId INT,
    RequestDate DATETIME DEFAULT GETDATE(),
    ApprovalDate DATETIME,
    HealthCheckStatus VARCHAR(20), -- Kết quả kiểm tra sức khỏe
    DonationVolume DECIMAL(6, 2), -- Thể tích máu đã hiến (ml)
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled')),
    Notes NVARCHAR(500),
    FOREIGN KEY (MemberId) REFERENCES Members(UserId) ON DELETE CASCADE,
    FOREIGN KEY (PeriodId) REFERENCES BloodDonationPeriod(PeriodId),
    FOREIGN KEY (ComponentId) REFERENCES BloodComponents(ComponentId),
    FOREIGN KEY (ResponsibleByUserId) REFERENCES Users(UserId)
);

-- Create BloodRequests table
-- Bảng này quản lý các yêu cầu nhận máu từ các thành viên hoặc bệnh viện
CREATE TABLE BloodRequests (
    BloodRequestId INT PRIMARY KEY IDENTITY(1,1),
    MemberId INT NOT NULL,
    BloodTypeId INT NOT NULL,
    ComponentId INT NOT NULL, -- Thành phần máu cần
    BloodUnitId INT,
    ResponsibleById INT,
    IsEmergency BIT DEFAULT 0, -- Đánh dấu yêu cầu máu khẩn cấp, cần ưu tiên xử lý
    RequiredQuantity INT NOT NULL DEFAULT 1, -- Số lượng đơn vị máu cần
    PreferredReceiveDate DATETIME,
    RequestDate DATETIME DEFAULT GETDATE(),
    ApprovalDate DATETIME,
    CompletionDate DATETIME, -- Ngày hoàn thành yêu cầu
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Approved', 'Completed', 'Rejected', 'Cancelled')),
    Notes NVARCHAR(500),
    HospitalName NVARCHAR(255), -- Tên bệnh viện nếu yêu cầu từ bệnh viện khác
    PatientCondition NVARCHAR(500), -- Tình trạng bệnh nhân
    FOREIGN KEY (MemberId) REFERENCES Members(UserId) ON DELETE CASCADE,
    FOREIGN KEY (BloodTypeId) REFERENCES BloodTypes(BloodTypeId),
    FOREIGN KEY (ComponentId) REFERENCES BloodComponents(ComponentId),
    FOREIGN KEY (BloodUnitId) REFERENCES BloodUnits(BloodUnitId),
    FOREIGN KEY (ResponsibleById) REFERENCES Users(UserId)
);

-- Create DonationRequestsDetails table
-- Bảng này lưu trữ chi tiết về các đơn vị máu được hiến trong một yêu cầu hiến máu
CREATE TABLE DonationRequestsDetails (
    DetailsId INT PRIMARY KEY IDENTITY(1,1),
    RequestId INT NOT NULL,
    BloodUnitId INT NOT NULL,
    Volume DECIMAL(6, 2) NOT NULL, -- in milliliters
    FOREIGN KEY (RequestId) REFERENCES DonationRequests(RequestId) ON DELETE CASCADE,
    FOREIGN KEY (BloodUnitId) REFERENCES BloodUnits(BloodUnitId)
);

-- Create BloodCompatibilityRules table
-- Bảng này quản lý các quy tắc tương thích giữa các nhóm máu
-- Ví dụ: Nhóm máu O- có thể hiến cho tất cả các nhóm máu khác
CREATE TABLE BloodCompatibilityRules (
    BloodRuleId INT PRIMARY KEY IDENTITY(1,1),
    BloodGiveId INT NOT NULL,
    BloodRecieveId INT NOT NULL,
    IsCompatible BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (BloodGiveId) REFERENCES BloodTypes(BloodTypeId),
    FOREIGN KEY (BloodRecieveId) REFERENCES BloodTypes(BloodTypeId)
);
-- Create Notifications table
-- Bảng này quản lý các thông báo gửi đến người dùng
-- Ví dụ: Nhắc nhở hiến máu, thông báo yêu cầu khẩn cấp, cập nhật trạng thái yêu cầu
CREATE TABLE Notifications (
    NotificationId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    NotificationType VARCHAR(50) NOT NULL, -- DonationReminder, EmergencyRequest, RequestStatus, etc.
    RelatedEntityId INT, -- ID của đối tượng liên quan (RequestId, etc.)
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
);

-- Insert initial blood types
INSERT INTO BloodTypes (BloodTypeName) VALUES 
('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-');

-- Insert blood compatibility rules
-- Donor blood type -> Recipient blood type
INSERT INTO BloodCompatibilityRules (BloodGiveId, BloodRecieveId, IsCompatible) VALUES
-- O- donors can give to anyone
(8, 1, 1), -- O- to A+
(8, 2, 1), -- O- to A-
(8, 3, 1), -- O- to B+
(8, 4, 1), -- O- to B-
(8, 5, 1), -- O- to AB+
(8, 6, 1), -- O- to AB-
(8, 7, 1), -- O- to O+
(8, 8, 1), -- O- to O-

-- O+ donors can give to O+, A+, B+, AB+
(7, 1, 1), -- O+ to A+
(7, 3, 1), -- O+ to B+
(7, 5, 1), -- O+ to AB+
(7, 7, 1), -- O+ to O+
(7, 2, 0), -- O+ to A-
(7, 4, 0), -- O+ to B-
(7, 6, 0), -- O+ to AB-
(7, 8, 0), -- O+ to O-

-- A- donors can give to A+, A-, AB+, AB-
(2, 1, 1), -- A- to A+
(2, 2, 1), -- A- to A-
(2, 5, 1), -- A- to AB+
(2, 6, 1), -- A- to AB-
(2, 3, 0), -- A- to B+
(2, 4, 0), -- A- to B-
(2, 7, 0), -- A- to O+
(2, 8, 0), -- A- to O-

-- A+ donors can give to A+, AB+
(1, 1, 1), -- A+ to A+
(1, 5, 1), -- A+ to AB+
(1, 2, 0), -- A+ to A-
(1, 3, 0), -- A+ to B+
(1, 4, 0), -- A+ to B-
(1, 6, 0), -- A+ to AB-
(1, 7, 0), -- A+ to O+
(1, 8, 0), -- A+ to O-

-- B- donors can give to B+, B-, AB+, AB-
(4, 3, 1), -- B- to B+
(4, 4, 1), -- B- to B-
(4, 5, 1), -- B- to AB+
(4, 6, 1), -- B- to AB-
(4, 1, 0), -- B- to A+
(4, 2, 0), -- B- to A-
(4, 7, 0), -- B- to O+
(4, 8, 0), -- B- to O-

-- B+ donors can give to B+, AB+
(3, 3, 1), -- B+ to B+
(3, 5, 1), -- B+ to AB+
(3, 1, 0), -- B+ to A+
(3, 2, 0), -- B+ to A-
(3, 4, 0), -- B+ to B-
(3, 6, 0), -- B+ to AB-
(3, 7, 0), -- B+ to O+
(3, 8, 0), -- B+ to O-

-- AB- donors can give to AB+, AB-
(6, 5, 1), -- AB- to AB+
(6, 6, 1), -- AB- to AB-
(6, 1, 0), -- AB- to A+
(6, 2, 0), -- AB- to A-
(6, 3, 0), -- AB- to B+
(6, 4, 0), -- AB- to B-
(6, 7, 0), -- AB- to O+
(6, 8, 0), -- AB- to O-

-- AB+ donors can give only to AB+
(5, 5, 1), -- AB+ to AB+
(5, 1, 0), -- AB+ to A+
(5, 2, 0), -- AB+ to A-
(5, 3, 0), -- AB+ to B+
(5, 4, 0), -- AB+ to B-
(5, 6, 0), -- AB+ to AB-
(5, 7, 0), -- AB+ to O+
(5, 8, 0); -- AB+ to O-

-- Insert a default admin user (password should be hashed in a real application)
INSERT INTO Users (PasswordHash, FullName, Email, PhoneNumber, Role) 
VALUES ('$2a$12$1234567890123456789012', 'System Administrator', 'admin@blooddonation.com', '0123456789', 'Admin');

-- Insert blood components
-- Thêm dữ liệu ban đầu cho các thành phần máu
-- Mỗi thành phần có thời hạn sử dụng và điều kiện bảo quản riêng
INSERT INTO BloodComponents (ComponentName, Description, ShelfLifeDays, StorageConditions) VALUES
('Whole Blood', 'Máu toàn phần chứa tất cả các thành phần của máu', 35, 'Nhiệt độ 1-6°C'),
('Red Blood Cells', 'Hồng cầu được tách từ máu toàn phần', 42, 'Nhiệt độ 1-6°C'),
('Plasma', 'Huyết tương chứa các protein và chất điện giải', 365, 'Đông lạnh ở nhiệt độ -18°C hoặc thấp hơn'),
('Platelets', 'Tiểu cầu giúp đông máu', 5, 'Nhiệt độ 20-24°C với sự khuấy động liên tục');
