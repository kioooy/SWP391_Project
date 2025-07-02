using Blood_Donation_Support.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificateController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public CertificateController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/Certificate
        [HttpGet]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetAllCertificates()
        {
            var certificates = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Member.BloodType)
                .Include(dr => dr.Period)
                .Where(dr => dr.Status == "Completed")
                .Select(dr => new
                {
                    dr.DonationId,
                    dr.Member.User.CitizenNumber, // Số CMND/CCCD
                    dr.Member.User.FullName, // Họ và tên
                    dr.Member.User.DateOfBirth, // Ngày sinh
                    dr.Member.User.Address,  // Địa chỉ
                    dr.Period.Hospital.Name,  // Địa điểm hiến máu
                    dr.DonationVolume,  // Thể tích máu hiến
                    dr.PreferredDonationDate, // Ngày hiến máu
                    dr.Member.BloodType.BloodTypeName // Nhóm máu
                })
                .ToListAsync();

            return Ok(certificates);
        }

        // GET: api/Certificate/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetCertificateById(int id)
        {
            var certificate = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Member.BloodType)
                .Include(dr => dr.Period)
                .Where(dr => dr.DonationId == id && dr.Status == "Completed")
                .Select(dr => new
                {
                    dr.Member.User.CitizenNumber, // Số CMND/CCCD
                    dr.Member.User.FullName, // Họ và tên
                    dr.Member.User.DateOfBirth, // Ngày sinh
                    dr.Member.User.Address,  // Địa chỉ
                    dr.Period.Hospital.Name,  // Địa điểm hiến máu
                    dr.DonationVolume,  // Thể tích máu hiến
                    dr.PreferredDonationDate, // Ngày hiến máu
                    dr.Member.BloodType.BloodTypeName // Nhóm máu
                })
                .FirstOrDefaultAsync();

            if (certificate == null)
            {
                return NotFound("Không tìm thấy chứng chỉ hiến máu");
            }

            return Ok(certificate);
        }

        // GET: api/Certificate/member/{memberId}
        [HttpGet("member/{memberId}")]
        [Authorize(Roles = "Member,Staff,Admin")]
        public async Task<IActionResult> GetCertificatesByMember(int memberId)
        {
            // Kiểm tra quyền truy cập
            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            if (role == "Member" && currentUserId != memberId)
            {
                return Forbid("Bạn chỉ có thể xem chứng chỉ của chính mình");
            }

            var certificate = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Member.BloodType)
                .Include(dr => dr.Period)
                .Where(dr => dr.MemberId == memberId && dr.Status == "Completed")
               .Select(dr => new
               {
                   dr.Member.User.CitizenNumber, // Số CMND/CCCD
                   dr.Member.User.FullName, // Họ và tên
                   dr.Member.User.DateOfBirth, // Ngày sinh
                   dr.Member.User.Address,  // Địa chỉ
                   dr.Period.Hospital.Name,  // Địa điểm hiến máu
                   dr.DonationVolume,  // Thể tích máu hiến
                   dr.PreferredDonationDate, // Ngày hiến máu
                   dr.Member.BloodType.BloodTypeName // Nhóm máu
               })
                .OrderByDescending(c => c.PreferredDonationDate)
                .ToListAsync();

            if(!certificate.Any()) // Kiểm tra nếu không có chứng chỉ nào
                return NotFound("Không tìm thấy chứng chỉ hiến máu cho thành viên này");

            return Ok(certificate);
        }
    }
} 