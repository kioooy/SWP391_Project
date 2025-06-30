using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Data;
using NetTopologySuite.Geometries;

namespace Blood_Donation_Support.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodSearchController : ControllerBase
{
    private readonly BloodDonationSupportContext _context;

    public BloodSearchController(BloodDonationSupportContext context)
    {
        _context = context;
    }

    [HttpGet("search-with-hospital-location/{recipientBloodTypeId}/{requiredVolume}")]
    public async Task<IActionResult> SearchBloodWithHospitalLocation(
        int recipientBloodTypeId, 
        int requiredVolume)
    {
        try
        {
            // Lấy vị trí bệnh viện từ database
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
            {
                return BadRequest(new { error = "Không tìm thấy thông tin vị trí bệnh viện" });
            }

            var hospitalLatitude = hospital.Location.Y;
            var hospitalLongitude = hospital.Location.X;

            // 1. Tìm máu phù hợp trong kho
            var availableBloodUnits = await _context.BloodUnits
                .Where(bu => bu.BloodTypeId == recipientBloodTypeId
                          && bu.BloodStatus == "Available"
                          && bu.RemainingVolume >= requiredVolume
                          && bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Now))
                .Select(bu => new {
                    bu.BloodUnitId,
                    bu.BloodTypeId,
                    bu.ComponentId,
                    bu.RemainingVolume,
                    bu.BloodStatus,
                    bu.ExpiryDate
                })
                .ToListAsync();

            if (availableBloodUnits.Any())
            {
                // Nếu có máu phù hợp, chỉ trả về máu phù hợp
                return Ok(new {
                    availableBloodUnits,
                    suggestedDonors = new object[0]
                });
            }

            // 2. Nếu không có máu phù hợp, tìm người hiến máu phù hợp
            var hospitalPoint = hospital.Location;

            var now = DateTime.Now;
            var restPeriod = TimeSpan.FromDays(84); // 12 tuần
            // Lấy danh sách người hiến máu phù hợp từ DB
            var donorsFromDb = await _context.Members
                .Include(m => m.User)
                .Where(m => m.IsDonor == true && m.BloodTypeId == recipientBloodTypeId
                    && (m.LastDonationDate == null || EF.Functions.DateDiffDay(m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue), now) >= 84))
                .Select(m => new
                {
                    m.UserId,
                    m.User.FullName,
                    m.BloodTypeId,
                    m.Weight,
                    m.Height,
                    m.LastDonationDate,
                    m.IsDonor,
                    m.IsRecipient,
                    m.DonationCount,
                    m.Location
                })
                .ToListAsync();

            // Tính toán khoảng cách và tạo danh sách gợi ý
            var suggestedDonors = donorsFromDb
                .Select(m =>
                {
                    double? distance = null;
                    if (m.Location != null)
                    {
                        double calculatedDistance = m.Location.Distance(hospitalPoint) * 111;
                        if (!double.IsNaN(calculatedDistance) && !double.IsInfinity(calculatedDistance) && calculatedDistance >= 0 && calculatedDistance < 1e6)
                        {
                            distance = calculatedDistance;
                        }
                    }
                    return new
                    {
                        m.UserId,
                        m.FullName,
                        m.BloodTypeId,
                        m.Weight,
                        m.Height,
                        m.LastDonationDate,
                        m.IsDonor,
                        m.IsRecipient,
                        m.DonationCount,
                        DistanceToHospital = distance
                    };
                })
                .Where(d => d.DistanceToHospital == null || (d.DistanceToHospital >= 0 && !double.IsNaN(d.DistanceToHospital.Value) && !double.IsInfinity(d.DistanceToHospital.Value)))
                .OrderBy(d => d.DistanceToHospital)
                .ToList();

            return Ok(new {
                availableBloodUnits = new object[0],
                suggestedDonors
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("request-donors-with-hospital/{recipientBloodTypeId}/{requiredVolume}")]
    public async Task<IActionResult> RequestDonorsWithHospital(
        int recipientBloodTypeId, 
        int requiredVolume,
        [FromBody] RequestDonorsWithHospitalDTO request)
    {
        try
        {
            // Lấy vị trí bệnh viện từ database
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
            {
                return BadRequest(new { error = "Không tìm thấy thông tin vị trí bệnh viện" });
            }

            var hospitalLatitude = hospital.Location.Y;
            var hospitalLongitude = hospital.Location.X;

            // Logic gửi thông báo cho người hiến được chuyển trực tiếp vào đây
            // (Có thể copy/paste logic từ RequestDonorsLogic cũ, nhưng chỉ dùng hospitalLatitude, hospitalLongitude)
            // ...
            return Ok(new { message = "Đã chuyển logic gửi thông báo trực tiếp vào API này. Vui lòng bổ sung logic chi tiết nếu cần." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private double CalculateDistance(Point donorLocation, Point hospitalLocation)
    {
        // Tính khoảng cách giữa 2 điểm (km)
        // Có thể sử dụng Haversine formula hoặc PostGIS ST_Distance
        return donorLocation.Distance(hospitalLocation) * 111; // 1 độ ≈ 111km
    }
}

public class RequestDonorsDTO
{
    public double? HospitalLatitude { get; set; }
    public double? HospitalLongitude { get; set; }
    public string Message { get; set; } = "Vui lòng liên hệ ngay!";
}

public class RequestDonorsWithHospitalDTO
{
    public string Message { get; set; } = "Vui lòng liên hệ ngay!";
} 