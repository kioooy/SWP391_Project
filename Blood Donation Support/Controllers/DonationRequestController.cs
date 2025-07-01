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

        public DonationRequestController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // get donation request history by id (Member View)
        // api/DonationRequest/history
        [HttpGet("history")]
        [Authorize(Roles = "Member,Admin")] 
        public async Task<IActionResult> GetDonationRequestHistory()
        {
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var donationRequest = await _context.DonationRequests.FirstOrDefaultAsync(dr => dr.MemberId == currentUserId);
            if (donationRequest == null)
                return NotFound(); // Return 404 if not found
            
            return Ok( await _context.DonationRequests
                .Where(dr => dr.MemberId == currentUserId)
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Period)
                .Include(dr => dr.Component)
                .Include(dr => dr.ResponsibleBy)  
                .Select(dr => new
            {
                dr.Member.User.FullName,                   // FullName from User
                dr.Member.User.CitizenNumber,              // CitizenNumber from User instead of UserId
                dr.Member.BloodType.BloodTypeName,         // BloodTypeName from BloodType
                dr.Period.PeriodName,                      // Period Name
                dr.Period.Hospital.Address,                // Period Address
                dr.Component.ComponentName,                // Component Name
                dr.PreferredDonationDate,                  // Preferred Donation Date
                ResponsibleBy = dr.ResponsibleBy.FullName, // Responsible By Full Name
                dr.DonationVolume,                         // Donation Volume
                dr.Notes,                                  // Notes 
                dr.Status,                                 // Status of the donation request
                dr.RequestDate,                            // Request Date
                dr.CompletionDate,                         // Completion Date
                dr.CancelledDate,                          // Cancelled Date
                dr.RejectedDate,                           // Rejected Date
            })
            .ToListAsync());
        }

        // get donation request by id
        // api/DonationRequest/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Staff,Admin")] // Only Staff and Admin can view donation requests by ID
        public async Task<IActionResult> GetDonationRequest(int id)
        {
            var donationRequest = await _context.DonationRequests.FindAsync(id); // Fetch the donation request by ID
            if (donationRequest == null)
                return NotFound(); // Return 404 if not found

            return Ok(await _context.DonationRequests
                .Where(dr => dr.MemberId == id)
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Period)
                .Include(dr => dr.Component)
                .Include(dr => dr.ResponsibleBy)
                .Select(dr => new
                {
                    dr.DonationId,                             // Donation Id                    
                    dr.MemberId,                               // Member Id (UserId of role the member)
                    dr.Member.User.FullName,                   // FullName from User
                    dr.Member.User.CitizenNumber,              // CitizenNumber from User instead of UserId
                    dr.Member.BloodType.BloodTypeName,         // BloodTypeName from BloodType
                    dr.PeriodId,                               // Period Id
                    dr.Period.PeriodName,                      // Period Name
                    dr.Period.Hospital.Address,                // Period Address
                    dr.ComponentId,                            // Component Id
                    dr.Component.ComponentName,                // Component Name
                    dr.PreferredDonationDate,                  // Preferred Donation Date
                    dr.ResponsibleById,                        // Responsible By Id (staff responsible)
                    ResponsibleBy = dr.ResponsibleBy.FullName, // Responsible By Full Name
                    dr.DonationVolume,                         // Donation Volume
                    dr.Notes,                                  // Notes 
                    dr.Status,                                 // Status of the donation request
                    dr.RequestDate,                            // Request Date
                    dr.CompletionDate,                         // Completion Date
                    dr.CancelledDate,                          // Cancelled Date
                    dr.RejectedDate,                           // Rejected Date                
                })
                .ToListAsync());
        }

        // get all donation requests
        // GET: api/DonationRequest/
        [HttpGet]
        [Authorize(Roles = "Staff,Admin")] // Staff and Admin roles can view all donation requests
        public async Task<IActionResult> GetAllDonationRequests()
        {
            var donationRequests = await _context.DonationRequests
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Period)
                .Include(dr => dr.Component)
                .Include(dr => dr.ResponsibleBy)
                .Select(dr => new
                {
                    dr.DonationId,                             // Donation Id                    
                    dr.MemberId,                               // Member Id (UserId of role the member)
                    dr.Member.User.FullName,                   // FullName from User
                    dr.Member.User.CitizenNumber,              // CitizenNumber from User instead of UserId
                    dr.Member.BloodType.BloodTypeName,         // BloodTypeName from BloodType
                    dr.PeriodId,                               // Period Id
                    dr.Period.PeriodName,                      // Period Name
                    dr.Period.Hospital.Address,                // Period Address
                    dr.ComponentId,                            // Component Id
                    dr.Component.ComponentName,                // Component Name
                    dr.PreferredDonationDate,                  // Preferred Donation Date
                    dr.ResponsibleById,                        // Responsible By Id (staff responsible)
                    ResponsibleBy = dr.ResponsibleBy.FullName, // Responsible By Full Name
                    dr.DonationVolume,                         // Donation Volume
                    dr.Notes,                                  // Notes 
                    dr.Status,                                 // Status of the donation request
                    dr.RequestDate,                            // Request Date
                    dr.CompletionDate,                         // Completion Date
                    dr.CancelledDate,                          // Cancelled Date
                    dr.RejectedDate,                           // Rejected Date                
                })
                .ToListAsync();

            return Ok(donationRequests);
        }

        // add donation request
        // POST: api/DonationRequest/register
        [HttpPost]
        [Authorize(Roles = "Member,Admin")]  
        public async Task<IActionResult> RegisterDonationRequests([FromBody] CreateDonationRequest model)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState); // Return 400 Bad Request if model state is invalid

            // Check if the user is authenticated and has the required role
            var member = await _context.Members.FirstOrDefaultAsync( u => u.UserId == model.MemberId ); 
            if (member == null)
                return NotFound(); // Return 404 Not Found if member not found

            // Kiểm tra member vừa truyền máu xong hoặc đang trong thời gian hồi phục
            var lastTransfusion = await _context.TransfusionRequests
                .Where(tr => tr.MemberId == member.UserId && tr.Status == "Completed")
                .OrderByDescending(tr => tr.CompletionDate)
                .FirstOrDefaultAsync();

            if (lastTransfusion != null && lastTransfusion.CompletionDate.HasValue)
            {
                var daysSinceTransfusion = (DateTime.UtcNow - lastTransfusion.CompletionDate.Value).TotalDays;
                if (daysSinceTransfusion < 180)
                {
                    return BadRequest("Bạn vừa truyền máu xong, chưa thể đăng ký hiến máu cho đến khi hồi phục đủ 180 ngày.");
                }
            }

            // Check if the member has an upcoming donation request
            var today = DateOnly.FromDateTime(DateTime.Today);
            var hasUpcoming = await _context.DonationRequests
                .Include(dr => dr.Period)
                .AnyAsync(dr => dr.MemberId == member.UserId && 
                         (dr.Status == "Pending" || dr.Status == "Approved") &&
                         ((dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= today) || dr.Period.PeriodDateFrom >= DateTime.Today));
            if (hasUpcoming)
                return BadRequest("Bạn đang có lịch hiến máu. Vui lòng hoàn thành hoặc hủy lịch trước khi đặt lịch mới!");
            
            // Add new donation request
            var donationRequest = new DonationRequest
            {
                MemberId = member.UserId,                            // Member Id ( UserId of role the member )
                PeriodId = model.PeriodId,                           // Period Id 
                ComponentId = model.ComponentId,                     // Component Id 
                PreferredDonationDate = model.PreferredDonationDate, // Preferred Donation Date 
                ResponsibleById = model.ResponsibleById,             // Responsible By Id 
                RequestDate = DateTime.Now,                          // Request Date (current date)
                DonationVolume = model.DonationVolume,               // Donation Volume
                Status = "Approved",                                 // Status (default "Approved" as per new business logic)
                Notes = model.Notes,                                 // Notes 
                PatientCondition = model.PatientCondition            // Patient Condition
            };

            // Update the current quantity for the donation period
            var period = await _context.BloodDonationPeriods
                .Where(p => p.PeriodId == model.PeriodId)
                .FirstOrDefaultAsync();
            if (period == null)
                return NotFound($"Not Found BloodDonationPeriodId: {model.PeriodId}."); // Return 404 Not Found if the period is not found
            else if (period.CurrentQuantity >= 0)
            {
                period.CurrentQuantity = (period.CurrentQuantity ?? 0) + 1; // Decrement the current quantity by 1
                _context.Entry(period).State = EntityState.Modified; // Mark the entity as modified
            }

            var transaction = await _context.Database.BeginTransactionAsync(); // Begin a new transaction
            try 
            {
                await _context.DonationRequests.AddAsync(donationRequest); // Add the donation request to the context
                await _context.SaveChangesAsync();  // Save changes to the database
                await transaction.CommitAsync();    // Commit the transaction

                return CreatedAtAction(nameof(GetDonationRequest), new { id = donationRequest.DonationId }, new // Return 201 Created with the created donation request
                {
                    donationRequest.DonationId,
                    donationRequest.MemberId,
                    donationRequest.PeriodId,
                    donationRequest.ComponentId,
                    donationRequest.PreferredDonationDate,
                    donationRequest.ResponsibleById,
                    donationRequest.RequestDate,
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
            existingRequest.CompletionDate = DateTime.Now;
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
        // Reject donation request by id
        // PATCH: api/DonationRequest/{id}/cancel
        [HttpPatch("{id}/reject")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> RejectDonationRequest(int id, string note)
        {
            // Determine caller's role and id
            var roleName = User.FindFirst(ClaimTypes.Role)?.Value; // Get the role of the user
            var name = User.FindFirst(ClaimTypes.Name)?.Value; // Get the name of the current user
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var existingRequest = await _context.DonationRequests.FindAsync(id); // Fetch the donation request by ID
            if (existingRequest == null)
                return NotFound($"Not Found DonationRequestsId: {id}."); // Return 404 Not Found 
            if (existingRequest.ResponsibleById != currentUserId)
                return BadRequest("You are not authorized to reject this request."); // Return 400 Bad Request if the user is not authorized

            existingRequest.ResponsibleById = currentUserId; // Current Staff responsible for the request
            existingRequest.RejectedDate = DateTime.Now;    // Set the cancellation date
            existingRequest.Status = "Rejected";            // Update the status to "Cancelled"
            existingRequest.Notes = $"Lý do từ chối của bác sĩ phụ trách {name}: {note}"; // Add a note indicating cancellation by the user
            _context.Entry(existingRequest).State = EntityState.Modified; // Mark the entity as modified

            // Get the current quantity for the period
            var period = await _context.BloodDonationPeriods
                .Where(p => p.PeriodId == existingRequest.PeriodId)
                .FirstOrDefaultAsync();
            if (period == null)
                return NotFound($"Not Found BloodDonationPeriodId: {existingRequest.PeriodId}."); // Return 404 Not Found if the period is not found
            else if (period.CurrentQuantity > 0)
            {
                period.CurrentQuantity = (period.CurrentQuantity ?? 0) - 1; // Decrement the current quantity by 1
                _context.Entry(period).State = EntityState.Modified; // Mark the entity as modified
            }

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

        // Cancel donation request by id
        // PATCH: api/DonationRequest/{id}/cancel
        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Member,Staff,Admin")]
        public async Task<IActionResult> CancelDonationRequest(int id)
        {
            var roleName = User.FindFirst(ClaimTypes.Role)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var existingRequest = await _context.DonationRequests.FindAsync(id);
            if (existingRequest == null)
                return NotFound($"Not Found DonationRequestsId: {id}."); // Return 404 Not Found 

            existingRequest.CancelledDate = DateTime.Now;    // Set the cancellation date
            existingRequest.Status = "Cancelled";            // Update the status to "Cancelled"
            existingRequest.Notes = $"Hủy Lịch";             // Custom Note indicating cancellation by the user
            _context.Entry(existingRequest).State = EntityState.Modified; // Mark the entity as modified

            // Get the current quantity for the period
            var period = await _context.BloodDonationPeriods
                .Where(p => p.PeriodId == existingRequest.PeriodId)
                .FirstOrDefaultAsync();
            if (period == null)
                return NotFound($"Not Found BloodDonationPeriodId: {existingRequest.PeriodId}."); // Return 404 Not Found if the period is not found
            else if(period.CurrentQuantity > 0)
            {
                period.CurrentQuantity = (period.CurrentQuantity ?? 0) - 1; // Decrement the current quantity by 1
                _context.Entry(period).State = EntityState.Modified; // Mark the entity as modified
            }

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = $"Donation Requests Id {id} cancelled successfully" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        //---Quý Coding Support---

        // Cập nhật donation request (sắp tới) theo role
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
                    (dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= today) ||
                    dr.Period.PeriodDateFrom >= DateTime.Today
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
                    dr.Period.Hospital.Name,
                    dr.Period.PeriodDateFrom,
                    dr.Period.PeriodDateTo,
                    dr.RequestDate
                })
                .ToListAsync();

            // Sắp xếp sau khi đã lấy dữ liệu để tránh lỗi dịch LINQ
            list = list.OrderBy(dr => dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : dr.PeriodDateFrom)
                       .ToList();

            return Ok(list);
        }

    }
}
