using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Model;
using NetTopologySuite.Geometries;
using Blood_Donation_Support.Data;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BloodDistanceSearchController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        public BloodDistanceSearchController(BloodDonationSupportContext context)
        {
            _context = context;
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
            var center = new Point(longitude, latitude) { SRID = 4326 };
            var donors = await _context.Members
                .Where(m => m.IsDonor == true && m.Location != null && m.Location.Distance(center) <= radius)
                .Select(m => new {
                    m.UserId,
                    m.Address,
                    m.Location,
                    m.BloodTypeId,
                    m.Weight,
                    m.Height
                })
                .ToListAsync();
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
            var center = new Point(longitude, latitude) { SRID = 4326 };
            var recipients = await _context.Members
                .Where(m => m.IsRecipient == true && m.Location != null && m.Location.Distance(center) <= radius)
                .Select(m => new {
                    m.UserId,
                    m.Address,
                    m.Location,
                    m.BloodTypeId,
                    m.Weight,
                    m.Height
                })
                .ToListAsync();
            return Ok(recipients);
        }
    }
}
