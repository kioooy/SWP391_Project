using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;

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
        [HttpGet]
        [Authorize(Roles = "Staff,Admin")] // Staff and Admin roles can view all donation requests
        public async Task<IActionResult> GetAllDonationRequests()
        {
            var donationRequests = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Period)
                .Select(dr => new
                {
                    dr.DonationId,
                    MemberId = dr.MemberId,
                    MemberName = dr.Member.User.FullName,
                    dr.Member.User.CitizenNumber,      // CitizenNumber from User instead of UserId
                    dr.Member.BloodType.BloodTypeName, // BloodTypeName from BloodType
                    dr.PeriodId,
                    PeriodName = dr.Period.PeriodName,
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

        // add donation request
        // POST: api/DonationRequest/register
        [HttpPost]
        [Authorize(Roles = "Member,Staff,Admin")]
        public async Task<IActionResult> RegisterDonationRequests([FromBody] DonationRequestControllerDTO model)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState); // Return 400 Bad Request if model state is invalid

            // Check if the user is authenticated and has the required role
            var member = await _context.Members.FirstOrDefaultAsync( u => u.UserId == model.MemberId ); 
            if (member == null)
                return NotFound(); // Return 404 Not Found if member not found

            var donationRequest = new DonationRequest
            {
                MemberId = member.UserId,                            // Member Id ( UserId of role the member )
                PeriodId = model.PeriodId,                           // Period Id 
                ComponentId = model.ComponentId,                     // Component Id 
                PreferredDonationDate = model.PreferredDonationDate, // Preferred Donation Date 
                ResponsibleById = model.ResponsibleById,             // Responsible By Id 
                RequestDate = DateTime.Now,                          // Request Date (current date)
                ApprovalDate = null,                                 // Approval Date (default null)
                DonationVolume = model.DonationVolume,               // Donation Volume
                Status = "Pending",                                  // Status (default "Pending")
                Notes = model.Notes,                                 // Notes 
                PatientCondition = model.PatientCondition            // Patient Condition
            };

            try // Attempt to add the new donation request
            {
                await _context.DonationRequests.AddAsync(donationRequest); // Add the donation request to the context
                await _context.SaveChangesAsync(); // Save changes to the database
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(ex.Message); // Return 400 Bad Request with the exception message
            }
            return Ok(new
            {
                donationRequest.DonationId, 
                donationRequest.MemberId,
                donationRequest.PeriodId,
                donationRequest.ComponentId,
                donationRequest.PreferredDonationDate,
                donationRequest.ResponsibleById,
                donationRequest.RequestDate,
                donationRequest.ApprovalDate,
                donationRequest.DonationVolume,
                donationRequest.Status,
                donationRequest.Notes,
                donationRequest.PatientCondition
            });
        }

        // update donation request status by id
        // PATCH: api/DonationRequest/updateStatus/{id}
        [HttpPatch("{id}/update-status")]
        [Authorize(Roles = "Staff,Admin")] // Only Staff and Admin can update donation requests
        public async Task<IActionResult> UpdateDonationRequestStatus(int id, [FromBody] UpdateStatusDonationRequest model)
        {
            // check existing request by DonationId
            var existingRequest = await _context.DonationRequests.FirstOrDefaultAsync(u => u.DonationId == id);
            if (existingRequest == null)
                return NotFound($"Not Found DonationRequestsId: {id}."); // Return 404 Not Found 
            // check existing member by MemberId
            var member = await _context.Members.FirstOrDefaultAsync(u => u.UserId == model.MemberId);
            if (member == null)
                return NotFound($"Not Found MembersId: {model.MemberId}."); // Return 404 Not Found 
            // check existing staff by ResponsibleById
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.UserId == model.ResponsibleById);
            if (staff == null || staff.RoleId != 2)
                return NotFound($"Not Found StaffId: {model.ResponsibleById}."); // Return 404 Not Found 

            if (existingRequest.Status == "Completed" || existingRequest.Status == "Cancelled" || existingRequest.Status == "Rejected")
                return BadRequest(); // Return 400 Bad Request 

            // Update the existing request 
            existingRequest.ResponsibleById = model.ResponsibleById;
            existingRequest.ApprovalDate = DateTime.Now;
            existingRequest.Status = model.Status;
            existingRequest.Notes = model.Notes;

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try // Attempt to update the existing request
            {
                await _context.SaveChangesAsync(); // Save changes to the database
                await transaction.CommitAsync(); // Commit the transaction

                return Ok(new { message = $"Donation Requests Id {id} updated successfully" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;  
            }
        }

        // update donation request by id
        // PATCH: api/DonationRequest/updateRequest
        [HttpPatch("{id}/update-request")]
        [Authorize(Roles = "Staff,Admin")] // Only Staff and Admin can update donation requests
        public async Task<IActionResult> UpdateDonationRequest(int id, [FromBody] UpdateDonationRequest model)
        {
            var existingRequest = await _context.DonationRequests.FirstOrDefaultAsync(u => u.DonationId == id);
            if (existingRequest == null)
                return NotFound(); // Return 404 Not Found 

            var member = await _context.Members.FirstOrDefaultAsync(u => u.UserId == model.MemberId);
            if (member == null)
                return NotFound($"Not Found MembersId: {model.MemberId}."); // Return 404 Not Found 

            // Update the status Donation request 
            existingRequest.Status = model.Status;
            _context.Entry(existingRequest).State = EntityState.Modified; // Mark the entity as modified

            // Update member's data 
            member.LastDonationDate = DateOnly.FromDateTime(DateTime.Now); // Update the member's last donation date
            member.DonationCount = (member.DonationCount ?? 0) + 1;        // Increment the donation count (+1)
            _context.Entry(member).State = EntityState.Modified;           // Mark the member entity as modified

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try 
            {
                await _context.SaveChangesAsync(); // Save changes to the database

                await transaction.CommitAsync(); // Commit the transaction
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;  
            }
            return NoContent(); // Return 204 No Content to update success
        }

        // get upcoming donation requests for member
        // GET: api/DonationRequest/upcoming/all-role
        [HttpGet("upcoming/all-role")]
        [Authorize(Roles = "Member,Staff,Admin")]
        public async Task<IActionResult> GetUpcomingDonationRequests([FromQuery] int? memberId)
        {
            // Determine caller's role and id
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            if (role == "Member")
            {
                // member chỉ được xem lịch của chính mình
                memberId = currentUserId;
            }

            var today = DateOnly.FromDateTime(DateTime.Today);

            IQueryable<DonationRequest> query = _context.DonationRequests
                .Include(dr => dr.Period)
                .Where(dr =>
                    (dr.Status == "Pending" || dr.Status == "Approved") &&
                    (
                        (dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= today) ||
                        dr.Period.PeriodDateFrom >= DateTime.Today
                    )
                );

            if (memberId.HasValue)
            {
                query = query.Where(dr => dr.MemberId == memberId.Value);
            }

            var list = await query
                .Select(dr => new
                {
                    dr.DonationId,
                    dr.MemberId,
                    dr.PreferredDonationDate,
                    dr.Status,
                    PeriodId = dr.Period.PeriodId,
                    dr.Period.PeriodName,
                    dr.Period.Location,
                    dr.Period.PeriodDateFrom,
                    dr.Period.PeriodDateTo
                })
                .ToListAsync();

            // Sắp xếp sau khi đã lấy dữ liệu để tránh lỗi dịch LINQ
            list = list.OrderBy(dr => dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : dr.PeriodDateFrom)
                       .ToList();

            return Ok(list);
        }
    }
}
