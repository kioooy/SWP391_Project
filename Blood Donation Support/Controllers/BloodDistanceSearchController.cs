using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Blood_Donation_Support.Data;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BloodDistanceSearchController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        private readonly ILogger<BloodDistanceSearchController> _logger;

        public BloodDistanceSearchController(BloodDonationSupportContext context, ILogger<BloodDistanceSearchController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Tìm kiếm người hiến máu theo khoảng cách (Donor)
        // GET: api/BloodDistanceSearch/donors-nearby
        [HttpGet("donors-nearby")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetNearbyDonors([FromQuery] double radius)
        {
            // Lấy vị trí trung tâm từ bệnh viện
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
                return BadRequest("Không tìm thấy vị trí bệnh viện.");
            var center = hospital.Location;
            _logger.LogInformation("GetNearbyDonors called with hospital center, radius={Radius} meters. Results count: {Count}", radius, 0); 
            var donors = await _context.Members
                .Where(m => m.IsDonor == true && m.Location != null && m.Location.Distance(center) <= radius)
                .Include(m => m.User)
                .Include(m => m.BloodType)
                .ToListAsync();

            // Lọc tiếp trên C# với điều kiện ngày phục hồi
            var filteredDonors = donors
                .Where(m => m.LastDonationDate == null ||
                            (DateTime.Now - m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue)).TotalDays >= 84)
                .Select(m => new {
                    m.UserId,
                    m.User.FullName,
                    Phone = m.User.PhoneNumber,
                    m.User.Email,
                    BloodType = m.BloodType.BloodTypeName,
                    m.User.Address,
                    Latitude = m.Location.Y,
                    Longitude = m.Location.X,
                    Distance = m.Location.Distance(center),
                    m.Weight,
                    m.Height
                })
                .ToList();
            _logger.LogInformation("GetNearbyDonors returned {Count} results", filteredDonors.Count);
            return Ok(filteredDonors);
        }

        // Tìm kiếm người cần máu theo khoảng cách (Recipient)
        // GET: api/BloodDistanceSearch/recipients-nearby
        [HttpGet("recipients-nearby")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetNearbyRecipients([FromQuery] double radius)
        {
            // Lấy vị trí trung tâm từ bệnh viện
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
                return BadRequest("Không tìm thấy vị trí bệnh viện.");
            var center = hospital.Location;
            _logger.LogInformation("GetNearbyRecipients called with hospital center, radius={Radius} meters. Results count: {Count}", radius, 0); 
            var recipients = await _context.Members
                .Where(m => m.IsRecipient == true && m.Location != null && m.Location.Distance(center) <= radius)
                .Include(m => m.User)
                .Include(m => m.BloodType)
                .Select(m => new {
                    m.UserId,
                    m.User.FullName,
                    Phone = m.User.PhoneNumber,
                    m.User.Email,
                    BloodType = m.BloodType.BloodTypeName,
                    m.User.Address,
                    Latitude = m.Location.Y,
                    Longitude = m.Location.X,
                    Distance = m.Location.Distance(center),
                    m.Weight,
                    m.Height
                })
                .ToListAsync();
            _logger.LogInformation("GetNearbyRecipients returned {Count} results", recipients.Count);
            return Ok(recipients);
        }

        // Lấy danh sách bệnh viện với tọa độ.
        // GET: api/BloodDistanceSearch/hospitals
        [HttpGet("hospitals")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetHospitals()
        {
            var list = await _context.Hospitals
                .Where(h => h.Location != null)
                .Select(h => new {
                    h.HospitalId,
                    h.Name,
                    Latitude = h.Location.Y,
                    Longitude = h.Location.X
                })
                .ToListAsync();
            return Ok(list);
        }
    }
}
