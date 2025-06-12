using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace Blood_Donation_Support.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BloodInventoryController : ControllerBase
{
    private readonly BloodDonationSupportContext _context;
    public BloodInventoryController(BloodDonationSupportContext context)
    {
        _context = context;
    }

    // GET api/blood-inventory/available?recipientBloodType=A+&component=plasma
    [HttpGet("available")]
    [Authorize(Roles = "Member,Staff,Admin")]
    public async Task<ActionResult<IEnumerable<AvailableBloodDto>>> GetAvailableCompatible(
        [FromQuery] string recipientBloodType,
        [FromQuery] string component)
    {
        if (string.IsNullOrWhiteSpace(recipientBloodType) || string.IsNullOrWhiteSpace(component))
            return BadRequest("recipientBloodType and component required");

        // Step1: determine compatible donor blood types
        var compController = new BloodCompatibilityController(); // using static tables
        var compList = compController.GetCompatibleList(recipientBloodType, component);
        if (compList == null)
            return BadRequest("Invalid blood type or component");

        // Determine componentId once to avoid switch inside expression tree
        var compLower = component.ToLower();
        int componentId = compLower switch
        {
            "red-cell" => 1,
            "plasma" => 2,
            "platelet" => 3,
            _ => -1
        };
        if (componentId == -1)
            return BadRequest("Invalid component type");

        // Step2: query BloodUnits
        var query = _context.BloodUnits.Where(u =>
            u.BloodStatus == "Available" &&
            u.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) &&
            compList.Contains(u.BloodType.BloodTypeName) &&
            u.ComponentId == componentId);
        var result = await query
            .GroupBy(u => u.BloodType.BloodTypeName)
            .Select(g => new AvailableBloodDto
            {
                BloodType = g.Key,
                Units = g.Count(),
                TotalVolume = g.Sum(x => x.RemainingVolume)
            }).ToListAsync();
        return Ok(result);
    }
}
