using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Data;
using Blood_Donation_Support.Model;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        public NotificationController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // ===== API LẤY THÔNG BÁO CỦA USER =====
        // GET: api/Notification/GetUserNotifications/{userId}
        [HttpGet("GetUserNotifications/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            // TIÊU CHÍ: Chỉ lấy thông báo còn hoạt động (IsActive = true) và sắp xếp theo thời gian tạo mới nhất
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notifications);
        }

        // ===== API ĐÁNH DẤU ĐÃ ĐỌC THÔNG BÁO =====
        // PUT: api/Notification/MarkAsRead/{notificationId}
        [HttpPut("MarkAsRead/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId);
            if (notification == null) return NotFound();
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // ===== API ĐÁNH DẤU TẤT CẢ THÔNG BÁO ĐÃ ĐỌC =====
        // PUT: api/Notification/MarkAllAsRead/{userId}
        [HttpPut("MarkAllAsRead/{userId}")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            // TIÊU CHÍ: Chỉ đánh dấu những thông báo chưa đọc và còn hoạt động
            var unread = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead && n.IsActive).ToListAsync();
            foreach (var n in unread) n.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // ===== API TẠO THÔNG BÁO YÊU CẦU HIẾN MÁU KHẨN CẤP =====
        // POST: api/Notification/CreateUrgentDonationRequest
        [HttpPost("CreateUrgentDonationRequest")]
        public async Task<IActionResult> CreateUrgentDonationRequest([FromBody] UrgentDonationRequestDTO request)
        {
            // ===== TIÊU CHÍ 1: TRÁNH TẠO THÔNG BÁO TRÙNG LẶP =====
            // Kiểm tra xem đã có thông báo khẩn cấp chưa đọc cho user này chưa
            // Điều kiện: Cùng UserId + NotificationType = "UrgentDonationRequest" + Chưa đọc + Còn hoạt động
            var exists = await _context.Notifications.AnyAsync(n => 
                n.UserId == request.UserId && 
                n.NotificationType == "UrgentDonationRequest" && 
                !n.IsRead && 
                n.IsActive);

            if (!exists)
            {
                // ===== TIÊU CHÍ 2: TẠO THÔNG BÁO CHO USER =====
                // Chỉ tạo thông báo nếu chưa có thông báo tương tự
                var notification = new Notification
                {
                    UserId = request.UserId,
                    Title = "Yêu cầu hiến máu khẩn cấp",
                    Message = request.Message,
                    NotificationType = "UrgentDonationRequest",
                    CreatedAt = DateTime.Now,
                    IsActive = true,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            // ===== TIÊU CHÍ 3: THÔNG BÁO CHO ADMIN (TÙY CHỌN) =====
            // Nếu có yêu cầu thông báo cho admin (NotifyAdmin = true)
            if (request.NotifyAdmin)
            {
                // Lấy danh sách user có role Admin và còn hoạt động
                var adminUsers = await _context.Users.Include(u => u.Role)
                    .Where(u => u.Role.Name == "Admin" && u.IsActive)
                    .ToListAsync();
                
                // Tạo thông báo cho từng admin
                foreach (var admin in adminUsers)
                {
                    var adminNotification = new Notification
                    {
                        UserId = admin.UserId,
                        Title = "Hệ thống: Có yêu cầu huy động người hiến máu",
                        Message = request.Message,
                        NotificationType = "DonorMobilization",
                        CreatedAt = DateTime.Now,
                        IsActive = true,
                        IsRead = false
                    };
                    _context.Notifications.Add(adminNotification);
                }
                await _context.SaveChangesAsync();
            }
            return Ok(new { message = "Đã gửi thông báo huy động và thông báo cho admin (nếu chọn)!" });
        }

        // ===== API TẠO THÔNG BÁO NHẮC NHỞ PHỤC HỒI =====
        // POST: api/Notification/CreateRecoveryReminder/{userId}
        [HttpPost("CreateRecoveryReminder/{userId}")]
        public async Task<IActionResult> CreateRecoveryReminder(int userId)
        {
            // ===== TIÊU CHÍ 1: KIỂM TRA USER CÓ PHẢI DONOR KHÔNG =====
            // Chỉ tạo thông báo cho user là donor (IsDonor = true)
            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
            if (member == null || member.IsDonor != true)
            {
                // Không tạo thông báo donor cho user không phải donor
                return Ok();
            }

            // ===== TIÊU CHÍ 2: TÌM LẦN HIẾN MÁU GẦN NHẤT =====
            // Lấy lần hiến máu hoàn thành gần nhất để tính thời gian phục hồi
            var lastDonation = await _context.DonationRequests
                .Where(d => d.MemberId == userId && d.Status == "Completed")
                .OrderByDescending(d => d.CompletionDate)
                .FirstOrDefaultAsync();

            string title, message, notificationType;
            DateTime? lastDonationDate = lastDonation?.CompletionDate;

            // ===== TIÊU CHÍ 3: PHÂN LOẠI THÔNG BÁO THEO TRẠNG THÁI =====
            if (lastDonation == null || lastDonationDate == null)
            {
                // Trường hợp 1: Chưa hiến máu lần nào
                title = "🎉 Chào mừng bạn!";
                message = "Bạn chưa hiến máu lần nào. Hãy đăng ký hiến máu để cứu người!";
                notificationType = "FirstTime";
            }
            else
            {
                // ===== TIÊU CHÍ 4: TÍNH TOÁN THỜI GIAN PHỤC HỒI =====
                // Thời gian phục hồi: 84 ngày sau lần hiến máu gần nhất
                var recoveryDate = lastDonationDate.Value.AddDays(84);
                var currentDate = DateTime.Now;
                var daysUntilRecovery = (recoveryDate - currentDate).Days;

                if (currentDate >= recoveryDate)
                {
                    // Trường hợp 2: Đã có thể hiến máu lại (>= 84 ngày)
                    title = "Nhắc nhở hiến máu";
                    message = "Bạn đã có thể hiến máu lại! Hãy đăng ký ngay để cứu người.";
                    notificationType = "ReadyToDonate";
                }
                else if (daysUntilRecovery <= 7)
                {
                    // Trường hợp 3: Sắp đến ngày hiến máu (còn <= 7 ngày)
                    title = "Sắp đến ngày hiến máu";
                    message = $"Còn {daysUntilRecovery} ngày nữa bạn có thể hiến máu lại. Ngày: {recoveryDate:dd/MM/yyyy}";
                    notificationType = "AlmostReady";
                }
                else
                {
                    // Trường hợp 4: Đang trong thời gian phục hồi (> 7 ngày)
                    title = "Thông tin phục hồi";
                    message = $"Bạn đang trong thời gian phục hồi. Còn {daysUntilRecovery} ngày nữa có thể hiến máu lại.";
                    notificationType = "RecoveryReminder";
                }
            }

            // ===== TIÊU CHÍ 5: TRÁNH TẠO THÔNG BÁO TRÙNG LẶP =====
            // Kiểm tra xem đã có thông báo cùng loại chưa đọc cho user này chưa
            var exists = await _context.Notifications.AnyAsync(n => 
                n.UserId == userId && 
                n.NotificationType == notificationType && 
                !n.IsRead && 
                n.IsActive);

            if (!exists)
            {
                // Chỉ tạo thông báo nếu chưa có thông báo tương tự
                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    NotificationType = notificationType,
                    CreatedAt = DateTime.Now,
                    IsActive = true,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }
            return Ok();
        }
    }

    // ===== DTO CHO YÊU CẦU THÔNG BÁO HIẾN MÁU KHẨN CẤP =====
    public class UrgentDonationRequestDTO
    {
        public int UserId { get; set; }           // ID của user cần gửi thông báo
        public string Message { get; set; }       // Nội dung thông báo
        public bool NotifyAdmin { get; set; }     // Có thông báo cho admin hay không
    }
} 