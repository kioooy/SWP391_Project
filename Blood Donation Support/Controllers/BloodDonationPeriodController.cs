using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Blood_Donation_Support.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BloodDonationPeriodController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public BloodDonationPeriodController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // POST: api/BloodDonationPeriod
        [HttpPost]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> CreateBloodDonationPeriod([FromBody] CreateBloodDonationPeriodDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var period = new BloodDonationPeriod
            {
                PeriodName = dto.PeriodName,
                HospitalId = 1, // Default to 1 ( Primary Hospital ID 1 )
                Status = dto.Status,
                PeriodDateFrom = dto.PeriodDateFrom,
                PeriodDateTo = dto.PeriodDateTo,
                TargetQuantity = dto.TargetQuantity,
                CurrentQuantity = 0,
                ImageUrl = dto.ImageUrl
            };

            await _context.BloodDonationPeriods.AddAsync(period);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBloodDonationPeriodById), new { id = period.PeriodId }, period);
        }

        // GET: api/BloodDonationPeriod/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetBloodDonationPeriodById(int id)
        {
            // Include Hospital để tránh lỗi null
            var period = await _context.BloodDonationPeriods
                .Include(p => p.Hospital)
                .FirstOrDefaultAsync(p => p.PeriodId == id);
            if (period == null)
                return NotFound();
            return Ok(new {
                period.PeriodId,
                period.PeriodName,
                period.HospitalId,
                HospitalName = period.Hospital != null ? period.Hospital.Name : null,
                period.Status,
                period.PeriodDateFrom,
                period.PeriodDateTo,
                period.CurrentQuantity,
                period.TargetQuantity,
                period.ImageUrl,
            });
        }

        // GET: api/BloodDonationPeriod
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAllBloodDonationPeriods()
        {
            // Tự động cập nhật các đợt đã hết hạn
            var expiredPeriods = _context.BloodDonationPeriods
                .Where(p => p.Status == "Active" && p.PeriodDateTo < DateTime.Now)
                .ToList();
            foreach (var period in expiredPeriods)
            {
                period.Status = "Completed";
                period.IsActive = false;
            }
            if (expiredPeriods.Any())
                _context.SaveChanges();

            // Trả về các đợt đang hoạt động hoặc sắp diễn ra
            var availablePeriods = _context.BloodDonationPeriods
                .Where(p => p.Status == "Active" && p.IsActive && p.PeriodDateTo >= DateTime.Now.Date)
                .OrderBy(p => p.PeriodDateFrom)
                .ToList();
            return Ok(availablePeriods);
        }

        // PATCH: api/BloodDonationPeriod/{id}/status
        [HttpPatch("{id}/status/admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBloodDonationPeriodStatus(int id, [FromBody] string status)
        {
            var validStatuses = new[] { "Active", "Completed", "Cancelled" };
            if (!validStatuses.Contains(status))
                return BadRequest("Trạng Thái Không Hợp Lệ.");

            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
                return NotFound();

            period.Status = status;
            _context.SaveChanges();
            return NoContent();
        }
        // PATCH: api/BloodDonationPeriod/{id}/isActive/admin
        [HttpPatch("{id}/isActive/admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBloodDonationPeriodIsActive(int id, [FromBody] bool isActive)
        {
            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
                return NotFound();

            period.IsActive = isActive;
            _context.SaveChanges();
            return NoContent();
        }

        // GET: api/BloodDonationPeriod/progress/{id}
        [HttpGet("progress/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDonationPeriodProgress(int id)
        {
            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
            {
                return NotFound(new { message = "Không Tìm Thấy Lịch Đợt Hiến" });
            }
            var progress = new BloodDonationPeriodProgressDTO
            {
                PeriodId = period.PeriodId,
                PeriodName = period.PeriodName,
                HospitalName = period.Hospital.Name,
                TargetQuantity = period.TargetQuantity,
                CurrentQuantity = period.CurrentQuantity ?? 0,
                ProgressPercent = period.TargetQuantity > 0 ? (int)(period.CurrentQuantity ?? 0) * 100 / period.TargetQuantity : 0,
                Status = period.Status,
                PeriodDateFrom = period.PeriodDateFrom,
                PeriodDateTo = period.PeriodDateTo
            };
            return Ok(progress);
        }

        // GET: api/BloodDonationPeriod/all/admin,staff
        [HttpGet("all/admin,staff")]
        [Authorize(Roles = "Staff,Admin")]
        public IActionResult GetAllPeriodsForStaff()
        {
            var allPeriods = _context.BloodDonationPeriods.ToList();
            return Ok(allPeriods);
        }

        // PATCH: api/BloodDonationPeriod/{id}/details/admin,staff
        [HttpPatch("{id}/details/admin,staff")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> StaffUpdateBloodDonationPeriod(int id, [FromBody] StaffUpdateBloodDonationPeriodDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
                return NotFound();

            // Chỉ được phép chỉnh PeriodDateFrom khi sự kiện chưa bắt đầu
            if (DateTime.Now >= period.PeriodDateFrom && dto.PeriodDateFrom != period.PeriodDateFrom)
            {
                return BadRequest("Không thể thay đổi ngày bắt đầu khi đợt hiến máu đã diễn ra hoặc đang diễn ra.");
            }

            period.PeriodName = dto.PeriodName;
            period.PeriodDateFrom = dto.PeriodDateFrom;
            period.PeriodDateTo = dto.PeriodDateTo;
            period.TargetQuantity = dto.TargetQuantity;
            period.ImageUrl = dto.ImageUrl;

            _context.SaveChanges();
            return NoContent();
        }

        // Tín Coding

        // Check Completed Period
        [HttpGet("check-completed")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CheckCompletedPeriods()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var completedPeriods = await _context.BloodDonationPeriods
                .Where(p => p.PeriodDateTo < DateTime.Now && p.Status == "Active" )
                .ToListAsync();

            foreach (var period in completedPeriods)
            {
                period.Status = "Completed";
            }

            if (completedPeriods.Any())
                _context.SaveChanges();

            return NoContent();
        }
    }
}

