using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Data;
using Blood_Donation_Support.Model;
using Blood_Donation_Support.DTO;
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

            // Logic tìm kiếm máu/người hiến được chuyển trực tiếp vào đây
            // (Có thể copy/paste logic từ SearchBloodWithPriorityLogic cũ, nhưng chỉ dùng hospitalLatitude, hospitalLongitude)
            // ...
            return Ok(new { message = "Đã chuyển logic tìm kiếm trực tiếp vào API này. Vui lòng bổ sung logic chi tiết nếu cần." });
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