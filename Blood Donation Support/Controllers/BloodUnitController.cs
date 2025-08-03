using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Blood_Donation_Support.Model;

namespace Blood_Donation_Support.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodUnitController : ControllerBase
{
    private readonly BloodDonationSupportContext _context;
    public BloodUnitController(BloodDonationSupportContext context)
    {
        _context = context;
    }
    // Get blood unit
    // GET: api/BloodUnit
    [HttpGet]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> GetAllBloodUnits()
    {
        if(!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

        var bloodUnits = await _context.BloodUnits
            .Include(bt => bt.BloodType) 
            .Include(c => c.Component)
            .Include(m => m.Member)
                .ThenInclude(u => u.User)
            .Select(bu => new
            {
                bu.BloodUnitId,             // Blood Unit ID
                bu.BloodType.BloodTypeName, // Blood Type Name
                bu.Component.ComponentName, // Component Name
                bu.Member.User.FullName,    // Full Name of the Member
                bu.AddDate,                 // Date Added
                bu.ExpiryDate,              // Expiry Date
                bu.Volume,                  // Volume (mL)
                bu.BloodStatus,             // Blood Status
                bu.RemainingVolume,         // Remaining Volume (mL)
                bu.Notes,                   // Notes (if any)
            })
            .Where(bu => bu.BloodStatus != "Discarded")
            .ToListAsync();

        return Ok(bloodUnits);
    }
    // Get blood unit by ID
    // GET: api/BloodUnit/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, Staff")] 
    public async Task<IActionResult> GetBloodUnitById(int id)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

        var bloodUnit = await _context.BloodUnits
            .Include(bt => bt.BloodType)
            .Include(c => c.Component)
            .Include(m => m.Member)
                .ThenInclude(u => u.User)
            .Where(bu => bu.BloodUnitId == id)
            .Select(bu => new
            {
                bu.BloodUnitId,             // Blood Unit ID
                bu.BloodType.BloodTypeName, // Blood Type Name
                bu.Component.ComponentName, // Component Name
                bu.Member.User.FullName,    // Full Name of the Member
                bu.AddDate,                 // Date Added
                bu.ExpiryDate,              // Expiry Date
                bu.Volume,                  // Volume (mL)
                bu.BloodStatus,             // Blood Status
                bu.RemainingVolume,         // Remaining Volume (mL)
                bu.Notes,                   // Notes (if any)
            })
            .FirstOrDefaultAsync();

        return Ok(bloodUnit);
    }
    // Add new blood unit
    // POST: api/BloodUnit
    [HttpPost]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> AddBloodUnit([FromBody] BloodUnitAdd model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid
        if (model == null)
            return BadRequest("Cần nhập dữ liệu đơn vị máu."); // Status 400 Bad Request if blood unit data is null

        if (model.Volume <= 0)
            return BadRequest("Thể tích phải là số dương."); // 

        var shelfLifeDays = await _context.BloodComponents // Fetch shelf life days for the component
            .Where(c => c.ComponentId == model.ComponentId)
            .Select(c => c.ShelfLifeDays)
            .FirstOrDefaultAsync();
        if (shelfLifeDays <= 0)
            return BadRequest("Hạn sử dụng chế phẩm không hợp lệ."); // Status 400 Bad Request if shelf life is invalid

        var bloodUnit = new BloodUnit // Create a new instance of BloodUnit
        {
            BloodTypeId = model.BloodTypeId,                // Blood Type ID
            ComponentId = model.ComponentId,                // Component ID
            AddDate = DateOnly.FromDateTime(DateTime.Now),  // Date Added (default today)
            ExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(shelfLifeDays)),     // Expiry Date
            Volume = model.Volume,                          // Volume (mL)
            BloodStatus = "Available", // Blood Status (default to "Available" if null)
            RemainingVolume = model.Volume,                 // Remaining Volume (mL) equals initial volume for new units
            MemberId = null,
        };

        var transaction = await _context.Database.BeginTransactionAsync(); // Start a transaction
        try
        {
            await _context.AddAsync(bloodUnit); // Add the new blood unit
            await _context.SaveChangesAsync();
            await transaction.CommitAsync(); // Commit the transaction
           
            return CreatedAtAction(nameof(GetBloodUnitById), new { id = bloodUnit.BloodUnitId }, bloodUnit); // Return 201 Created with the new blood unit
        }
        catch(DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(); // Rollback the transaction
            throw; 
        }
    }
    // Update existing blood unit
    // PATC: api/BloodUnit/{id}
    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> UpdateBloodUnit (int id, [FromBody] BloodUnitUpdate model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid
       
        if (model == null)
            return BadRequest("Cần nhập dữ liệu đơn vị máu."); // Status 400 Bad Request if blood unit data is null

        var bloodUnit = await _context.BloodUnits.FindAsync(id); // Find the existing blood unit by ID
        if (bloodUnit == null)
            return NotFound(); // Status 404 Not Found if blood unit does not exist
        
        //var shelfLifeDays = await _context.BloodComponents // Fetch shelf life days for the component
        //        .Where(c => c.ComponentId == model.ComponentId)
        //        .Select(c => c.ShelfLifeDays)
        //        .FirstOrDefaultAsync();
        //if (shelfLifeDays <= 0)
        //    return BadRequest("Invalid shelf life for the component."); // Status 400 Bad Request if shelf life is invalid

        // Update the properties of the existing blood unit
        //bloodUnit.BloodTypeId = model.BloodTypeId;          // Blood Type ID
        //bloodUnit.ComponentId = model.ComponentId;          // Component ID
        //bloodUnit.AddDate = model.AddDate ?? DateOnly.FromDateTime(DateTime.Now); // Date Added (default to today if null)
        //bloodUnit.ExpiryDate = DateOnly.FromDateTime(model.AddDate?.ToDateTime(TimeOnly.MinValue).AddDays(shelfLifeDays) ?? DateTime.Now.AddDays(shelfLifeDays)); // Expiry Date
        //bloodUnit.Volume = model.Volume;                    // Volume (mL)
        bloodUnit.RemainingVolume = model.remainingVolume;  // Remaining Volume (mL)
        bloodUnit.BloodStatus = model.BloodStatus;          // Blood Status
        //bloodUnit.MemberId = model.MemberId;                // Member ID

        var transaction = await _context.Database.BeginTransactionAsync(); // Start a transaction
        try
        {
            _context.BloodUnits.Update(bloodUnit);  // Update the existing blood unit
            await _context.SaveChangesAsync();      // Save changes to the database
            await transaction.CommitAsync();        // Commit the transaction

            return Ok(bloodUnit); // Return 200 OK with the updated blood unit
        }
        catch(DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(); // Rollback the transaction
            throw;
        }
    }
    // Delete blood unit status (Soft Delete)
    // PATCH: api/BloodUnit/{id}/status-discard
    [HttpPatch("{id}/status-discard")]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> UpdateBloodUnitStatus(int id)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var bloodUnit = await _context.BloodUnits.FindAsync(id);
        if (bloodUnit == null)
            return NotFound();

        // Update the BloodStatus
        bloodUnit.BloodStatus = "Discarded";
            
        _context.BloodUnits.Update(bloodUnit);
        await _context.SaveChangesAsync();
            
        return Ok(bloodUnit);
    }
    // Expire blood unit check 
    // PATCH: api/BloodUnit/{id}/status-discard
    [HttpPatch("expire-check")]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> ExpireBloodUnitCheck()
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var bloodUnit = await _context.BloodUnits
            .Where(bu => (bu.BloodStatus == "Available" || bu.BloodStatus == "PartialUsed" || bu.BloodStatus == "Reserved")
                && bu.ExpiryDate < DateOnly.FromDateTime(DateTime.Now))
            .ToListAsync(); // Check if there are any blood units that are expired

        if (bloodUnit == null)
            return NotFound();

        // Update the BloodStatus for all expired units
        foreach (var unit in bloodUnit)
        {
            unit.BloodStatus = "Expired";
        }
        await _context.SaveChangesAsync();

        return NoContent(); // Return 204 No Content if successful
    }

    // History Tracking Blood Unit
    // GET: api/BloodUnit/{id}/history
    [HttpGet("{id}/history")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetBloodUnitHistory(int id)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

        var bloodUnit = await _context.BloodUnits.FindAsync(id);
        if (bloodUnit == null)
            return NotFound($"Không tìm thấy mã đơn vị máu: {id}.");

        // Urgent Blood Request History Track
        var urgentBloodUnit = await _context.UrgentRequestBloodUnits
            .Where(ubu => ubu.BloodUnitId == id && ubu.Status == "Used")
            .Select(ubu => new
            {
                ubu.UrgentRequest.UrgentRequestId,      // Urgent Request Blood Unit ID
                ubu.BloodUnit.Component.ComponentName,  // Component Name
                ubu.AssignedDate,                       // Assigned Date
                ubu.AssignedVolume,                     // Assigned Volume (mL)
            })
            .ToListAsync();
        // Transfusion Request History Track
        var transBloodUntit = await _context.TransfusionRequestBloodUnits
            .Where(tbu => tbu.BloodUnitId == id && tbu.Status == "Used")
            .Select(tbu => new
            {
                tbu.TransfusionRequest.TransfusionId,            // Transfusion Request ID
                tbu.TransfusionRequest.Component.ComponentName,  // Component Name
                tbu.AssignedDate,                                // Assigned Date
                tbu.AssignedVolume,                              // Assigned Volume (mL)
            })
            .ToListAsync();
        // Donation Request History Track
        var donationBloodUnit = await _context.DonationRequests
            .Where(dbu => dbu.CompletionDate.HasValue && 
                   DateOnly.FromDateTime(dbu.CompletionDate.Value) == bloodUnit.AddDate &&
                   dbu.MemberId == bloodUnit.MemberId && dbu.Status == "Completed")
            .Select(dbu => new
            {
                dbu.DonationId,                     // Donation Request ID
                dbu.Component.ComponentName,        // Component Name
                AssignedDate = dbu.CompletionDate,  // Assigned Date (Completation Date)
                dbu.DonationVolume,                 // Donation Volume (mL)
            })
            .ToListAsync();

        // return status 404 if not found any history track
        if (!donationBloodUnit.Any() && !transBloodUntit.Any() && !urgentBloodUnit.Any())
            return NotFound("Không tìm thấy lịch sử yêu cầu máu cho đơn vị máu này."); // Status 404 Not Found if no history found

        //  Display the results
        return Ok( new
        {
            DonationRequest = donationBloodUnit,    // Donation Request History Track
            TransfusionRequest = transBloodUntit,   // Transfusion Request History Track
            UrgentBloodRequest = urgentBloodUnit,   // Urgent Blood Request History Track
        }); // Return 200 OK with the blood unit history
    }

    // --- Quý Coding: Start ---

    // GET: api/BloodUnit/compatible?bloodTypeId=1&componentId=1&minVolume=200
    [HttpGet("compatible")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> GetCompatibleBloodUnits(int bloodTypeId, int componentId, int minVolume)
    {
        var units = await _context.BloodUnits
            .Where(bu => bu.BloodTypeId == bloodTypeId
                      && bu.ComponentId == componentId
                      && bu.BloodStatus == "Available"
                      && bu.RemainingVolume >= minVolume)
            .Select(bu => new {
                bu.BloodUnitId,
                bu.BloodTypeId,
                bu.ComponentId,
                bu.RemainingVolume,
                bu.BloodStatus,
                bu.ExpiryDate
            })
            .ToListAsync();

        return Ok(units);
    }

    // GET: api/BloodUnit/suitable?bloodTypeId=1&componentId=1&requiredVolume=1000
    [HttpGet("suitable")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> GetSuitableBloodUnits(int bloodTypeId, int componentId, int requiredVolume)
    {
        var now = DateOnly.FromDateTime(DateTime.Now);
        // 1. Lấy các túi máu đúng nhóm
        var units = await _context.BloodUnits
            .Where(bu => bu.BloodTypeId == bloodTypeId
                      && bu.ComponentId == componentId
                      && bu.BloodStatus == "Available"
                      && bu.RemainingVolume > 0
                      && bu.ExpiryDate >= now)
            .OrderBy(bu => bu.ExpiryDate)
            .Select(bu => new {
                bu.BloodUnitId,
                bu.BloodTypeId,
                BloodTypeName = bu.BloodType.BloodTypeName,
                bu.ComponentId,
                ComponentName = bu.Component.ComponentName,
                bu.RemainingVolume,
                bu.BloodStatus,
                bu.ExpiryDate
            })
            .ToListAsync();
        var totalAvailable = units.Sum(u => u.RemainingVolume);
        // Nếu đủ máu đúng nhóm, trả về như cũ
        if (totalAvailable >= requiredVolume)
            return Ok(new { units, totalAvailable, enough = true });
        // 2. Nếu không đủ, lấy các nhóm máu tương thích khác (trừ nhóm gốc)
        var compatibleTypeIds = await _context.BloodCompatibilityRules
            .Where(rule => rule.BloodRecieveId == bloodTypeId && rule.ComponentId == componentId && rule.IsCompatible && rule.BloodGiveId != bloodTypeId)
            .Select(rule => rule.BloodGiveId)
            .ToListAsync();
        // Lấy các nhóm máu còn máu trong kho
        var suitableAlternatives = new List<object>();
        foreach (var altTypeId in compatibleTypeIds)
        {
            var altUnits = await _context.BloodUnits
                .Where(bu => bu.BloodTypeId == altTypeId
                          && bu.ComponentId == componentId
                          && bu.BloodStatus == "Available"
                          && bu.RemainingVolume > 0
                          && bu.ExpiryDate >= now)
                .OrderBy(bu => bu.ExpiryDate)
                .Select(bu => new {
                    bu.BloodUnitId,
                    bu.BloodTypeId,
                    BloodTypeName = bu.BloodType.BloodTypeName,
                    bu.ComponentId,
                    ComponentName = bu.Component.ComponentName,
                    bu.RemainingVolume,
                    bu.BloodStatus,
                    bu.ExpiryDate
                })
                .ToListAsync();
            if (altUnits.Any())
            {
                suitableAlternatives.Add(new {
                    BloodTypeId = altTypeId,
                    BloodTypeName = altUnits.First().BloodTypeName,
                    units = altUnits,
                    totalAvailable = altUnits.Sum(u => u.RemainingVolume)
                });
            }
        }
        return Ok(new {
            units,
            totalAvailable,
            enough = false,
            requiredVolume,
            suitableAlternatives
        });
    }
    // --- Quý Coding: End ---

}
