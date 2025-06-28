using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

        // get donation request history by id (Member View)
        // api/DonationRequest/{id}
        [HttpGet("{memberId}/history")]
        [Authorize(Roles = "Member")] 
        public async Task<IActionResult> GetDonationRequestHistory(int memberId)
        {
            var donationRequest = await _context.DonationRequests.FirstOrDefaultAsync( dr => dr.MemberId == memberId && dr.Status == "Completed" ); // Fetch the donation request by ID
            if (donationRequest == null)
            {
                return NotFound(); // Return 404 if not found
            }
            return Ok(donationRequest);
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
                    dr.MemberId,
                    dr.Member.User.FullName,
                    dr.Member.User.CitizenNumber,      // CitizenNumber from User instead of UserId
                    dr.Member.BloodType.BloodTypeName, // BloodTypeName from BloodType
                    dr.PeriodId,
                    dr.Period.PeriodName,
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
        public async Task<IActionResult> RegisterDonationRequests([FromBody] CreateDonationRequest model)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState); // Return 400 Bad Request if model state is invalid

            // Check if the user is authenticated and has the required role
            var member = await _context.Members.FirstOrDefaultAsync( u => u.UserId == model.MemberId ); 
            if (member == null)
                return NotFound(); // Return 404 Not Found if member not found

            // Kiểm tra member có lịch hẹn sắp tới chưa
            var today = DateOnly.FromDateTime(DateTime.Today);
            var hasUpcoming = await _context.DonationRequests
                .Include(dr => dr.Period)
                .AnyAsync(dr =>
                    dr.MemberId == member.UserId &&
                    (dr.Status == "Pending" || dr.Status == "Approved") &&
                    (
                        (dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= today) ||
                        dr.Period.PeriodDateFrom >= DateTime.Today
                    )
                );
            if (hasUpcoming)
            {
                return BadRequest("Bạn đã có lịch hẹn sắp tới, không thể đặt thêm lịch mới.");
            }
            // Add new donation request
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
                Status = "Approved",                                 // Status (default "Approved")
                Notes = model.Notes,                                 // Notes 
                PatientCondition = model.PatientCondition            // Patient Condition
            };
            var currentQuantity = await _context.BloodDonationPeriods
                .Where(p => p.PeriodId == model.PeriodId)
                .Select(p => p.CurrentQuantity)
                .FirstOrDefaultAsync(); // Get the current quantity for the period
            currentQuantity = (currentQuantity ?? 0) + 1; // Increment the current quantity by 1

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try 
            {
                await _context.DonationRequests.AddAsync(donationRequest); // Add the donation request to the context
                await _context.SaveChangesAsync();  // Save changes to the database
                await transaction.CommitAsync();    // Commit the transaction

                return Ok(new // Return 200 OK with the created donation request
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
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction if an error occurs
                throw;
            }
        }

        // update donation request status by id
        // PATCH: api/DonationRequest/updateStatus/{id}
        [HttpPatch("{id}/update-status")]
        [Authorize(Roles = "Staff,Admin")] 
        public async Task<IActionResult> UpdateDonationRequestStatus(int id, [FromBody] UpdateStatusDonationRequest model)
        {
            // check existing request (status "pending" ) by DonationId
            var existingRequest = await _context.DonationRequests.FirstOrDefaultAsync(u => u.DonationId == id && u.Status == "Pending");
            if (existingRequest == null)
                return NotFound($"Not Found DonationRequestsId: {id}."); // Return 404 Not Found 

            // check existing staff by ResponsibleById
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.UserId == model.ResponsibleById);
            if (staff == null || staff.RoleId != 2)
                return NotFound($"Not Found StaffId: {model.ResponsibleById}."); // Return 404 Not Found 

            // Update the existing request 
            existingRequest.ResponsibleById = model.ResponsibleById;
            existingRequest.ApprovalDate = DateTime.Now;
            existingRequest.Status = model.Status;
            existingRequest.Notes = model.Notes;

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try 
            {
                await _context.SaveChangesAsync();  // Save changes to the database
                await transaction.CommitAsync();    // Commit the transaction

                return Ok(new { message = $"Donation Requests Id {id} updated successfully" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();  // Rollback the transaction 
                throw;  
            }
        }

        // update donation request by id ( "Completed" status )
        // PATCH: api/DonationRequest/update-completed/{id}
        [HttpPatch("{id}/update-completed")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> CompletedDonationRequestStatus(int id, [FromBody] CompletedDonationRequest model)
        {
            var existingRequest = await _context.DonationRequests.FirstOrDefaultAsync(u => u.DonationId == id && u.Status == "Approved");
            if (existingRequest == null)
                return NotFound($"Not Found DonationRequestsId: {id}."); // Return 404 Not Found 

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

            // Add Blood Unit
            // Calculate the expiry date
            var shelfLifeDays = await _context.BloodComponents
                .Where(c => c.ComponentId == existingRequest.ComponentId)
                .Select(c => c.ShelfLifeDays)
                .FirstOrDefaultAsync();
            if (shelfLifeDays <= 0)
                return BadRequest("Invalid shelf life for the blood component."); // Return 400 Bad Request if shelf life is invalid

            var bloodUnit = new BloodUnit
            {
                BloodTypeId = member.BloodTypeId ?? 0,                  // Blood Type Id from member
                ComponentId = existingRequest.ComponentId,              // Component Id from existing request
                AddDate = DateOnly.FromDateTime(DateTime.Now),          // Add Date (current date)
                ExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(shelfLifeDays)), // Expiry Date (current date + shelf life days)
                Volume = existingRequest.DonationVolume ?? 0,           // Volume from existing request
                RemainingVolume = existingRequest.DonationVolume ?? 0,  // Remaining Volume (initially equals Volume)
                BloodStatus = "Available",                              // Blood Status (default "Available")
                MemberId = model.MemberId                               // Member Id  
            };

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try
            {
                await _context.AddAsync(bloodUnit); // Add the new blood unit to the context
                await _context.SaveChangesAsync();  // Save changes to the database
                await transaction.CommitAsync();    // Commit the transaction

                return StatusCode(201, new // Return 201 Created with success messages
                {
                    memberMessage = "Member updatd successfully.",
                    donationRequestMessage = "Donation request created successfully.",
                    bloodUnitMessage = "Blood unit added successfully.",
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;
            }
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
            
            // Kiểm tra member có lịch hẹn sắp tới chưa
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
                    dr.Period.PeriodId,
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

        // Cancel donation request by id
        // PATCH: api/DonationRequest/{id}/cancel
        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> CancelDonationRequest(int id)
        {
            // Determine caller's role and id
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var existingRequest = await _context.DonationRequests.FindAsync(id); // Fetch the donation request by ID
            if (existingRequest == null)
                return NotFound($"Not Found DonationRequestsId: {id}."); // Return 404 Not Found 

            existingRequest.Status = "Cancelled"; // Update the status to "Cancelled"
            existingRequest.Notes = "Đã hủy bởi người dùng";

            _context.Entry(existingRequest).State = EntityState.Modified; // Mark the entity as modified

            var currentQuantity = await _context.BloodDonationPeriods
                .Where(p => p.PeriodId == existingRequest.PeriodId)
                .Select(p => p.CurrentQuantity)
                .FirstOrDefaultAsync(); // Get the current quantity for the period
            currentQuantity = (currentQuantity ?? 0) - 1; // Decrement the current quantity by 1
            _context.Entry(currentQuantity).State = EntityState.Modified; // Mark the entity as modified

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try
            {
                await _context.SaveChangesAsync();  // Save changes to the database
                await transaction.CommitAsync();    // Commit the transaction
                return Ok(new { message = $"Donation Requests Id {id} cancelled successfully" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;
            }
        }
    }
}
