using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
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
                PeriodName = dr.Period != null ? dr.Period.PeriodName : "Hiến máu khẩn cấp", // Period Name hoặc "Hiến máu khẩn cấp"
                PeriodAddress = dr.Period != null ? dr.Period.Hospital.Address : "Bệnh viện Truyền máu Huyết học", // Period Address hoặc địa chỉ mặc định
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
                dr.PatientCondition,                       // Patient Condition
                dr.IsUrgent,                               // Is Urgent
                dr.UrgentRequestId,                        // Urgent Request Id
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
                    dr.PatientCondition,                       // Patient Condition
                    dr.IsUrgent,                               // Is Urgent
                    dr.UrgentRequestId,                        // Urgent Request Id
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
                    dr.PatientCondition,                       // Patient Condition
                    dr.IsUrgent,                               // Is Urgent
                    dr.UrgentRequestId,                        // Urgent Request Id
                })
                .ToListAsync();

            return Ok(donationRequests);
        }

        // get urgent donation requests
        // GET: api/DonationRequest/urgent
        [HttpGet("urgent")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetUrgentDonationRequests()
        {
            var urgentDonationRequests = await _context.DonationRequests
                .Where(dr => dr.IsUrgent == true)
                .Include(dr => dr.Member)
                    .ThenInclude(m => m.User)
                .Include(dr => dr.Component)
                .Include(dr => dr.ResponsibleBy)
                .AsNoTracking()
                .ToListAsync();

            return Ok(urgentDonationRequests.Select(dr => new
            {
                dr.DonationId,
                dr.MemberId,
                dr.Member.User.FullName,
                dr.Member.User.CitizenNumber,
                dr.Member.BloodType.BloodTypeName,
                dr.Component.ComponentName,
                dr.PreferredDonationDate,
                ResponsibleBy = dr.ResponsibleBy.FullName,
                dr.DonationVolume,
                dr.Notes,
                dr.Status,
                dr.RequestDate,
                dr.CompletionDate,
                dr.CancelledDate,
                dr.RejectedDate,
                dr.PatientCondition,
                dr.IsUrgent,
                dr.UrgentRequestId,
                dr.IsActive
            }));
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
            if(member.LastDonationDate != null && member.LastDonationDate > DateOnly.FromDateTime(DateTime.Now.AddDays(-84)))
                return BadRequest("Bạn cần đợi ít nhất 84 ngày (12 tuần) kể từ lần hiến máu gần nhất để đặt lịch hẹn mới."); // Return 400 Bad Request if last donation date is less than 84 days ago

            // Kiểm tra member vừa truyền máu xong hoặc đang trong thời gian hồi phục
            var lastTransfusion = await _context.TransfusionRequests
                .Where(tr => tr.MemberId == member.UserId && tr.Status == "Completed")
                .OrderByDescending(tr => tr.CompletionDate)
                .FirstOrDefaultAsync();

            if (lastTransfusion != null && lastTransfusion.CompletionDate.HasValue)
            {
                var daysSinceTransfusion = (DateTime.Now - lastTransfusion.CompletionDate.Value).TotalDays;
                if (daysSinceTransfusion < 365)
                {
                    return BadRequest("Bạn vừa truyền máu xong, chưa thể đăng ký hiến máu cho đến khi hồi phục đủ 365 ngày.");
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
                Status = "Pending",                                  // Status (default "Pending" as per new business logic)
                Notes = model.Notes,                                 // Notes 
                PatientCondition = model.PatientCondition            // Patient Condition
            };

            // Update the current quantity for the donation period
            var period = await _context.BloodDonationPeriods
                .Where(p => p.PeriodId == model.PeriodId)
                .FirstOrDefaultAsync();
            if (period == null)
                return NotFound($"Không Tìm Thấy Mã Đợt Hiến Máu: {model.PeriodId}."); // Return 404 Not Found if the period is not found
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
                    donationRequest.PatientCondition,
                    donationRequest.IsUrgent,
                    donationRequest.UrgentRequestId
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction if an error occurs
                throw;
            }
        }

        // add urgent donation request
        // POST: api/DonationRequest/register-urgent
        [HttpPost("register-urgent")]
        [Authorize(Roles = "Member,Admin")]  
        public async Task<IActionResult> RegisterUrgentDonationRequest([FromBody] CreateUrgentDonationRequest model)
        {
            if (!ModelState.IsValid) 
                return BadRequest(ModelState);

            // Check if the user is authenticated and has the required role
            var member = await _context.Members.FirstOrDefaultAsync(u => u.UserId == model.MemberId); 
            if (member == null)
                return NotFound("Không tìm thấy thành viên.");

            // Kiểm tra điều kiện hiến máu (84 ngày sau lần hiến gần nhất)
            if (member.LastDonationDate != null && member.LastDonationDate > DateOnly.FromDateTime(DateTime.Now.AddDays(-84)))
                return BadRequest("Bạn cần đợi ít nhất 84 ngày (12 tuần) kể từ lần hiến máu gần nhất để đặt lịch hẹn mới.");

            // Kiểm tra member vừa truyền máu xong hoặc đang trong thời gian hồi phục
            var lastTransfusion = await _context.TransfusionRequests
                .Where(tr => tr.MemberId == member.UserId && tr.Status == "Completed")
                .OrderByDescending(tr => tr.CompletionDate)
                .FirstOrDefaultAsync();

            if (lastTransfusion != null && lastTransfusion.CompletionDate.HasValue)
            {
                var daysSinceTransfusion = (DateTime.Now - lastTransfusion.CompletionDate.Value).TotalDays;
                if (daysSinceTransfusion < 365)
                {
                    return BadRequest("Bạn vừa truyền máu xong, chưa thể đăng ký hiến máu cho đến khi hồi phục đủ 365 ngày.");
                }
            }

            // Kiểm tra xem có yêu cầu khẩn cấp tồn tại không (nếu có UrgentRequestId)
            if (model.UrgentRequestId.HasValue)
            {
                var urgentRequest = await _context.UrgentBloodRequests
                    .FirstOrDefaultAsync(ubr => ubr.UrgentRequestId == model.UrgentRequestId.Value);
                if (urgentRequest == null)
                    return NotFound("Không tìm thấy yêu cầu khẩn cấp.");
            }

            // Kiểm tra xem member có lịch hiến máu sắp tới không (chỉ kiểm tra hiến máu thường, không kiểm tra hiến máu khẩn)
            var today = DateOnly.FromDateTime(DateTime.Today);
            var hasUpcomingRegular = await _context.DonationRequests
                .Include(dr => dr.Period)
                .AnyAsync(dr => dr.MemberId == member.UserId && 
                         dr.IsUrgent == false && // Chỉ kiểm tra hiến máu thường
                         (dr.Status == "Pending" || dr.Status == "Approved") &&
                         ((dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= today) || 
                          (dr.Period != null && dr.Period.PeriodDateFrom >= DateTime.Today)));
            
            if (hasUpcomingRegular)
                return BadRequest("Bạn đang có lịch hiến máu thường. Vui lòng hoàn thành hoặc hủy lịch trước khi đặt lịch hiến máu khẩn cấp!");

            // Tạo donation request khẩn cấp
            var urgentDonationRequest = new DonationRequest
            {
                MemberId = member.UserId,
                PeriodId = null, // Không thuộc đợt hiến máu nào (NULL cho hiến máu khẩn cấp)
                ComponentId = model.ComponentId,
                PreferredDonationDate = null, // Không cần ngày cụ thể cho hiến máu khẩn cấp
                ResponsibleById = model.ResponsibleById,
                RequestDate = DateTime.Now,
                DonationVolume = model.DonationVolume,
                Status = "Pending",
                Notes = model.Notes,
                PatientCondition = model.PatientCondition,
                IsUrgent = true, // Đánh dấu là hiến máu khẩn cấp
                UrgentRequestId = model.UrgentRequestId, // Liên kết với yêu cầu khẩn cấp (nếu có)
                IsActive = true
            };

            var transaction = await _context.Database.BeginTransactionAsync();
            try 
            {
                await _context.DonationRequests.AddAsync(urgentDonationRequest);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Tạo thông báo cho Admin/Staff về hiến máu khẩn cấp mới
                var adminRoleId = await _context.Roles.Where(r => r.Name == "Admin").Select(r => r.RoleId).FirstOrDefaultAsync();
                var staffRoleId = await _context.Roles.Where(r => r.Name == "Staff").Select(r => r.RoleId).FirstOrDefaultAsync();

                var adminStaffUsers = await _context.Users
                    .Where(u => u.RoleId == adminRoleId || u.RoleId == staffRoleId)
                    .Select(u => u.UserId)
                    .ToListAsync();

                foreach (var userId in adminStaffUsers)
                {
                    var notification = new Notification
                    {
                        UserId = userId,
                        Title = "Đăng ký hiến máu khẩn cấp mới",
                        Message = $"Có một đăng ký hiến máu khẩn cấp mới từ {member.User.FullName}. ID đăng ký: {urgentDonationRequest.DonationId}. Vui lòng kiểm tra và xử lý ngay lập tức.",
                        NotificationType = "UrgentDonationRequest",
                        CreatedAt = DateTime.Now,
                        IsActive = true,
                        IsRead = false
                    };
                    _context.Notifications.Add(notification);
                }
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDonationRequest), new { id = urgentDonationRequest.DonationId }, new
                {
                    urgentDonationRequest.DonationId,
                    urgentDonationRequest.MemberId,
                    urgentDonationRequest.PeriodId,
                    urgentDonationRequest.ComponentId,
                    urgentDonationRequest.ResponsibleById,
                    urgentDonationRequest.RequestDate,
                    urgentDonationRequest.DonationVolume,
                    urgentDonationRequest.Status,
                    urgentDonationRequest.Notes,
                    urgentDonationRequest.PatientCondition,
                    urgentDonationRequest.IsUrgent,
                    urgentDonationRequest.UrgentRequestId,
                    urgentDonationRequest.IsActive
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
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
                return NotFound($"Không Tìm Thấy Mã Yêu Cầu Hiến Máu: {id}."); // Return 404 Not Found 

            var member = await _context.Members.FirstOrDefaultAsync(u => u.UserId == model.MemberId);
            if (member == null)
                return NotFound($"Không Tìm Thấy Mã Người Dùng: {model.MemberId}."); // Return 404 Not Found 

            var period = _context.BloodDonationPeriods.FirstOrDefault(p => p.PeriodId == existingRequest.PeriodId);
            if (DateTime.Now < period.PeriodDateFrom || DateTime.Now > period.PeriodDateTo)
                return BadRequest($"Chưa tới thời gian diễn ra đợt hiến máu");

            // Update the status Donation request 
            existingRequest.Status = model.Status;
            existingRequest.CompletionDate = DateTime.Now;
            _context.Entry(existingRequest).State = EntityState.Modified; // Mark the entity as modified

            // Update member's data 
            member.LastDonationDate = DateOnly.FromDateTime(DateTime.Now); // Update the member's last donation date
            member.DonationCount = (member.DonationCount ?? 0) + 1;        // Increment the donation count (+1)
            member.RecoveryDueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(90)); // Set the recovery due date 90 days/12 week later))
            _context.Entry(member).State = EntityState.Modified;           // Mark the member entity as modified

            // Add Blood Unit
            // Calculate the expiry date
            var shelfLifeDays = await _context.BloodComponents
                .Where(c => c.ComponentId == existingRequest.ComponentId)
                .Select(c => c.ShelfLifeDays)
                .FirstOrDefaultAsync();
            if (shelfLifeDays <= 0)
                return BadRequest("Hạn sử dụng của chế phẩm máu không hợp lệ."); // Return 400 Bad Request if shelf life is invalid

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
                    memberMessage = "Cập nhật thành viên thành công.",
                    donationRequestMessage = "Đã tạo yêu cầu hiến máu thành công.",
                    bloodUnitMessage = "Đã thêm đơn vị máu thành công.",
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;
            }
        }

        // approved donation request by id
        // PATCH: api/DonationRequest/{id}/approved
        [HttpPatch("{id}/approved")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> ApprovedDonationRequest(int id, string note)
        {
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var existingRequest = await _context.DonationRequests.FindAsync(id);
            if (existingRequest == null)
                return NotFound($"Không Tìm Thấy Mã Yêu Cầu Hiến Máu: {id}.");

            existingRequest.ResponsibleById = currentUserId;
            existingRequest.ApprovalDate = DateTime.Now;
            existingRequest.Status = "Approved";

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã Cho Phép Yêu Cầu Hiến Máu: {id} Thành Công" });
        }

        // Reject donation request by id
        // PATCH: api/DonationRequest/{id}/reject
        [HttpPatch("{id}/reject")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> RejectDonationRequest(int id, string note)
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var existingRequest = await _context.DonationRequests.FindAsync(id);
            if (existingRequest == null)
                return NotFound($"Không Tìm Thấy Mã Yêu Cầu Hiến Máu: {id}.");

            existingRequest.ResponsibleById = currentUserId;
            existingRequest.RejectedDate = DateTime.Now;
            existingRequest.Status = "Rejected";
            existingRequest.Notes = $"Lý do từ chối của nhân viên y tế phụ trách {name}: {note}";
            existingRequest.PatientCondition = "Rejected";
            _context.Entry(existingRequest).State = EntityState.Modified;

            // Chỉ cập nhật Period nếu không phải hiến máu khẩn cấp
            if (!existingRequest.IsUrgent && existingRequest.PeriodId.HasValue)
            {
                var period = await _context.BloodDonationPeriods
                    .Where(p => p.PeriodId == existingRequest.PeriodId)
                    .FirstOrDefaultAsync();
                if (period != null && period.CurrentQuantity > 0)
                {
                    period.CurrentQuantity = (period.CurrentQuantity ?? 0) - 1;
                    _context.Entry(period).State = EntityState.Modified;
                }
            }

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = $"Đã Hủy Yêu Cầu Hiến Máu ID: {id} Thành Công" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Cancel donation request by id
        // PATCH: api/DonationRequest/{id}/cancel
        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Member,Admin")]
        public async Task<IActionResult> CancelDonationRequest(int id)
        {
            var roleName = User.FindFirst(ClaimTypes.Role)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var existingRequest = await _context.DonationRequests.FindAsync(id);
            if (existingRequest == null)
                return NotFound($"Không Tìm Thấy Mã Yêu Cầu Hiến Máu: {id}.");

            existingRequest.CancelledDate = DateTime.Now;
            if (roleName == "Member")
            {
                existingRequest.Status = "Cancelled";
                existingRequest.Notes = "Đã hủy bởi người dùng";
            }
            _context.Entry(existingRequest).State = EntityState.Modified;

            // Chỉ cập nhật Period nếu không phải hiến máu khẩn cấp
            if (!existingRequest.IsUrgent && existingRequest.PeriodId.HasValue)
            {
                var period = await _context.BloodDonationPeriods
                    .Where(p => p.PeriodId == existingRequest.PeriodId)
                    .FirstOrDefaultAsync();
                if (period != null && period.CurrentQuantity > 0)
                {
                    period.CurrentQuantity = (period.CurrentQuantity ?? 0) - 1;
                    _context.Entry(period).State = EntityState.Modified;
                }
            }

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = $"Đã hủy yêu cầu hiến máu ID: {id} thành công" });
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // Check for expired donation requests
        // PATCH: api/DonationRequest/expired_check
        [HttpPatch("expired_check")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> ExpiredDonationRequestcheck()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentDate = DateOnly.FromDateTime(DateTime.Now);
            // Find donation requests that have expired (preferred date in past) but haven't been completed, cancelled or rejected
            // Chỉ xử lý hiến máu thường, không xử lý hiến máu khẩn cấp
            var expiredRequests = await _context.DonationRequests
                .Where(dr => dr.IsUrgent == false && dr.PreferredDonationDate < currentDate && ( dr.Status == "Approved" || dr.Status == "Pending"))
                .ToListAsync();

            if (expiredRequests.Count == 0)
                return NoContent();

            // Update all expired requests
            foreach (var request in expiredRequests)
            {
                request.Status = "Cancelled";
                request.Notes = $"Hệ thống tự động hủy đơn do quá hạn đợt hiến máu ({request.PreferredDonationDate}).";
                _context.Entry(request).State = EntityState.Modified;
            }

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction if an error occurs
                throw;
            }
        }

        //---Quý Coding---

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

            // Kiểm tra member có lịch hẹn sắp tới chưa (chỉ hiến máu thường, không bao gồm hiến máu khẩn cấp)
            var today = DateOnly.FromDateTime(DateTime.Today);

            IQueryable<DonationRequest> query = _context.DonationRequests
                .Include(dr => dr.Period)
                .Where(dr => dr.IsUrgent == false) // Chỉ lấy hiến máu thường
                .Where(dr =>
                    (dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= today) ||
                    dr.Period.PeriodDateFrom >= DateTime.Today
                );

            if (memberId.HasValue)
            {
                query = query.Where(dr => dr.MemberId == memberId.Value);
            }

            var result = await query
                .Select(dr => new {
                    dr.DonationId,
                    dr.Status,
                    dr.PreferredDonationDate,
                    dr.Period.PeriodName,
                    dr.Period.Hospital.Name,
                    dr.Period.PeriodDateFrom,
                    dr.Period.PeriodDateTo,
                    dr.RequestDate,
                    DonationVolume = dr.DonationVolume,
                    MemberBloodType = dr.Member.BloodType.BloodTypeName
                })
                .ToListAsync();

            // Sắp xếp sau khi đã lấy dữ liệu để tránh lỗi dịch LINQ
            result = result.OrderBy(dr => dr.PreferredDonationDate.HasValue ? dr.PreferredDonationDate.Value.ToDateTime(TimeOnly.MinValue) : dr.PeriodDateFrom)
                       .ToList();

            return Ok(result);
        }

    }
}
