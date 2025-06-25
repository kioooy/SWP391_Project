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

    [HttpGet("search-with-priority/{recipientBloodTypeId}/{requiredVolume}")]
    public async Task<IActionResult> SearchBloodWithPriority(
        int recipientBloodTypeId, 
        int requiredVolume,
        [FromQuery] double? hospitalLatitude = null,
        [FromQuery] double? hospitalLongitude = null)
    {
        try
        {
            var result = await SearchBloodWithPriorityLogic(recipientBloodTypeId, requiredVolume, hospitalLatitude, hospitalLongitude);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
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

            var result = await SearchBloodWithPriorityLogic(recipientBloodTypeId, requiredVolume, hospitalLatitude, hospitalLongitude);
            
            // Thêm thông tin bệnh viện vào response
            var response = new
            {
                HospitalInfo = new
                {
                    HospitalId = hospital.HospitalId,
                    HospitalName = hospital.Name,
                    HospitalAddress = hospital.Address,
                    HospitalLocation = new
                    {
                        Latitude = hospitalLatitude,
                        Longitude = hospitalLongitude
                    }
                },
                SearchResult = result
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("request-donors/{recipientBloodTypeId}/{requiredVolume}")]
    public async Task<IActionResult> RequestDonors(
        int recipientBloodTypeId, 
        int requiredVolume,
        [FromBody] RequestDonorsDTO request)
    {
        try
        {
            var result = await RequestDonorsLogic(recipientBloodTypeId, requiredVolume, request);
            return Ok(result);
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

            var result = await RequestDonorsLogic(recipientBloodTypeId, requiredVolume, new RequestDonorsDTO
            {
                HospitalLatitude = hospitalLatitude,
                HospitalLongitude = hospitalLongitude,
                Message = request.Message
            });

            // Thêm thông tin bệnh viện vào response
            var response = new
            {
                HospitalInfo = new
                {
                    HospitalId = hospital.HospitalId,
                    HospitalName = hospital.Name,
                    HospitalAddress = hospital.Address,
                    HospitalLocation = new
                    {
                        Latitude = hospitalLatitude,
                        Longitude = hospitalLongitude
                    }
                },
                RequestResult = result
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private async Task<object> SearchBloodWithPriorityLogic(
        int recipientBloodTypeId, 
        int requiredVolume, 
        double? hospitalLatitude, 
        double? hospitalLongitude)
    {
        // Lấy thông tin nhóm máu nhận
        var recipientBloodType = await _context.BloodTypes
            .FirstOrDefaultAsync(bt => bt.BloodTypeId == recipientBloodTypeId);
        
        if (recipientBloodType == null)
            throw new Exception("Không tìm thấy nhóm máu");

        // Lấy danh sách nhóm máu tương thích
        var compatibleTypes = await _context.BloodCompatibilityRules
            .Where(r => r.BloodRecieveId == recipientBloodTypeId && r.IsCompatible)
            .Select(r => r.BloodGiveId)
            .ToListAsync();

        var result = new
        {
            RecipientBloodType = recipientBloodType.BloodTypeName,
            RequiredVolume = requiredVolume,
            SearchStrategy = "",
            HasAvailableBlood = false,
            AvailableBloodUnits = new List<object>(),
            RegisteredDonors = new List<object>(),
            NearbyDonors = new List<object>()
        };

        // ƯU TIÊN 1: Tìm máu tương thích trong kho
        var availableBlood = await _context.BloodUnits
            .Where(b => compatibleTypes.Contains(b.BloodTypeId)
                       && b.BloodStatus == "Available" 
                       && b.RemainingVolume >= requiredVolume)
            .Include(b => b.BloodType)
            .Include(b => b.Component)
            .OrderBy(b => b.BloodTypeId == recipientBloodTypeId ? 0 : 1)
            .ThenBy(b => b.AddDate)
            .Take(10)
            .ToListAsync();

        if (availableBlood.Any())
        {
            return new
            {
                result.RecipientBloodType,
                result.RequiredVolume,
                SearchStrategy = "Tìm thấy máu tương thích trong kho",
                HasAvailableBlood = true,
                AvailableBloodUnits = availableBlood.Select(b => new
                {
                    BloodUnitId = b.BloodUnitId,
                    BloodTypeName = b.BloodType.BloodTypeName,
                    ComponentName = b.Component.ComponentName,
                    Volume = b.RemainingVolume,
                    AddDate = b.AddDate,
                    ExpiryDate = b.AddDate.HasValue ? b.AddDate.Value.ToDateTime(TimeOnly.MinValue).AddDays(b.Component.ShelfLifeDays) : b.ExpiryDate.ToDateTime(TimeOnly.MinValue),
                    IsSameType = b.BloodTypeId == recipientBloodTypeId
                }),
                RegisteredDonors = new List<object>(),
                NearbyDonors = new List<object>()
            };
        }

        // ƯU TIÊN 2: Tìm người hiến đã đăng ký
        var registeredDonors = await _context.Members
            .Where(m => compatibleTypes.Contains(m.BloodTypeId.Value)
                       && m.IsDonor == true
                       && m.User.IsActive == true
                       && (m.LastDonationDate == null || 
                           m.LastDonationDate.Value.AddDays(56) <= DateOnly.FromDateTime(DateTime.Now)))
            .Include(m => m.User)
            .Include(m => m.BloodType)
            .OrderBy(m => m.BloodTypeId == recipientBloodTypeId ? 0 : 1)
            .ThenByDescending(m => m.DonationCount)
            .Take(20)
            .ToListAsync();

        if (registeredDonors.Any())
        {
            return new
            {
                result.RecipientBloodType,
                result.RequiredVolume,
                SearchStrategy = "Tìm thấy người hiến đã đăng ký",
                HasAvailableBlood = false,
                AvailableBloodUnits = new List<object>(),
                RegisteredDonors = registeredDonors.Select(d => new
                {
                    UserId = d.UserId,
                    FullName = d.User.FullName,
                    BloodTypeName = d.BloodType.BloodTypeName,
                    PhoneNumber = d.User.PhoneNumber,
                    Email = d.User.Email,
                    LastDonationDate = d.LastDonationDate,
                    DonationCount = d.DonationCount,
                    IsSameType = d.BloodTypeId == recipientBloodTypeId,
                    Distance = (double?)null
                }),
                NearbyDonors = new List<object>()
            };
        }

        // ƯU TIÊN 3: Tìm kiếm theo khoảng cách
        if (hospitalLatitude.HasValue && hospitalLongitude.HasValue)
        {
            var hospitalLocation = new Point(hospitalLongitude.Value, hospitalLatitude.Value) { SRID = 4326 };
            
            var nearbyDonors = await _context.Members
                .Where(m => compatibleTypes.Contains(m.BloodTypeId.Value)
                           && m.IsDonor == true
                           && m.User.IsActive == true
                           && m.Location != null
                           && (m.LastDonationDate == null || 
                               m.LastDonationDate.Value.AddDays(56) <= DateOnly.FromDateTime(DateTime.Now)))
                .Include(m => m.User)
                .Include(m => m.BloodType)
                .ToListAsync();

            var nearbyDonorsWithDistance = nearbyDonors
                .Where(m => m.Location != null)
                .Select(m => new
                {
                    Member = m,
                    Distance = CalculateDistance(m.Location, hospitalLocation)
                })
                .Where(x => x.Distance <= 50) // Trong bán kính 50km
                .OrderBy(x => x.Distance)
                .ThenBy(x => x.Member.BloodTypeId == recipientBloodTypeId ? 0 : 1)
                .Take(10)
                .ToList();

            if (nearbyDonorsWithDistance.Any())
            {
                return new
                {
                    result.RecipientBloodType,
                    result.RequiredVolume,
                    SearchStrategy = "Tìm thấy người hiến gần đây",
                    HasAvailableBlood = false,
                    AvailableBloodUnits = new List<object>(),
                    RegisteredDonors = new List<object>(),
                    NearbyDonors = nearbyDonorsWithDistance.Select(x => new
                    {
                        UserId = x.Member.UserId,
                        FullName = x.Member.User.FullName,
                        BloodTypeName = x.Member.BloodType.BloodTypeName,
                        PhoneNumber = x.Member.User.PhoneNumber,
                        Email = x.Member.User.Email,
                        LastDonationDate = x.Member.LastDonationDate,
                        DonationCount = x.Member.DonationCount,
                        IsSameType = x.Member.BloodTypeId == recipientBloodTypeId,
                        Distance = Math.Round(x.Distance, 2)
                    })
                };
            }
        }

        return new
        {
            result.RecipientBloodType,
            result.RequiredVolume,
            SearchStrategy = "Không tìm thấy máu hoặc người hiến phù hợp",
            HasAvailableBlood = false,
            AvailableBloodUnits = new List<object>(),
            RegisteredDonors = new List<object>(),
            NearbyDonors = new List<object>()
        };
    }

    private async Task<object> RequestDonorsLogic(int recipientBloodTypeId, int requiredVolume, RequestDonorsDTO request)
    {
        var result = await SearchBloodWithPriorityLogic(recipientBloodTypeId, requiredVolume, request.HospitalLatitude, request.HospitalLongitude);
        
        // Nếu không có máu sẵn và có người hiến, gửi thông báo
        if (!(bool)result.GetType().GetProperty("HasAvailableBlood").GetValue(result))
        {
            var donors = new List<object>();
            
            var registeredDonors = result.GetType().GetProperty("RegisteredDonors").GetValue(result) as List<object>;
            var nearbyDonors = result.GetType().GetProperty("NearbyDonors").GetValue(result) as List<object>;
            
            if (registeredDonors?.Any() == true)
                donors.AddRange(registeredDonors);
            if (nearbyDonors?.Any() == true)
                donors.AddRange(nearbyDonors);

            if (donors.Any())
            {
                // Gửi thông báo cho người hiến
                foreach (var donor in donors.Take(10)) // Giới hạn 10 người
                {
                    var userId = (int)donor.GetType().GetProperty("UserId").GetValue(donor);
                    
                    var notification = new Notification
                    {
                        UserId = userId,
                        Title = "Yêu cầu hiến máu khẩn cấp",
                        Message = $"Cần máu nhóm {result.GetType().GetProperty("RecipientBloodType").GetValue(result)} với thể tích {requiredVolume}ml. {request.Message}",
                        NotificationType = "BloodRequest",
                        CreatedAt = DateTime.Now
                    };
                    
                    _context.Notifications.Add(notification);
                }
                
                await _context.SaveChangesAsync();
                
                return new
                {
                    Message = "Đã gửi yêu cầu hiến máu cho các tình nguyện viên",
                    DonorsContacted = donors.Count,
                    SearchResult = result
                };
            }
        }
        
        return new
        {
            Message = "Không tìm thấy người hiến phù hợp",
            DonorsContacted = 0,
            SearchResult = result
        };
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