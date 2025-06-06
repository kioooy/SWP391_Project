using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
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
        // api/DonationRequest/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAllDonationRequests()
        {
            var donationRequests = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Select(dr => new
                {
                    dr.DonationId,
                    dr.Member.User.CitizenNumber,
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
        public async Task<IActionResult> UpdateDonationRequest(int id, [FromBody] UpdateDonationRequest model)
        {
            var existingRequest = await _context.DonationRequests.FindAsync(id); // Fetch the existing donation request by ID
            if (existingRequest == null)
            {
                return NotFound();
            }
            existingRequest.ResponsibleById = model.ResponsibleById;
            existingRequest.ApprovalDate = DateTime.Now;
            existingRequest.Status = model.Status;
            existingRequest.Notes = model.Notes;

            try // Attempt to update the existing request
            {
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
