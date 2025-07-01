using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly BloodDonationSupportContext _context;
    public ReservationsController(BloodDonationSupportContext context)
    {
        _context = context;
    }

    // POST api/reservations
    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ReservationDTO>> CreateReservation(CreateReservationDTO dto)
    {
        // Check blood unit availability
        var unit = await _context.BloodUnits.FirstOrDefaultAsync(u => u.BloodUnitId == dto.BloodUnitId && u.BloodStatus == "Available");
        if (unit == null) return BadRequest("Blood unit not available");

        var reservation = new BloodReservation
        {
            BloodUnitId = dto.BloodUnitId,
            TransfusionId = dto.TransfusionId,
            ReservedById = int.Parse(User.Identity!.Name!), // assuming userId stored in Name
            ReservedAt = DateTime.Now,
            ExpireAt = dto.ExpireAt,
            Status = "Active"
        };
        unit.BloodStatus = "Reserved";
        _context.BloodReservations.Add(reservation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetActiveReservations), new { transfusionId = reservation.TransfusionId }, new ReservationDTO
        {
            ReservationId = reservation.ReservationId,
            BloodUnitId = reservation.BloodUnitId,
            TransfusionId = reservation.TransfusionId,
            ReservedAt = reservation.ReservedAt,
            ExpireAt = reservation.ExpireAt,
            Status = reservation.Status
        });
    }

    // PATCH api/reservations/{id}
    [HttpPatch("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> UpdateReservation(int id, [FromQuery] string action)
    {
        var reservation = await _context.BloodReservations.Include(r => r.BloodUnit).FirstOrDefaultAsync(r => r.ReservationId == id);
        if (reservation == null) return NotFound();
        if (reservation.Status != "Active") return BadRequest("Reservation already closed");

        switch (action?.ToLower())
        {
            case "cancel":
                reservation.Status = "Cancelled";
                reservation.BloodUnit!.BloodStatus = "Available";
                break;
            case "fulfill":
                reservation.Status = "Fulfilled";
                reservation.BloodUnit!.BloodStatus = "Used";
                break;
            default:
                return BadRequest("Action must be 'cancel' or 'fulfill'");
        }
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET api/reservations/active?transfusionId=123
    [HttpGet("active")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<IEnumerable<ReservationDTO>>> GetActiveReservations([FromQuery] int? transfusionId)
    {
        var query = _context.BloodReservations.AsQueryable().Where(r => r.Status == "Active");
        if (transfusionId.HasValue) query = query.Where(r => r.TransfusionId == transfusionId);
        var list = await query.Select(r => new ReservationDTO
        {
            ReservationId = r.ReservationId,
            BloodUnitId = r.BloodUnitId,
            TransfusionId = r.TransfusionId,
            ReservedAt = r.ReservedAt,
            ExpireAt = r.ExpireAt,
            Status = r.Status
        }).ToListAsync();
        return Ok(list);
    }
}
