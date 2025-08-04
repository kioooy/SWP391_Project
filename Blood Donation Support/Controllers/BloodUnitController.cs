// ===== IMPORTS =====
// Các thư viện cần thiết cho ASP.NET Core Web API
using Blood_Donation_Support.Data;           // Database context
using Blood_Donation_Support.DTO;            // Data Transfer Objects
using Microsoft.AspNetCore.Authorization;     // Authorization attributes
using Microsoft.EntityFrameworkCore;        // Entity Framework Core
using Microsoft.AspNetCore.Mvc;              // MVC framework
using Blood_Donation_Support.Model;          // Model classes

namespace Blood_Donation_Support.Controllers;

// ===== BLOOD UNIT CONTROLLER =====
// Controller quản lý các đơn vị máu (Blood Units) trong hệ thống
// Chức năng chính:
// - CRUD operations cho blood units
// - Tìm kiếm máu phù hợp cho truyền máu
// - Quản lý trạng thái máu (Available, Reserved, Used, Discarded, Expired)
// - Theo dõi lịch sử sử dụng máu
[ApiController]
[Route("api/[controller]")]
public class BloodUnitController : ControllerBase
{
    // ===== DEPENDENCY INJECTION =====
    private readonly BloodDonationSupportContext _context; // Database context
    
    // ===== CONSTRUCTOR =====
    // Khởi tạo controller với database context được inject
    public BloodUnitController(BloodDonationSupportContext context)
    {
        _context = context;
    }
    
    // ===== GET ALL BLOOD UNITS =====
    // GET: api/BloodUnit
    // Lấy danh sách tất cả đơn vị máu (trừ những đơn vị đã bị loại bỏ)
    [HttpGet]
    [Authorize(Roles = "Admin, Staff")] // Chỉ Admin và Staff mới có quyền truy cập
    public async Task<IActionResult> GetAllBloodUnits()
    {
        // ===== VALIDATION =====
        if(!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

        // ===== QUERY BLOOD UNITS =====
        // Lấy tất cả blood units với thông tin liên quan
        var bloodUnits = await _context.BloodUnits
            .Include(bt => bt.BloodType)     // Include thông tin nhóm máu
            .Include(c => c.Component)        // Include thông tin chế phẩm máu
            .Include(m => m.Member)           // Include thông tin người hiến
                .ThenInclude(u => u.User)     // Include thông tin user của member
            .Select(bu => new
            {
                bu.BloodUnitId,             // ID đơn vị máu
                bu.BloodType.BloodTypeName, // Tên nhóm máu (A, B, AB, O)
                bu.Component.ComponentName, // Tên chế phẩm máu (Toàn phần, Hồng cầu, Tiểu cầu, Huyết tương)
                bu.Member.User.FullName,    // Tên đầy đủ của người hiến
                bu.AddDate,                 // Ngày thêm vào kho
                bu.ExpiryDate,              // Ngày hết hạn
                bu.Volume,                  // Thể tích ban đầu (mL)
                bu.BloodStatus,             // Trạng thái máu (Available, Reserved, Used, Discarded, Expired)
                bu.RemainingVolume,         // Thể tích còn lại (mL)
                bu.Notes,                   // Ghi chú (nếu có)
            })
            .Where(bu => bu.BloodStatus != "Discarded") // Loại bỏ những đơn vị đã bị loại bỏ
            .ToListAsync();

        return Ok(bloodUnits); // Trả về danh sách blood units
    }
    
    // ===== GET BLOOD UNIT BY ID =====
    // GET: api/BloodUnit/{id}
    // Lấy thông tin chi tiết của một đơn vị máu theo ID
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, Staff")] // Chỉ Admin và Staff mới có quyền truy cập
    public async Task<IActionResult> GetBloodUnitById(int id)
    {
        // ===== VALIDATION =====
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

        // ===== QUERY SINGLE BLOOD UNIT =====
        // Tìm blood unit theo ID với thông tin liên quan
        var bloodUnit = await _context.BloodUnits
            .Include(bt => bt.BloodType)     // Include thông tin nhóm máu
            .Include(c => c.Component)        // Include thông tin chế phẩm máu
            .Include(m => m.Member)           // Include thông tin người hiến
                .ThenInclude(u => u.User)     // Include thông tin user của member
            .Where(bu => bu.BloodUnitId == id) // Lọc theo ID
            .Select(bu => new
            {
                bu.BloodUnitId,             // ID đơn vị máu
                bu.BloodType.BloodTypeName, // Tên nhóm máu
                bu.Component.ComponentName, // Tên chế phẩm máu
                bu.Member.User.FullName,    // Tên đầy đủ của người hiến
                bu.AddDate,                 // Ngày thêm vào kho
                bu.ExpiryDate,              // Ngày hết hạn
                bu.Volume,                  // Thể tích ban đầu (mL)
                bu.BloodStatus,             // Trạng thái máu
                bu.RemainingVolume,         // Thể tích còn lại (mL)
                bu.Notes,                   // Ghi chú
            })
            .FirstOrDefaultAsync(); // Lấy record đầu tiên hoặc null

        return Ok(bloodUnit); // Trả về thông tin blood unit
    }
    
    // ===== ADD NEW BLOOD UNIT =====
    // POST: api/BloodUnit
    // Thêm đơn vị máu mới vào kho
    [HttpPost]
    [Authorize(Roles = "Admin, Staff")] // Chỉ Admin và Staff mới có quyền thêm
    public async Task<IActionResult> AddBloodUnit([FromBody] BloodUnitAdd model)
    {
        // ===== VALIDATION =====
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid
        if (model == null)
            return BadRequest("Cần nhập dữ liệu đơn vị máu."); // Status 400 Bad Request if blood unit data is null

        // ===== VOLUME VALIDATION =====
        if (model.Volume <= 0)
            return BadRequest("Thể tích phải là số dương."); // Kiểm tra thể tích phải > 0

        // ===== GET SHELF LIFE =====
        // Lấy thời hạn sử dụng của chế phẩm máu
        var shelfLifeDays = await _context.BloodComponents // Fetch shelf life days for the component
            .Where(c => c.ComponentId == model.ComponentId)
            .Select(c => c.ShelfLifeDays)
            .FirstOrDefaultAsync();
        if (shelfLifeDays <= 0)
            return BadRequest("Hạn sử dụng chế phẩm không hợp lệ."); // Status 400 Bad Request if shelf life is invalid

        // ===== CREATE NEW BLOOD UNIT =====
        var bloodUnit = new BloodUnit // Tạo instance mới của BloodUnit
        {
            BloodTypeId = model.BloodTypeId,                // ID nhóm máu
            ComponentId = model.ComponentId,                // ID chế phẩm máu
            AddDate = DateOnly.FromDateTime(DateTime.Now),  // Ngày thêm (mặc định hôm nay)
            ExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(shelfLifeDays)),     // Ngày hết hạn = ngày thêm + shelf life
            Volume = model.Volume,                          // Thể tích (mL)
            BloodStatus = "Available", // Trạng thái máu (mặc định "Available" nếu null)
            RemainingVolume = model.Volume,                 // Thể tích còn lại (mL) = thể tích ban đầu cho đơn vị mới
            MemberId = null, // Chưa gán cho member nào
        };

        // ===== DATABASE TRANSACTION =====
        var transaction = await _context.Database.BeginTransactionAsync(); // Bắt đầu transaction
        try
        {
            await _context.AddAsync(bloodUnit); // Thêm blood unit mới
            await _context.SaveChangesAsync(); // Lưu thay đổi
            await transaction.CommitAsync(); // Commit transaction
           
            return CreatedAtAction(nameof(GetBloodUnitById), new { id = bloodUnit.BloodUnitId }, bloodUnit); // Return 201 Created with the new blood unit
        }
        catch(DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(); // Rollback transaction nếu có lỗi
            throw; 
        }
    }
    
    // ===== UPDATE EXISTING BLOOD UNIT =====
    // PATCH: api/BloodUnit/{id}
    // Cập nhật thông tin đơn vị máu (chủ yếu là remaining volume và status)
    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin, Staff")] // Chỉ Admin và Staff mới có quyền cập nhật
    public async Task<IActionResult> UpdateBloodUnit (int id, [FromBody] BloodUnitUpdate model)
    {
        // ===== VALIDATION =====
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid
       
        if (model == null)
            return BadRequest("Cần nhập dữ liệu đơn vị máu."); // Status 400 Bad Request if blood unit data is null

        // ===== FIND EXISTING BLOOD UNIT =====
        var bloodUnit = await _context.BloodUnits.FindAsync(id); // Tìm blood unit theo ID
        if (bloodUnit == null)
            return NotFound(); // Status 404 Not Found if blood unit does not exist
        
        // ===== COMMENTED CODE =====
        // Code cũ để tính toán expiry date dựa trên shelf life
        //var shelfLifeDays = await _context.BloodComponents // Fetch shelf life days for the component
        //        .Where(c => c.ComponentId == model.ComponentId)
        //        .Select(c => c.ShelfLifeDays)
        //        .FirstOrDefaultAsync();
        //if (shelfLifeDays <= 0)
        //    return BadRequest("Invalid shelf life for the component."); // Status 400 Bad Request if shelf life is invalid

        // ===== UPDATE BLOOD UNIT PROPERTIES =====
        // Chỉ cập nhật remaining volume và blood status, không thay đổi các thông tin khác
        //bloodUnit.BloodTypeId = model.BloodTypeId;          // Blood Type ID
        //bloodUnit.ComponentId = model.ComponentId;          // Component ID
        //bloodUnit.AddDate = model.AddDate ?? DateOnly.FromDateTime(DateTime.Now); // Date Added (default to today if null)
        //bloodUnit.ExpiryDate = DateOnly.FromDateTime(model.AddDate?.ToDateTime(TimeOnly.MinValue).AddDays(shelfLifeDays) ?? DateTime.Now.AddDays(shelfLifeDays)); // Expiry Date
        //bloodUnit.Volume = model.Volume;                    // Volume (mL)
        bloodUnit.RemainingVolume = model.remainingVolume;  // Thể tích còn lại (mL)
        bloodUnit.BloodStatus = model.BloodStatus;          // Trạng thái máu
        //bloodUnit.MemberId = model.MemberId;                // Member ID

        // ===== DATABASE TRANSACTION =====
        var transaction = await _context.Database.BeginTransactionAsync(); // Bắt đầu transaction
        try
        {
            _context.BloodUnits.Update(bloodUnit);  // Cập nhật blood unit
            await _context.SaveChangesAsync();      // Lưu thay đổi
            await transaction.CommitAsync();        // Commit transaction

            return Ok(bloodUnit); // Return 200 OK with the updated blood unit
        }
        catch(DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(); // Rollback transaction nếu có lỗi
            throw;
        }
    }
    
    // ===== SOFT DELETE BLOOD UNIT =====
    // PATCH: api/BloodUnit/{id}/status-discard
    // Xóa mềm đơn vị máu bằng cách đổi trạng thái thành "Discarded"
    [HttpPatch("{id}/status-discard")]
    [Authorize(Roles = "Admin, Staff")] // Chỉ Admin và Staff mới có quyền xóa
    public async Task<IActionResult> UpdateBloodUnitStatus(int id)
    {
        // ===== VALIDATION =====
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // ===== FIND BLOOD UNIT =====
        var bloodUnit = await _context.BloodUnits.FindAsync(id);
        if (bloodUnit == null)
            return NotFound();

        // ===== SOFT DELETE =====
        // Cập nhật trạng thái thành "Discarded" thay vì xóa thực sự
        bloodUnit.BloodStatus = "Discarded";
            
        _context.BloodUnits.Update(bloodUnit);
        await _context.SaveChangesAsync();
            
        return Ok(bloodUnit);
    }
    
    // ===== EXPIRE BLOOD UNIT CHECK =====
    // PATCH: api/BloodUnit/expire-check
    // Kiểm tra và cập nhật trạng thái các đơn vị máu đã hết hạn
    [HttpPatch("expire-check")]
    [Authorize(Roles = "Admin, Staff")] // Chỉ Admin và Staff mới có quyền thực hiện
    public async Task<IActionResult> ExpireBloodUnitCheck()
    {
        // ===== VALIDATION =====
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // ===== FIND EXPIRED BLOOD UNITS =====
        // Tìm các đơn vị máu đã hết hạn nhưng chưa được cập nhật trạng thái
        var bloodUnit = await _context.BloodUnits
            .Where(bu => (bu.BloodStatus == "Available" || bu.BloodStatus == "PartialUsed" || bu.BloodStatus == "Reserved")
                && bu.ExpiryDate < DateOnly.FromDateTime(DateTime.Now)) // Ngày hết hạn < ngày hiện tại
            .ToListAsync(); // Check if there are any blood units that are expired

        if (bloodUnit == null)
            return NotFound();

        // ===== UPDATE EXPIRED UNITS =====
        // Cập nhật trạng thái tất cả đơn vị máu đã hết hạn
        foreach (var unit in bloodUnit)
        {
            unit.BloodStatus = "Expired";
        }
        await _context.SaveChangesAsync();

        return NoContent(); // Return 204 No Content if successful
    }

    // ===== BLOOD UNIT HISTORY TRACKING =====
    // GET: api/BloodUnit/{id}/history
    // Lấy lịch sử sử dụng của một đơn vị máu
    [HttpGet("{id}/history")]
    [Authorize(Roles = "Admin")] // Chỉ Admin mới có quyền xem lịch sử
    public async Task<IActionResult> GetBloodUnitHistory(int id)
    {
        // ===== VALIDATION =====
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

        // ===== FIND BLOOD UNIT =====
        var bloodUnit = await _context.BloodUnits.FindAsync(id);
        if (bloodUnit == null)
            return NotFound($"Không tìm thấy mã đơn vị máu: {id}.");

        // ===== URGENT BLOOD REQUEST HISTORY =====
        // Lịch sử sử dụng trong yêu cầu máu khẩn cấp
        var urgentBloodUnit = await _context.UrgentRequestBloodUnits
            .Where(ubu => ubu.BloodUnitId == id && ubu.Status == "Used") // Chỉ lấy những lần đã sử dụng
            .Select(ubu => new
            {
                ubu.UrgentRequest.UrgentRequestId,      // ID yêu cầu máu khẩn cấp
                ubu.BloodUnit.Component.ComponentName,  // Tên chế phẩm máu
                ubu.AssignedDate,                       // Ngày được gán
                ubu.AssignedVolume,                     // Thể tích được gán (mL)
            })
            .ToListAsync();
            
        // ===== TRANSFUSION REQUEST HISTORY =====
        // Lịch sử sử dụng trong yêu cầu truyền máu
        var transBloodUntit = await _context.TransfusionRequestBloodUnits
            .Where(tbu => tbu.BloodUnitId == id && tbu.Status == "Used") // Chỉ lấy những lần đã sử dụng
            .Select(tbu => new
            {
                tbu.TransfusionRequest.TransfusionId,            // ID yêu cầu truyền máu
                tbu.TransfusionRequest.Component.ComponentName,  // Tên chế phẩm máu
                tbu.AssignedDate,                                // Ngày được gán
                tbu.AssignedVolume,                              // Thể tích được gán (mL)
            })
            .ToListAsync();
            
        // ===== DONATION REQUEST HISTORY =====
        // Lịch sử từ yêu cầu hiến máu (khi blood unit được tạo từ donation)
        var donationBloodUnit = await _context.DonationRequests
            .Where(dbu => dbu.CompletionDate.HasValue && 
                   DateOnly.FromDateTime(dbu.CompletionDate.Value) == bloodUnit.AddDate && // Ngày hoàn thành = ngày thêm vào kho
                   dbu.MemberId == bloodUnit.MemberId && dbu.Status == "Completed") // Cùng member và đã hoàn thành
            .Select(dbu => new
            {
                dbu.DonationId,                     // ID yêu cầu hiến máu
                dbu.Component.ComponentName,        // Tên chế phẩm máu
                AssignedDate = dbu.CompletionDate,  // Ngày được gán (ngày hoàn thành)
                dbu.DonationVolume,                 // Thể tích hiến máu (mL)
            })
            .ToListAsync();

        // ===== CHECK IF ANY HISTORY EXISTS =====
        // Trả về 404 nếu không tìm thấy lịch sử nào
        if (!donationBloodUnit.Any() && !transBloodUntit.Any() && !urgentBloodUnit.Any())
            return NotFound("Không tìm thấy lịch sử yêu cầu máu cho đơn vị máu này."); // Status 404 Not Found if no history found

        // ===== RETURN HISTORY =====
        // Hiển thị kết quả theo từng loại lịch sử
        return Ok( new
        {
            DonationRequest = donationBloodUnit,    // Lịch sử từ yêu cầu hiến máu
            TransfusionRequest = transBloodUntit,   // Lịch sử từ yêu cầu truyền máu
            UrgentBloodRequest = urgentBloodUnit,   // Lịch sử từ yêu cầu máu khẩn cấp
        }); // Return 200 OK with the blood unit history
    }

    // ===== QUÝ CODING: START =====
    // Các API được phát triển bởi Quý

    // ===== GET COMPATIBLE BLOOD UNITS =====
    // GET: api/BloodUnit/compatible?bloodTypeId=1&componentId=1&minVolume=200
    // Tìm các đơn vị máu tương thích với yêu cầu (chỉ tìm đúng nhóm máu)
    [HttpGet("compatible")]
    [Authorize(Roles = "Staff,Admin")] // Chỉ Staff và Admin mới có quyền truy cập
    public async Task<IActionResult> GetCompatibleBloodUnits(int bloodTypeId, int componentId, int minVolume)
    {
        // ===== QUERY COMPATIBLE UNITS =====
        // Tìm các đơn vị máu đúng nhóm máu và chế phẩm, có thể tích >= minVolume
        var units = await _context.BloodUnits
            .Where(bu => bu.BloodTypeId == bloodTypeId      // Đúng nhóm máu
                      && bu.ComponentId == componentId       // Đúng chế phẩm máu
                      && bu.BloodStatus == "Available"      // Trạng thái có sẵn
                      && bu.RemainingVolume >= minVolume)   // Thể tích còn lại >= yêu cầu tối thiểu
            .Select(bu => new {
                bu.BloodUnitId,        // ID đơn vị máu
                bu.BloodTypeId,        // ID nhóm máu
                bu.ComponentId,        // ID chế phẩm máu
                bu.RemainingVolume,    // Thể tích còn lại
                bu.BloodStatus,        // Trạng thái máu
                bu.ExpiryDate          // Ngày hết hạn
            })
            .ToListAsync();

        return Ok(units); // Trả về danh sách đơn vị máu tương thích
    }

    // ===== GET SUITABLE BLOOD UNITS =====
    // GET: api/BloodUnit/suitable?bloodTypeId=1&componentId=1&requiredVolume=1000
    // Tìm các đơn vị máu phù hợp cho truyền máu (bao gồm cả nhóm máu tương thích)
    [HttpGet("suitable")]
    [Authorize(Roles = "Staff,Admin")] // Chỉ Staff và Admin mới có quyền truy cập
    public async Task<IActionResult> GetSuitableBloodUnits(int bloodTypeId, int componentId, int requiredVolume)
    {
        var now = DateOnly.FromDateTime(DateTime.Now); // Ngày hiện tại
        
        // ===== STEP 1: TÌM MÁU ĐÚNG NHÓM =====
        // Lấy các túi máu đúng nhóm máu và chế phẩm yêu cầu
        var units = await _context.BloodUnits
            .Where(bu => bu.BloodTypeId == bloodTypeId      // Đúng nhóm máu
                      && bu.ComponentId == componentId       // Đúng chế phẩm máu
                      && bu.BloodStatus == "Available"      // Trạng thái có sẵn
                      && bu.RemainingVolume > 0             // Còn thể tích > 0
                      && bu.ExpiryDate >= now)              // Chưa hết hạn
            .OrderBy(bu => bu.ExpiryDate)                   // Sắp xếp theo ngày hết hạn (ưu tiên hết hạn sớm)
            .Select(bu => new {
                bu.BloodUnitId,                    // ID đơn vị máu
                bu.BloodTypeId,                    // ID nhóm máu
                BloodTypeName = bu.BloodType.BloodTypeName, // Tên nhóm máu
                bu.ComponentId,                    // ID chế phẩm máu
                ComponentName = bu.Component.ComponentName, // Tên chế phẩm máu
                bu.RemainingVolume,                // Thể tích còn lại
                bu.BloodStatus,                    // Trạng thái máu
                bu.ExpiryDate                      // Ngày hết hạn
            })
            .ToListAsync();
            
        var totalAvailable = units.Sum(u => u.RemainingVolume); // Tổng thể tích có sẵn
        
        // ===== STEP 2: KIỂM TRA ĐỦ MÁU ĐÚNG NHÓM =====
        // Nếu đủ máu đúng nhóm, trả về kết quả
        if (totalAvailable >= requiredVolume)
            return Ok(new { units, totalAvailable, enough = true });
            
        // ===== STEP 3: TÌM MÁU TƯƠNG THÍCH =====
        // Nếu không đủ, lấy các nhóm máu tương thích khác (trừ nhóm gốc)
        var compatibleTypeIds = await _context.BloodCompatibilityRules
            .Where(rule => rule.BloodRecieveId == bloodTypeId      // Nhóm máu nhận
                       && rule.ComponentId == componentId          // Chế phẩm máu
                       && rule.IsCompatible                       // Có tương thích
                       && rule.BloodGiveId != bloodTypeId)        // Khác nhóm máu gốc
            .Select(rule => rule.BloodGiveId)                     // Lấy ID nhóm máu cho
            .ToListAsync();
            
        // ===== STEP 4: LẤY MÁU TƯƠNG THÍCH =====
        // Lấy các nhóm máu tương thích còn máu trong kho
        var suitableAlternatives = new List<object>();
        foreach (var altTypeId in compatibleTypeIds)
        {
            var altUnits = await _context.BloodUnits
                .Where(bu => bu.BloodTypeId == altTypeId        // Nhóm máu tương thích
                          && bu.ComponentId == componentId      // Đúng chế phẩm máu
                          && bu.BloodStatus == "Available"     // Trạng thái có sẵn
                          && bu.RemainingVolume > 0            // Còn thể tích > 0
                          && bu.ExpiryDate >= now)             // Chưa hết hạn
                .OrderBy(bu => bu.ExpiryDate)                  // Sắp xếp theo ngày hết hạn
                .Select(bu => new {
                    bu.BloodUnitId,                    // ID đơn vị máu
                    bu.BloodTypeId,                    // ID nhóm máu
                    BloodTypeName = bu.BloodType.BloodTypeName, // Tên nhóm máu
                    bu.ComponentId,                    // ID chế phẩm máu
                    ComponentName = bu.Component.ComponentName, // Tên chế phẩm máu
                    bu.RemainingVolume,                // Thể tích còn lại
                    bu.BloodStatus,                    // Trạng thái máu
                    bu.ExpiryDate                      // Ngày hết hạn
                })
                .ToListAsync();
                
            // Nếu có máu tương thích, thêm vào danh sách
            if (altUnits.Any())
            {
                suitableAlternatives.Add(new {
                    BloodTypeId = altTypeId,                                    // ID nhóm máu tương thích
                    BloodTypeName = altUnits.First().BloodTypeName,            // Tên nhóm máu tương thích
                    units = altUnits,                                          // Danh sách đơn vị máu
                    totalAvailable = altUnits.Sum(u => u.RemainingVolume)      // Tổng thể tích có sẵn
                });
            }
        }
        
        // ===== STEP 5: TRẢ VỀ KẾT QUẢ =====
        // Trả về cả máu đúng nhóm và máu tương thích
        return Ok(new {
            units,                  // Máu đúng nhóm
            totalAvailable,         // Tổng thể tích máu đúng nhóm
            enough = false,         // Không đủ máu đúng nhóm
            requiredVolume,         // Thể tích yêu cầu
            suitableAlternatives    // Danh sách máu tương thích
        });
    }
    // ===== QUÝ CODING: END =====

}
