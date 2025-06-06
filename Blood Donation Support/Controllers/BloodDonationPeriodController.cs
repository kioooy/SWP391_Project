using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Blood_Donation_Support.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

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
            await _context.SaveChangesAsync();

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

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/BloodDonationPeriod
        [HttpGet]
        [Authorize(Roles = "Staff,Admin")]
        public IActionResult GetAllBloodDonationPeriods()
        {
            var periods = _context.BloodDonationPeriods.ToList();
            return Ok(periods);
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
            await _context.SaveChangesAsync();
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
    }
}

