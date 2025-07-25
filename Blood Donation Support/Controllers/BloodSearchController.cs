using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq;
using Blood_Donation_Support.Data;
using Blood_Donation_Support.Model;

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

    private async Task<List<object>> FindAndRankDonors(int recipientBloodTypeId, int? componentId = null)
    {
        var now = DateTime.Now;
        var donationRestPeriod = TimeSpan.FromDays(84); // 12 tuần
        var transfusionRestPeriod = TimeSpan.FromDays(365); // 12 tháng
        
        var compatibleBloodTypeIdsQuery = _context.BloodCompatibilityRules
            .Where(r => r.BloodRecieveId == recipientBloodTypeId && r.IsCompatible);

        if (componentId.HasValue)
        {
            compatibleBloodTypeIdsQuery = compatibleBloodTypeIdsQuery.Where(r => r.ComponentId == componentId);
        }
        // Khi componentId = null, lấy tất cả quy tắc tương thích (không filter theo ComponentId)

        var compatibleBloodTypeIds = await compatibleBloodTypeIdsQuery
            .Select(r => r.BloodGiveId)
            .Distinct() // Thêm Distinct để tránh trùng lặp khi có nhiều ComponentId cho cùng BloodGiveId
            .ToListAsync();
        Console.WriteLine($"[DEBUG] compatibleBloodTypeIds: {string.Join(",", compatibleBloodTypeIds)}");

        // Lấy tất cả members trước, sau đó filter trên memory để tránh lỗi LINQ translation
        var allMembers = await _context.Members
            .Include(m => m.User)
            .Include(m => m.BloodType)
            .Where(m => m.IsDonor == true 
                        && m.BloodTypeId.HasValue
                        && compatibleBloodTypeIds.Contains(m.BloodTypeId.Value))
            .Select(m => new
            {
                m.UserId,
                m.User.FullName,
                m.BloodTypeId,
                BloodTypeName = m.BloodType.BloodTypeName,
                m.Weight,
                m.Height,
                m.LastDonationDate,
                m.IsDonor,
                m.IsRecipient,
                m.DonationCount,
                m.Location,
                PhoneNumber = m.User.PhoneNumber
            })
            .ToListAsync();
        Console.WriteLine($"[DEBUG] allMembers.Count = {allMembers.Count}");
        foreach (var m in allMembers)
        {
            Console.WriteLine($"[DEBUG] allMember: UserId={m.UserId}, BloodTypeId={m.BloodTypeId}, IsDonor={m.IsDonor}, LastDonationDate={m.LastDonationDate}");
        }

        // Lấy transfusion requests để check
        var completedTransfusions = await _context.TransfusionRequests
            .Where(tr => tr.Status == "Completed" && tr.CompletionDate.HasValue)
            .Select(tr => new { tr.MemberId, tr.CompletionDate })
            .ToListAsync();
        Console.WriteLine($"[DEBUG] completedTransfusions.Count = {completedTransfusions.Count}");

        // Filter trên memory - sử dụng DateTime comparison thay vì EF.Functions
        var donorsFromDb = allMembers.Where(m => 
            (m.LastDonationDate == null || 
             (now - m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue)).TotalDays >= 84) &&
            !completedTransfusions.Any(tr => 
                tr.MemberId == m.UserId && 
                tr.CompletionDate.HasValue && 
                (now - tr.CompletionDate.Value).TotalDays < 365)
        ).ToList();
        Console.WriteLine($"[DEBUG] donorsFromDb.Count = {donorsFromDb.Count}");
        foreach (var d in donorsFromDb)
        {
            Console.WriteLine($"[DEBUG] donor: UserId={d.UserId}, LastDonationDate={d.LastDonationDate}");
        }

        var suggestedDonors = donorsFromDb
            .Select(m =>
            {
                return new
                {
                    m.UserId,
                    m.FullName,
                    m.BloodTypeId,
                    m.BloodTypeName,
                    m.Weight,
                    m.Height,
                    m.LastDonationDate,
                    m.IsDonor,
                    m.IsRecipient,
                    m.DonationCount,
                    m.PhoneNumber
                };
            })
            .ToList<object>();
        Console.WriteLine($"[DEBUG] suggestedDonors.Count = {suggestedDonors.Count}");

        return suggestedDonors;
    }

    // API duy nhất: Tìm máu trong kho, nếu không có thì trả về luôn suggestedDonors
    [HttpGet("search-blood-units/{recipientBloodTypeId}/{requiredVolume}")]
    public async Task<IActionResult> SearchBloodUnits(
        int recipientBloodTypeId, 
        int requiredVolume,
        [FromQuery] int? componentId = null)
    {
        try
        {
            int? targetComponentId = componentId;

            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital?.Location == null)
            {
                return BadRequest(new { error = "Không tìm thấy thông tin vị trí bệnh viện" });
            }
            
            var availableBloodUnits = await _context.BloodUnits
                .Include(bu => bu.BloodType)
                .Include(bu => bu.Component)
                .Where(bu => bu.BloodTypeId == recipientBloodTypeId
                          && bu.BloodStatus == "Available"
                          && bu.RemainingVolume >= requiredVolume
                          && bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Now)
                          && (targetComponentId == null || bu.ComponentId == targetComponentId))
                .Select(bu => new {
                    bu.BloodUnitId,
                    bu.BloodTypeId,
                    bu.ComponentId,
                    BloodTypeName = bu.BloodType.BloodTypeName,
                    ComponentName = bu.Component.ComponentName,
                    bu.RemainingVolume,
                    bu.BloodStatus,
                    bu.ExpiryDate
                })
                .ToListAsync();
            Console.WriteLine($"[DEBUG] availableBloodUnits.Count = {availableBloodUnits.Count}");

            List<object> suggestedDonors = new List<object>();
            if (!availableBloodUnits.Any())
            {
                Console.WriteLine($"[DEBUG] Không có máu phù hợp, gọi FindAndRankDonors");
                suggestedDonors = await FindAndRankDonors(recipientBloodTypeId, null);
            }

            return Ok(new {
                availableBloodUnits,
                suggestedDonors
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // Chỉ cho phép Admin hoặc Staff thực hiện API này
    [Authorize(Roles = "Admin,Staff")]
//POST /api/BloodSearch/notify-all-donors
    [HttpPost("notify-all-donors")]
    // Nhận dữ liệu từ body request dưới dạng NotifyAllDonorsDTO
    public async Task<IActionResult> NotifyAllDonors([FromBody] NotifyAllDonorsDTO request)
    {
        try
        {
            var now = DateTime.Now;
            var allDonors = await _context.Members
                .Include(m => m.User)
                .Where(m => m.IsDonor == true)
                .Select(m => new { m.UserId, m.User.FullName, m.User.PhoneNumber, m.User.Email, m.LastDonationDate, m.Weight, m.Height, m.BloodTypeId, m.BloodType.BloodTypeName })
                .ToListAsync();

            var donors = allDonors.Where(m =>
                m.LastDonationDate == null ||
                (now - m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue)).TotalDays >= 84
            ).ToList();

            int notifiedCount = 0;
            var notifiedDonors = new List<object>();
            foreach (var donor in donors)
            {
                try
                {
                    var notification = new Notification
                    {
                        UserId = donor.UserId,
                        Title = "Thông báo từ bệnh viện",
                        Message = request.Message,
                        CreatedAt = DateTime.Now,
                        NotificationType = "General",
                        IsActive = true,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                    notifiedCount++;
                    notifiedDonors.Add(new {
                        donor.UserId,
                        donor.FullName,
                        donor.PhoneNumber,
                        donor.Email,
                        donor.Weight,
                        donor.Height,
                        donor.BloodTypeId,
                        donor.BloodTypeName
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error creating notification: {ex.Message}");
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new {
                message = $"Đã gửi thông báo đến {notifiedCount} người hiến máu đã hồi phục.",
                notifiedDonors
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class RequestDonorsDTO
{
    public double? HospitalLatitude { get; set; }
    public double? HospitalLongitude { get; set; }
    public string Message { get; set; } = "Vui lòng liên hệ ngay!";
}

public class NotifyAllDonorsDTO
{
    public string Message { get; set; } = "Vui lòng liên hệ ngay!";
} 