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
            })
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
            return BadRequest("Blood unit data is required."); // Status 400 Bad Request if blood unit data is null

        if (model.Volume <= 0)
            return BadRequest("Volume must be positive"); // 

        var shelfLifeDays = await _context.BloodComponents // Fetch shelf life days for the component
            .Where(c => c.ComponentId == model.ComponentId)
            .Select(c => c.ShelfLifeDays)
            .FirstOrDefaultAsync();
        if (shelfLifeDays <= 0)
            return BadRequest("Invalid shelf life for the component."); // Status 400 Bad Request if shelf life is invalid

        var bloodUnit = new BloodUnit // Create a new instance of BloodUnit
        {
            BloodTypeId = model.BloodTypeId,                // Blood Type ID
            ComponentId = model.ComponentId,                // Component ID
            AddDate = DateOnly.FromDateTime(DateTime.Now),  // Date Added (default today)
            ExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(shelfLifeDays)),     // Expiry Date
            Volume = model.Volume,                          // Volume (mL)
            BloodStatus = model.BloodStatus ?? "Available", // Blood Status (default to "Available" if null)
            RemainingVolume = model.Volume,                 // Remaining Volume (mL) equals initial volume for new units
            MemberId = model.MemberId 
        };

        var transaction = await _context.Database.BeginTransactionAsync(); // Start a transaction
        try
        {
            await _context.BloodUnits.AddAsync(bloodUnit); // Add the new blood unit
            await _context.SaveChangesAsync(); // Save changes to the database
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
            return BadRequest("Blood unit data is required."); // Status 400 Bad Request if blood unit data is null

        var bloodUnit = await _context.BloodUnits.FindAsync(id); // Find the existing blood unit by ID
        if (bloodUnit == null)
            return NotFound(); // Status 404 Not Found if blood unit does not exist
        
        var shelfLifeDays = await _context.BloodComponents // Fetch shelf life days for the component
                .Where(c => c.ComponentId == model.ComponentId)
                .Select(c => c.ShelfLifeDays)
                .FirstOrDefaultAsync();
        if (shelfLifeDays <= 0)
            return BadRequest("Invalid shelf life for the component."); // Status 400 Bad Request if shelf life is invalid

        // Update the properties of the existing blood unit
        bloodUnit.BloodTypeId = model.BloodTypeId;          // Blood Type ID
        bloodUnit.ComponentId = model.ComponentId;          // Component ID
        bloodUnit.AddDate = model.AddDate ?? DateOnly.FromDateTime(DateTime.Now); // Date Added (default to today if null)
        bloodUnit.ExpiryDate = DateOnly.FromDateTime(model.AddDate?.ToDateTime(TimeOnly.MinValue).AddDays(shelfLifeDays) ?? DateTime.Now.AddDays(shelfLifeDays)); // Expiry Date
        bloodUnit.Volume = model.Volume;                    // Volume (mL)
        bloodUnit.RemainingVolume = model.remainingVolume;  // Remaining Volume (mL)
        bloodUnit.BloodStatus = model.BloodStatus;          // Blood Status
        bloodUnit.MemberId = model.MemberId; // Member ID

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
    // Update blood unit status (e.g., for discarding)
    // PATCH: api/BloodUnit/{id}/update-status
    [HttpPatch("{id}/update-status")]
    [Authorize(Roles = "Admin, Staff")]
    public async Task<IActionResult> UpdateBloodUnitStatus(int id, [FromBody] BloodUnitStatusUpdateDTO model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var bloodUnit = await _context.BloodUnits.FindAsync(id);
        if (bloodUnit == null)
            return NotFound();

        // Update the BloodStatus
        bloodUnit.BloodStatus = model.Status;
            
        _context.BloodUnits.Update(bloodUnit);
        await _context.SaveChangesAsync();
            
        return Ok(bloodUnit);
    }
}
