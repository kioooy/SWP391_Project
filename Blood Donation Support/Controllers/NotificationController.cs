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

        // GET: api/Notification/GetUserNotifications/{userId}
        [HttpGet("GetUserNotifications/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsActive)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notifications);
        }

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

        // PUT: api/Notification/MarkAllAsRead/{userId}
        [HttpPut("MarkAllAsRead/{userId}")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            var unread = await _context.Notifications.Where(n => n.UserId == userId && !n.IsRead && n.IsActive).ToListAsync();
            foreach (var n in unread) n.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/Notification/CreateUrgentDonationRequest
        [HttpPost("CreateUrgentDonationRequest")]
        public async Task<IActionResult> CreateUrgentDonationRequest([FromBody] UrgentDonationRequestDTO request)
        {
            // Tránh tạo trùng lặp thông báo khẩn cấp chưa đọc
            var exists = await _context.Notifications.AnyAsync(n => 
                n.UserId == request.UserId && 
                n.NotificationType == "UrgentDonationRequest" && 
                !n.IsRead && 
                n.IsActive);

            if (!exists)
            {
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
            // Gửi thông báo cho admin nếu có NotifyAdmin
            if (request.NotifyAdmin)
            {
                // Lấy danh sách user có role Admin
                var adminUsers = await _context.Users.Include(u => u.Role)
                    .Where(u => u.Role.Name == "Admin" && u.IsActive)
                    .ToListAsync();
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
            // Trả về Ok nếu đã có thông báo tương tự tồn tại để tránh lỗi không cần thiết
            return Ok(new { message = "Đã gửi thông báo huy động và thông báo cho admin (nếu chọn)!" });
        }

        // POST: api/Notification/CreateRecoveryReminder/{userId}
        [HttpPost("CreateRecoveryReminder/{userId}")]
        public async Task<IActionResult> CreateRecoveryReminder(int userId)
        {
            // Kiểm tra user có phải donor không (dựa vào bảng Members)
            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
            if (member == null || member.IsDonor != true)
            {
                // Không tạo thông báo donor cho user không phải donor
                return Ok();
            }
            var lastDonation = await _context.DonationRequests
                .Where(d => d.MemberId == userId && d.Status == "Completed")
                .OrderByDescending(d => d.CompletionDate)
                .FirstOrDefaultAsync();

            string title, message, notificationType;
            DateTime? lastDonationDate = lastDonation?.CompletionDate;
            if (lastDonation == null || lastDonationDate == null)
            {
                title = "🎉 Chào mừng bạn!";
                message = "Bạn chưa hiến máu lần nào. Hãy đăng ký hiến máu để cứu người!";
                notificationType = "FirstTime";
            }
            else
            {
                var recoveryDate = lastDonationDate.Value.AddDays(84);
                var currentDate = DateTime.Now;
                var daysUntilRecovery = (recoveryDate - currentDate).Days;
                if (currentDate >= recoveryDate)
                {
                    title = "Nhắc nhở hiến máu";
                    message = "Bạn đã có thể hiến máu lại! Hãy đăng ký ngay để cứu người.";
                    notificationType = "ReadyToDonate";
                }
                else if (daysUntilRecovery <= 7)
                {
                    title = "Sắp đến ngày hiến máu";
                    message = $"Còn {daysUntilRecovery} ngày nữa bạn có thể hiến máu lại. Ngày: {recoveryDate:dd/MM/yyyy}";
                    notificationType = "AlmostReady";
                }
                else
                {
                    title = "Thông tin phục hồi";
                    message = $"Bạn đang trong thời gian phục hồi. Còn {daysUntilRecovery} ngày nữa có thể hiến máu lại.";
                    notificationType = "RecoveryReminder";
                }
            }
            // Tránh tạo trùng notification chưa đọc cùng loại
            var exists = await _context.Notifications.AnyAsync(n => n.UserId == userId && n.NotificationType == notificationType && !n.IsRead && n.IsActive);
            if (!exists)
            {
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

    public class UrgentDonationRequestDTO
    {
        public int UserId { get; set; }
        public string Message { get; set; }
        public bool NotifyAdmin { get; set; } // Thêm trường này
    }
} 