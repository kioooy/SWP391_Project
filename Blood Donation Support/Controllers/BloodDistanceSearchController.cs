using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Model;
using NetTopologySuite.Geometries;
using Blood_Donation_Support.Data;
using Microsoft.Extensions.Logging;

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

        /// <summary>
        /// Tìm kiếm người hiến máu theo khoảng cách (Donor)
        /// </summary>
        /// <param name="latitude">Vĩ độ (lat)</param>
        /// <param name="longitude">Kinh độ (lng)</param>
        /// <param name="radius">Bán kính (mét)</param>
        /// <returns>Danh sách member là donor trong bán kính</returns>
        [HttpGet("donors-nearby")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetNearbyDonors([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radius)
        {
            _logger.LogInformation("GetNearbyDonors called with latitude={Latitude}, longitude={Longitude}, radius={Radius} meters. Results count: {Count}", latitude, longitude, radius, 0); 
            var center = new Point(longitude, latitude) { SRID = 4326 };
            var donors = await _context.Members
                .Where(m => m.IsDonor == true && m.Location != null && m.Location.Distance(center) <= radius)
                .Include(m => m.User)
                .Include(m => m.BloodType)
                .Select(m => new {
                    m.UserId,
                    FullName = m.User.FullName,
                    Phone = m.User.PhoneNumber,
                    Email = m.User.Email,
                    BloodType = m.BloodType.BloodTypeName,
                    Address = m.User.Address,
                    Latitude = m.Location.Y,
                    Longitude = m.Location.X,
                    Distance = m.Location.Distance(center),
                    m.Weight,
                    m.Height
                })
                .ToListAsync();
            _logger.LogInformation("GetNearbyDonors returned {Count} results", donors.Count);
            return Ok(donors);
        }

        /// <summary>
        /// Tìm kiếm người cần máu theo khoảng cách (Recipient)
        /// </summary>
        /// <param name="latitude">Vĩ độ (lat)</param>
        /// <param name="longitude">Kinh độ (lng)</param>
        /// <param name="radius">Bán kính (mét)</param>
        /// <returns>Danh sách member là recipient trong bán kính</returns>
        [HttpGet("recipients-nearby")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetNearbyRecipients([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radius)
        {
            _logger.LogInformation("GetNearbyRecipients called with latitude={Latitude}, longitude={Longitude}, radius={Radius} meters. Results count: {Count}", latitude, longitude, radius, 0); 
            var center = new Point(longitude, latitude) { SRID = 4326 };
            var recipients = await _context.Members
                .Where(m => m.IsRecipient == true && m.Location != null && m.Location.Distance(center) <= radius)
                .Include(m => m.User)
                .Include(m => m.BloodType)
                .Select(m => new {
                    m.UserId,
                    FullName = m.User.FullName,
                    Phone = m.User.PhoneNumber,
                    Email = m.User.Email,
                    BloodType = m.BloodType.BloodTypeName,
                    Address = m.User.Address,
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

        /// <summary>
        /// Lấy danh sách bệnh viện với tọa độ.
        /// </summary>
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
