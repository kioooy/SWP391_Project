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

        // POST: api/Notification/CreateRecoveryReminder/{userId}
        [HttpPost("CreateRecoveryReminder/{userId}")]
        public async Task<IActionResult> CreateRecoveryReminder(int userId)
        {
            // Lấy ngày hiến máu gần nhất của user:
            // Toán tử ?. (null-conditional): Kiểm tra lastDonation có null không trước khi truy cập thuộc tính
            // Toán tử ?? (null-coalescing): Nếu vế trái là null, sử dụng giá trị vế phải
            // Logic: 
            // 1. lastDonation?.CompletionDate: Nếu lastDonation khác null, lấy CompletionDate; nếu null thì trả về null
            // 2. Nếu CompletionDate là null, kiểm tra PreferredDonationDate:
            //    - lastDonation?.PreferredDonationDate.HasValue: Kiểm tra PreferredDonationDate có giá trị không
            //    - Nếu có giá trị, chuyển sang DateTime bằng ToDateTime(TimeOnly.MinValue)
            //    - Nếu không có giá trị, gán null
            var lastDonation = await _context.DonationRequests
                .Where(d => d.MemberId == userId && d.Status == "Completed")
                .OrderByDescending(d => d.CompletionDate ?? (d.PreferredDonationDate.HasValue ? d.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null))
                .FirstOrDefaultAsync();

            string title, message, notificationType;
            DateTime? lastDonationDate = lastDonation?.CompletionDate ?? (lastDonation?.PreferredDonationDate.HasValue == true ? lastDonation.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null);
            if (lastDonation == null)
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
} 