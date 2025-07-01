using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Data;
using NetTopologySuite.Geometries;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace Blood_Donation_Support.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodSearchController : ControllerBase
{
    private readonly BloodDonationSupportContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public BloodSearchController(BloodDonationSupportContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    private async Task<List<object>> FindAndRankDonors(int recipientBloodTypeId, Point hospitalPoint)
    {
        var now = DateTime.Now;
        var donationRestPeriod = TimeSpan.FromDays(84); // 12 tuần
        var transfusionRestPeriod = TimeSpan.FromDays(365); // 12 tháng
        
        var compatibleBloodTypeIds = await _context.BloodCompatibilityRules
            .Where(r => r.BloodRecieveId == recipientBloodTypeId && r.IsCompatible)
            .Select(r => r.BloodGiveId)
            .ToListAsync();

        var donorsFromDb = await _context.Members
            .Include(m => m.User)
            .Where(m => m.IsDonor == true 
                        && m.BloodTypeId.HasValue
                        && compatibleBloodTypeIds.Contains(m.BloodTypeId.Value)
                        && (m.LastDonationDate == null || EF.Functions.DateDiffDay(m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue), now) >= 84)
                        && !_context.TransfusionRequests.Any(tr => tr.MemberId == m.UserId && tr.Status == "Completed" && tr.CompletionDate.HasValue && EF.Functions.DateDiffDay(tr.CompletionDate.Value, now) < 365))
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

        var suggestedDonors = donorsFromDb
            .Select(m =>
            {
                double? distance = null;
                if (m.Location != null && hospitalPoint != null)
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
            .ToList<object>();

        return suggestedDonors;
    }

    [HttpGet("search-with-hospital-location/{recipientBloodTypeId}/{requiredVolume}")]
    public async Task<IActionResult> SearchBloodWithHospitalLocation(
        int recipientBloodTypeId, 
        int requiredVolume)
    {
        try
        {
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
            {
                return BadRequest(new { error = "Không tìm thấy thông tin vị trí bệnh viện" });
            }
            
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
                return Ok(new {
                    availableBloodUnits,
                    suggestedDonors = new object[0]
                });
            }
            
            var suggestedDonors = await FindAndRankDonors(recipientBloodTypeId, hospital.Location);

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
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
            {
                return BadRequest(new { error = "Không tìm thấy thông tin vị trí bệnh viện" });
            }

            var donors = await FindAndRankDonors(recipientBloodTypeId, hospital.Location);

            var client = _httpClientFactory.CreateClient();
            var notificationUrl = $"{Request.Scheme}://{Request.Host}/api/Notification/CreateUrgentDonationRequest";
            
            int notifiedCount = 0;
            foreach (var donor in donors)
            {
                try
                {
                    // Dùng reflection để lấy UserId vì kiểu dữ liệu của donor là object
                    var userId = (int)donor.GetType().GetProperty("UserId").GetValue(donor, null);

                    var notificationDto = new
                    {
                        UserId = userId,
                        Message = request.Message
                    };
                    
                    var jsonContent = new StringContent(JsonSerializer.Serialize(notificationDto), Encoding.UTF8, "application/json");
                    
                    var response = await client.PostAsync(notificationUrl, jsonContent);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        notifiedCount++;
                    }
                }
                catch (Exception ex)
                {
                    // Ghi lại log lỗi gửi thông báo cho 1 người dùng cụ thể mà không làm gián đoạn toàn bộ quá trình
                    Console.WriteLine($"Error notifying donor: {ex.Message}");
                }
            }

            return Ok(new { message = $"Đã gửi thông báo đến {notifiedCount} người hiến máu phù hợp." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // Chỉ cho phép Admin hoặc Staff thực hiện API này
    [Authorize(Roles = "Admin,Staff")]
    // Định nghĩa endpoint POST /api/BloodSearch/notify-all-donors
    [HttpPost("notify-all-donors")]
    // Nhận dữ liệu từ body request dưới dạng NotifyAllDonorsDTO
    public async Task<IActionResult> NotifyAllDonors([FromBody] NotifyAllDonorsDTO request)
    {
        try
        {
            var now = DateTime.Now;
            // Lấy tất cả member là người hiến máu (IsDonor == true) và đã hồi phục (chưa từng hiến hoặc đã đủ 84 ngày kể từ lần hiến máu gần nhất)
            var donors = await _context.Members
                .Where(m => m.IsDonor == true && (m.LastDonationDate == null || EF.Functions.DateDiffDay(m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue), now) >= 84)) //trả về số chênh lệnh 2 ngày   EF.Functions.DateDiffDay(<ngày bắt đầu>, <ngày kết thúc>) > 84 ngày thì trả về true
                .Select(m => new { m.UserId, m.User.FullName }) // Chỉ lấy UserId và FullName
                .ToListAsync();

            // Tạo một HttpClient để gửi HTTP request đi nơi khác (ở đây là nội bộ)
            var client = _httpClientFactory.CreateClient();
            // Tạo URL nội bộ để gọi API gửi thông báo khẩn cấp, đây là vc tái sử dụng API gửi thông báo khẩn cấp bên nofi controller
            var notificationUrl = $"{Request.Scheme}://{Request.Host}/api/Notification/CreateUrgentDonationRequest";
            // Biến đếm số lượng gửi thông báo thành công
            int notifiedCount = 0;
            // Lặp qua từng người hiến máu hợp lệ
            foreach (var donor in donors)
            {
                try
                {
                    // Tạo object chứa thông tin gửi thông báo cho từng người
                    var notificationDto = new
                    {
                        UserId = donor.UserId, // ID người nhận thông báo
                        Message = request.Message // Nội dung thông báo do client gửi lên
                    };
                    // Chuyển object trên thành JSON, đóng gói vào StringContent để gửi HTTP POST
                    var jsonContent = new StringContent(System.Text.Json.JsonSerializer.Serialize(notificationDto), System.Text.Encoding.UTF8, "application/json");
                    // Gửi POST request đến API Notification
                    var response = await client.PostAsync(notificationUrl, jsonContent);
                    // Nếu gửi thành công thì tăng biến đếm
                    if (response.IsSuccessStatusCode)
                    {
                        notifiedCount++;
                    }
                }
                catch (Exception ex)
                {
                    // Nếu lỗi khi gửi cho một người, ghi log lỗi nhưng không dừng vòng lặp
                    Console.WriteLine($"Error notifying donor: {ex.Message}");
                }
            }
            // Trả về kết quả tổng số người đã gửi thông báo thành công
            return Ok(new { message = $"Đã gửi thông báo đến {notifiedCount} người hiến máu đã hồi phục." });
        }
        catch (Exception ex)
        {
            // Nếu có lỗi tổng thể, trả về lỗi cho client
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

public class NotifyAllDonorsDTO
{
    public string Message { get; set; } = "Vui lòng liên hệ ngay!";
} 