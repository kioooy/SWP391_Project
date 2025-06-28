using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
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
                    Cccd = dr.Member.User.CitizenNumber,
                    Name = dr.Member.User.FullName,
                    DateOfBirth = dr.Member.User.DateOfBirth.HasValue ? dr.Member.User.DateOfBirth.Value.ToString("dd/MM/yyyy") : "",
                    Address = dr.Member.User.Address,
                    DonationCenter = dr.Period.Location,
                    BloodAmount = dr.DonationVolume.HasValue ? dr.DonationVolume.Value + "ml" : "",
                    DonationDate = dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToString("dd/MM/yyyy") : "",
                    BloodType = dr.Member.BloodType.BloodTypeName
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
                    Cccd = dr.Member.User.CitizenNumber,
                    Name = dr.Member.User.FullName,
                    DateOfBirth = dr.Member.User.DateOfBirth.HasValue ? dr.Member.User.DateOfBirth.Value.ToString("dd/MM/yyyy") : "",
                    Address = dr.Member.User.Address,
                    DonationCenter = dr.Period.Location,
                    BloodAmount = dr.DonationVolume.HasValue ? dr.DonationVolume.Value + "ml" : "",
                    DonationDate = dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToString("dd/MM/yyyy") : "",
                    BloodType = dr.Member.BloodType.BloodTypeName
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

            var certificatesRaw = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Member.BloodType)
                .Include(dr => dr.Period)
                .Where(dr => dr.MemberId == memberId && dr.Status == "Completed")
                .ToListAsync();

            var certificates = certificatesRaw
                .Select(dr => new
                {
                    Cccd = dr.Member.User.CitizenNumber,
                    Name = dr.Member.User.FullName,
                    DateOfBirth = dr.Member.User.DateOfBirth.HasValue ? dr.Member.User.DateOfBirth.Value.ToString("dd/MM/yyyy") : "",
                    Address = dr.Member.User.Address,
                    DonationCenter = dr.Period.Location,
                    BloodAmount = dr.DonationVolume.HasValue ? dr.DonationVolume.Value + "ml" : "",
                    DonationDate = dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToString("dd/MM/yyyy") : "",
                    BloodType = dr.Member.BloodType.BloodTypeName
                })
                .OrderByDescending(c => c.DonationDate)
                .ToList();

            return Ok(certificates);
        }

        // GET: api/Certificate/search
        //[HttpGet("search")]
        //[Authorize(Roles = "Staff,Admin")]
        //public async Task<IActionResult> SearchCertificates([FromQuery] string? name, [FromQuery] string? cccd, [FromQuery] string? bloodType)
        //{
        //    var query = _context.DonationRequests
        //        .Include(dr => dr.Member)
        //            .ThenInclude(m => m.User)
        //        .Include(dr => dr.Member.BloodType)
        //        .Include(dr => dr.Period)
        //        .Where(dr => dr.Status == "Completed");
        //
        //    if (!string.IsNullOrEmpty(name))
        //    {
        //        query = query.Where(dr => dr.Member.User.FullName.Contains(name));
        //    }
        //
        //    if (!string.IsNullOrEmpty(cccd))
        //    {
        //        query = query.Where(dr => dr.Member.User.CitizenNumber.Contains(cccd));
        //    }
        //
        //    if (!string.IsNullOrEmpty(bloodType))
        //    {
        //        query = query.Where(dr => dr.Member.BloodType.BloodTypeName == bloodType);
        //    }
        //
        //    var certificates = await query
        //        .Select(dr => new
        //        {
        //            Cccd = dr.Member.User.CitizenNumber,
        //            Name = dr.Member.User.FullName,
        //            DateOfBirth = dr.Member.User.DateOfBirth.HasValue ? dr.Member.User.DateOfBirth.Value.ToString("dd/MM/yyyy") : "",
        //            Address = dr.Member.User.Address,
        //            DonationCenter = dr.Period.Location,
        //            BloodAmount = dr.DonationVolume.HasValue ? dr.DonationVolume.Value + "ml" : "",
        //            DonationDate = dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToString("dd/MM/yyyy") : "",
        //            BloodType = dr.Member.BloodType.BloodTypeName
        //        })
        //        .OrderByDescending(c => c.DonationDate)
        //        .ToListAsync();
        //
        //    return Ok(certificates);
        //}

        // GET: api/Certificate/statistics
        //[HttpGet("statistics")]
        //[Authorize(Roles = "Staff,Admin")]
        //public async Task<IActionResult> GetCertificateStatistics()
        //{
        //    var totalCertificates = await _context.DonationRequests
        //        .Where(dr => dr.Status == "Completed")
        //        .CountAsync();
        //
        //    var certificatesByBloodType = await _context.DonationRequests
        //        .Include(dr => dr.Member.BloodType)
        //        .Where(dr => dr.Status == "Completed")
        //        .GroupBy(dr => dr.Member.BloodType.BloodTypeName)
        //        .Select(g => new
        //        {
        //            BloodType = g.Key,
        //            Count = g.Count(),
        //            TotalVolume = g.Sum(dr => dr.DonationVolume)
        //        })
        //        .ToListAsync();
        //
        //    var certificatesByMonth = await _context.DonationRequests
        //        .Where(dr => dr.Status == "Completed" && dr.ApprovalDate.HasValue)
        //        .GroupBy(dr => new { Year = dr.ApprovalDate.Value.Year, Month = dr.ApprovalDate.Value.Month })
        //        .Select(g => new
        //        {
        //            Year = g.Key.Year,
        //            Month = g.Key.Month,
        //            Count = g.Count(),
        //            TotalVolume = g.Sum(dr => dr.DonationVolume)
        //        })
        //        .OrderByDescending(x => x.Year)
        //        .ThenByDescending(x => x.Month)
        //        .Take(12)
        //        .ToListAsync();
        //
        //    var statistics = new
        //    {
        //        TotalCertificates = totalCertificates,
        //        CertificatesByBloodType = certificatesByBloodType,
        //        CertificatesByMonth = certificatesByMonth
        //    };
        //
        //    return Ok(statistics);
        //}
    }
} 