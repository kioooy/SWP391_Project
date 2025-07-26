using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Blood_Donation_Support.Data;
// thử viện nettopologysuite:
//tính khoảng cách giữa 2 điểm trên mặt phẳng
// dạng dữ liệu sẽ là Point(x,y)
//x là kinh độ, y là vĩ  độ
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
            // lấy tất cả donor có địa chỉ và vị trí
            var donors = await _context.Members
                .Where(m => m.IsDonor == true && m.Location != null)
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
                    //hàm distance, tính khoảng cách 2 điểm, đầu vào là 2 điểm có dạng Point(x,y)
                    // ở đây t có ví dụ , center là điểm trung tâm, m.Location là điểm của donor
                    // m.Location.                  Distance(center)
                    //      ^ là point của donor               ^ là point của trung tâm hospital
                    // Tính khoảng cách địa lý (mét) giữa 2 điểm GPS
                    //delta lat = lat2 - lat1
                    //delta lon = lon2 - lon1
                    // NetTopologySuite sử dụng Haversine Formula: d = 2*R*arcsin(√(sin²(Δφ/2) + cos(φ1)*cos(φ2)*sin²(Δλ/2)))
                    // R (bán kính Trái Đất), φ = latitude (vĩ độ), λ = longitude (kinh độ)
                    // Kết quả trả về đơn vị MÉT, chính xác cho ứng dụng thực tế
                    //==============================================================
                    //Input: GPS coordinates (degrees)
                    //Convert: Degrees → Radians  
                    //Apply: Haversine Formula → Angle (radians)
                    //Multiply: Angle × R(6,371,000 mét) → Distance (mét)
                    m.Weight,
                    m.Height,
                    m.LastDonationDate
                })
                .Where(x => x.Distance <= radius) //lọc theo bán kính
                .ToListAsync();

            // Lọc tiếp trên C# với điều kiện ngày phục hồi
            var filteredDonors = donors
                .Where(m => (m.LastDonationDate == null ||
                            (DateTime.Now - m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue)).TotalDays >= 84)
                        // Loại trừ member vừa truyền máu xong (trong vòng 365 ngày)
                        && !_context.TransfusionRequests.Any(tr => tr.MemberId == m.UserId && tr.Status == "Completed" && tr.CompletionDate.HasValue && tr.CompletionDate.Value > DateTime.Now.AddDays(-365))
                )
                .Select(m => new {
                    m.UserId,
                    m.FullName,
                    m.Phone,
                    m.Email,
                    m.BloodType,
                    m.Address,
                    m.Latitude,
                    m.Longitude,
                    m.Distance,
                    m.Weight,
                    m.Height
                })
                .ToList();
            _logger.LogInformation("GetNearbyDonors returned {Count} results", filteredDonors.Count);
            return Ok(filteredDonors); // API trả về danh sách người hiến máu đã lọc (JSON array)
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
