using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationRequestController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        private readonly IConfiguration _configuration;
    
        public DonationRequestController(BloodDonationSupportContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // get donation request by id
        // api/DonationRequest/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Staff,Admin")] // Only Staff and Admin can view donation requests by ID
        public async Task<IActionResult> GetDonationRequest(int id)
        {
            var donationRequest = await _context.DonationRequests.FindAsync(id); // Fetch the donation request by ID
            if (donationRequest == null)
            {
                return NotFound(); // Return 404 if not found
            }
            return Ok(donationRequest);
        }

        // get all donation requests (Custom View)
        // GET: api/DonationRequest/all
        [HttpGet("all")]
        [Authorize(Roles = "Staff,Admin")] // Staff and Admin roles can view all donation requests
        public async Task<IActionResult> GetAllDonationRequests()
        {
            var donationRequests = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Select(dr => new
                {
                    dr.DonationId,
                    dr.Member.User.CitizenNumber, // Include CitizenNumber from User instead of UserId
                    dr.PeriodId,
                    dr.ComponentId,
                    dr.PreferredDonationDate,
                    dr.ResponsibleById,
                    dr.DonationVolume,
                    dr.Notes,
                    dr.Status,
                    dr.RequestDate,
                    dr.ApprovalDate
                })
                .ToListAsync();

            return Ok(donationRequests);
        }

        // update donation request by id
        // PUT: api/DonationRequest/update/{id}
        [HttpPut("update/{id}")]
        [Authorize(Roles = "Staff,Admin")] // Only Staff and Admin can update donation requests
        public async Task<IActionResult> UpdateDonationRequest(int id, [FromBody] UpdateDonationRequest model)
        {
            var existingRequest = await _context.DonationRequests.FindAsync(id); // Fetch the existing donation request by ID
            if (existingRequest == null)
            {
                return NotFound(); // Return 404 if the request does not exist
            }
            if (existingRequest.Status == "Completed" || existingRequest.Status == "Cancelled") 
            {
                return BadRequest("Cannot update status donation request."); // Return 400 Bad Request if the request is already complete
            }
            try // Attempt to update the existing request
            {
                // Validate the model donation request 'status' ("Complete") and 'approval date' had exist data 
                if (existingRequest.Status == "Completed" || existingRequest.ApprovalDate != null)
            {
                var member = await _context.Members.FindAsync(existingRequest.MemberId); // Fetch the member associated with the request
                if (member == null)
                {
                    return NotFound($"Member with ID {existingRequest.MemberId} not found.");
                }
                member.LastDonationDate = DateOnly.FromDateTime(DateTime.Now); // Update the member's last donation date
                member.DonationCount = (member.DonationCount ?? 0) + 1;        // Increment the donation count (+1)
                // Add blood Unit from member's donation request
                var bloodUnit = new BloodUnit
                {
                    BloodTypeId = member.BloodTypeId ?? 0,         // BloodTypeId is required, (default to 0 if null or error)
                    ComponentId = existingRequest.ComponentId,     // Component ID from the request 
                    AddDate = DateOnly.FromDateTime(DateTime.Now), // Date when the blood unit is added (Current date)

                    ExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays( _context.BloodComponents
                            .Where(bc => bc.ComponentId == existingRequest.ComponentId)
                            .Select(bc => bc.ShelfLifeDays)
                            .FirstOrDefault())),                           // Expiry date based on ShelfLifeDays from BloodComponents table
                        Volume = existingRequest.DonationVolume ?? 0,          // Volume of the blood unit (default to 0 if null or error)
                        BloodStatus = "Available",                             // Blood status is set to "Available"
                        RemainingVolume = existingRequest.DonationVolume ?? 0, // Remaining volume is set to the donation volume
                    };
                    await _context.BloodUnits.AddAsync(bloodUnit); // Add the new blood unit to the database
                    _context.Entry(member).State = EntityState.Modified; // Mark the member entity as modified
                }

                // Update the existing request 
                existingRequest.ResponsibleById = model.ResponsibleById;
                existingRequest.ApprovalDate = DateTime.Now;
                existingRequest.Status = model.Status;
                existingRequest.Notes = model.Notes;

                _context.Entry(existingRequest).State = EntityState.Modified; // Mark the entity as modified
                await _context.SaveChangesAsync(); // Save changes to the database
            }
            catch (DbUpdateConcurrencyException)
            {
                throw; // Rethrow the exception if it is a concurrency issue 
            }
            return NoContent(); // Return 204 No Content on successful update
        }

    }
}
