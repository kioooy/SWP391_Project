using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Blood_Donation_Support.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using System;

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
                Location = dto.Location,
                Status = dto.Status,
                PeriodDateFrom = dto.PeriodDateFrom,
                PeriodDateTo = dto.PeriodDateTo,
                TargetQuantity = dto.TargetQuantity,
                CurrentQuantity = 0,
                ImageUrl = dto.ImageUrl
            };

            _context.BloodDonationPeriods.Add(period);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetBloodDonationPeriodById), new { id = period.PeriodId }, period);
        }

        // GET: api/BloodDonationPeriod/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetBloodDonationPeriodById(int id)
        {
            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
                return NotFound();
            return Ok(period);
        }
        // PUT: api/BloodDonationPeriod/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> UpdateBloodDonationPeriod(int id, [FromBody] UpdateBloodDonationPeriodDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
                return NotFound();

            period.PeriodName = dto.PeriodName;
            period.Location = dto.Location;
            period.Status = dto.Status;
            period.PeriodDateFrom = dto.PeriodDateFrom;
            period.PeriodDateTo = dto.PeriodDateTo;
            period.TargetQuantity = dto.TargetQuantity;
            period.ImageUrl = dto.ImageUrl;

            _context.SaveChanges();
            return NoContent();
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
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> UpdateBloodDonationPeriodStatus(int id, [FromBody] string status)
        {
            var validStatuses = new[] { "Active", "Completed", "Cancelled" };
            if (!validStatuses.Contains(status))
                return BadRequest("Invalid status value.");

            var period = await _context.BloodDonationPeriods.FindAsync(id);
            if (period == null)
                return NotFound();

            period.Status = status;
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
                return NotFound(new { message = "Donation period not found" });
            }
            var progress = new BloodDonationPeriodProgressDto
            {
                PeriodId = period.PeriodId,
                PeriodName = period.PeriodName,
                TargetQuantity = period.TargetQuantity,
                CurrentQuantity = period.CurrentQuantity ?? 0,
                ProgressPercent = period.TargetQuantity > 0 ? (int)(period.CurrentQuantity ?? 0) * 100 / period.TargetQuantity : 0,
                Status = period.Status,
                PeriodDateFrom = period.PeriodDateFrom,
                PeriodDateTo = period.PeriodDateTo
            };
            return Ok(progress);
        }

        // GET: api/BloodDonationPeriod/all
        [HttpGet("all")]
        [Authorize(Roles = "Staff,Admin")]
        public IActionResult GetAllPeriodsForStaff()
        {
            var allPeriods = _context.BloodDonationPeriods.ToList();
            return Ok(allPeriods);
        }
    }
}

