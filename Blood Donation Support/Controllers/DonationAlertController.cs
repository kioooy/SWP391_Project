using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Data;
using Microsoft.AspNetCore.Authorization;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DonationAlertController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public DonationAlertController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/DonationAlert/LastSuccessfulDonation/{memberId}
        [HttpGet("LastSuccessfulDonation/{memberId}")]
        public async Task<IActionResult> GetLastSuccessfulDonation(int memberId)
        {
            // Kiểm tra member chỉ xem được dữ liệu của mình
            if (!IsCurrentUser(memberId))
                return Forbid();

            var lastDonation = await _context.DonationRequests
                .Where(d => d.MemberId == memberId && d.Status == "Completed")
                .OrderByDescending(d => d.ApprovalDate ?? (d.PreferredDonationDate.HasValue ? d.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null))
                .FirstOrDefaultAsync();

            if (lastDonation == null)
                return NotFound(new { message = "Chưa có lịch sử hiến máu thành công." });

            DateTime? approvalDate = lastDonation.ApprovalDate;
            DateTime? preferredDate = lastDonation.PreferredDonationDate.HasValue
                ? lastDonation.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue)
                : (DateTime?)null;
            var lastDate = approvalDate ?? preferredDate;
            return Ok(new { lastDate });
        }

        // GET: api/DonationAlert/CheckDonationEligibility/{memberId}
        [HttpGet("CheckDonationEligibility/{memberId}")]
        public async Task<IActionResult> CheckDonationEligibility(int memberId)
        {
            // Kiểm tra member chỉ xem được dữ liệu của mình
            if (!IsCurrentUser(memberId))
                return Forbid();

            var lastDonation = await _context.DonationRequests
                .Where(d => d.MemberId == memberId && d.Status == "Completed")
                .OrderByDescending(d => d.ApprovalDate ?? (d.PreferredDonationDate.HasValue ? d.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null))
                .FirstOrDefaultAsync();

            if (lastDonation == null)
            {
                // Chưa hiến máu lần nào -> có thể hiến máu
                return Ok(new { 
                    canDonate = true,
                    message = "Bạn chưa hiến máu lần nào. Có thể đăng ký hiến máu.",
                    lastDonationDate = (DateTime?)null,
                    recoveryDate = (DateTime?)null,
                    daysUntilRecovery = 0
                });
            }

            DateTime? approvalDate = lastDonation.ApprovalDate;
            DateTime? preferredDate = lastDonation.PreferredDonationDate.HasValue
                ? lastDonation.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue)
                : (DateTime?)null;
            var lastDonationDate = approvalDate ?? preferredDate;

            // Tính ngày phục hồi (84 ngày = 12 tuần)
            var recoveryDate = lastDonationDate.Value.AddDays(84);
            var currentDate = DateTime.Now;
            var daysUntilRecovery = (recoveryDate - currentDate).Days;
            var canDonate = currentDate >= recoveryDate;

            string message;
            if (canDonate)
            {
                message = "Bạn đã đủ điều kiện hiến máu! Có thể đăng ký ngay.";
            }
            else
            {
                message = $"Bạn cần thêm {daysUntilRecovery} ngày để phục hồi hoàn toàn. Ngày có thể hiến máu: {recoveryDate:dd/MM/yyyy}";
            }

            return Ok(new { 
                canDonate,
                message,
                lastDonationDate,
                recoveryDate,
                daysUntilRecovery
            });
        }

        // GET: api/DonationAlert/LoginNotification/{memberId}
        [HttpGet("LoginNotification/{memberId}")]
        public async Task<IActionResult> GetLoginNotification(int memberId)
        {
            // Kiểm tra member chỉ xem được dữ liệu của mình
            if (!IsCurrentUser(memberId))
                return Forbid();

            var lastDonation = await _context.DonationRequests
                .Where(d => d.MemberId == memberId && d.Status == "Completed")
                .OrderByDescending(d => d.ApprovalDate ?? (d.PreferredDonationDate.HasValue ? d.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null))
                .FirstOrDefaultAsync();

            if (lastDonation == null)
            {
                return Ok(new { 
                    showNotification = true,
                    type = "FirstTime",
                    title = "Chào mừng bạn!",
                    message = "Bạn chưa hiến máu lần nào. Hãy đăng ký hiến máu để cứu người!",
                    actionUrl = "/donation-registration"
                });
            }

            DateTime? approvalDate = lastDonation.ApprovalDate;
            DateTime? preferredDate = lastDonation.PreferredDonationDate.HasValue
                ? lastDonation.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue)
                : (DateTime?)null;
            var lastDonationDate = approvalDate ?? preferredDate;
            var recoveryDate = lastDonationDate.Value.AddDays(84);
            var currentDate = DateTime.Now;
            var daysUntilRecovery = (recoveryDate - currentDate).Days;

            if (currentDate >= recoveryDate)
            {
                return Ok(new { 
                    showNotification = true,
                    type = "ReadyToDonate",
                    title = "🩸 Nhắc nhở hiến máu",
                    message = "Bạn đã có thể hiến máu lại! Hãy đăng ký ngay để cứu người.",
                    actionUrl = "/donation-registration"
                });
            }
            else if (daysUntilRecovery <= 7)
            {
                return Ok(new { 
                    showNotification = true,
                    type = "AlmostReady",
                    title = "⏰ Sắp đến ngày hiến máu",
                    message = $"Còn {daysUntilRecovery} ngày nữa bạn có thể hiến máu lại. Ngày: {recoveryDate:dd/MM/yyyy}",
                    actionUrl = "/donation-registration"
                });
            }
            else
            {
                return Ok(new { 
                    showNotification = false,
                    message = "Bạn đang trong thời gian phục hồi."
                });
            }
        }

        // Helper method để kiểm tra user hiện tại
        private bool IsCurrentUser(int memberId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (!int.TryParse(userIdClaim, out int currentUserId))
                return false;

            // Kiểm tra memberId có thuộc về user hiện tại không
            var member = _context.Members.FirstOrDefault(m => m.UserId == currentUserId);
            return member != null && currentUserId == memberId;
        }
    }
}
