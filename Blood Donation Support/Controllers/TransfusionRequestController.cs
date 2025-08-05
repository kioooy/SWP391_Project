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
    public class TransfusionRequestController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public TransfusionRequestController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        [HttpGet("my-history")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> GetMyTransfusionHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == int.Parse(userId));
            if (member == null) return NotFound("Member not found.");
            var history = await _context.TransfusionRequests
                .Where(tr => tr.MemberId == member.UserId)
                .Include(tr => tr.BloodType)
                .Include(tr => tr.Component)
                .OrderByDescending(tr => tr.RequestDate)
                .Select(tr => new {
                    tr.TransfusionId,
                    tr.BloodType.BloodTypeName,
                    tr.Component.ComponentName,
                    tr.TransfusionVolume,
                    tr.Status,
                    tr.RequestDate,
                    tr.ApprovalDate,
                    tr.CompletionDate,
                    tr.CancelledDate,
                    tr.Notes,
                    tr.PatientCondition
                })
                .ToListAsync();
            return Ok(history);
        }

        // POST: api/TransfusionRequest (Tạo mới yêu cầu truyền máu - flow thường)
        [HttpPost]
        [Authorize(Roles = "Member,Staff,Admin")]
        public async Task<IActionResult> CreateTransfusionRequest([FromBody] CreateTransfusionRequestDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized("User is not authenticated.");
            }

            var responsibleUser = await _context.Users.FindAsync(int.Parse(userId));
            if (responsibleUser == null)
            {
                return Forbid("Authenticated user not found.");
            }

            // Nếu là recipient thì lấy MemberId từ user hiện tại
            var isMember = User.IsInRole("Member");
            int memberId;
            if (isMember)
            {
                var memberEntity = await _context.Members.FirstOrDefaultAsync(m => m.UserId == responsibleUser.UserId);
                if (memberEntity == null)
                {
                    return NotFound("Member not found for this recipient user.");
                }
                if (memberEntity.IsRecipient != true)
                {
                    return Forbid("Only recipients can create a transfusion request.");
                }
                memberId = memberEntity.UserId;
            }
            else
            {
                memberId = model.MemberId;
            }

            var member = await _context.Members.FindAsync(memberId);
            if (member == null)
            {
                return NotFound($"Member with ID {memberId} not found.");
            }
            // Khi tạo yêu cầu truyền máu mới, gán IsRecipient = true
            member.IsRecipient = true;

            // Cập nhật nhóm máu nếu bệnh nhân chưa biết nhóm máu
            if (member.BloodTypeId == 99 && model.BloodTypeId != 99)
            {
                member.BloodTypeId = model.BloodTypeId;
            }
            _context.Members.Update(member);
            
            var bloodType = await _context.BloodTypes.FindAsync(model.BloodTypeId);
            if (bloodType == null)
            {
                return NotFound($"BloodType with ID {model.BloodTypeId} not found.");
            }

            var component = await _context.BloodComponents.FindAsync(model.ComponentId);
            if (component == null)
            {
                return NotFound($"BloodComponent with ID {model.ComponentId} not found.");
            }

            var transfusionRequest = new TransfusionRequest
            {
                MemberId = memberId,
                BloodTypeId = model.BloodTypeId,
                ComponentId = model.ComponentId,
                ResponsibleById = responsibleUser.UserId,
                IsEmergency = model.IsEmergency,
                TransfusionVolume = model.TransfusionVolume,
                PreferredReceiveDate = model.PreferredReceiveDate,
                RequestDate = DateTime.Now,
                Status = "Pending",
                Notes = model.Notes,
                PatientCondition = model.PatientCondition
            };

            await _context.TransfusionRequests.AddAsync(transfusionRequest);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTransfusionRequestById), new { id = transfusionRequest.TransfusionId }, new {
                transfusionRequest.TransfusionId,
                transfusionRequest.MemberId,
                transfusionRequest.BloodTypeId,
                transfusionRequest.ComponentId,
                transfusionRequest.ResponsibleById,
                transfusionRequest.IsEmergency,
                transfusionRequest.TransfusionVolume,
                transfusionRequest.PreferredReceiveDate,
                transfusionRequest.RequestDate,
                transfusionRequest.Status,
                transfusionRequest.Notes,
                transfusionRequest.PatientCondition
            });
        }

        // GET: api/TransfusionRequest
        [HttpGet]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetAllTransfusionRequests()
        {
            var transfusionRequests = await _context.TransfusionRequests
                .Include(tr => tr.Member).ThenInclude(m => m.User)
                .Include(tr => tr.BloodType)
                .Include(tr => tr.Component)
                .Select(tr => new
                {
                    tr.TransfusionId,
                    tr.MemberId,
                    tr.Member.User.FullName,
                    Weight = tr.Member.Weight,
                    Height = tr.Member.Height,
                    tr.BloodTypeId,
                    tr.BloodType.BloodTypeName,
                    tr.ComponentId,
                    tr.Component.ComponentName,
                    tr.ResponsibleById,
                    ResponsibleByName = tr.ResponsibleBy != null ? tr.ResponsibleBy.FullName : null,
                    tr.IsEmergency,
                    tr.TransfusionVolume,
                    tr.PreferredReceiveDate,
                    tr.RequestDate,
                    tr.ApprovalDate,
                    tr.CompletionDate,
                    tr.CancelledDate,
                    tr.RejectedDate,
                    tr.Status,
                    tr.Notes,
                    tr.PatientCondition
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(transfusionRequests);
        }

        // GET: api/TransfusionRequest/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Staff,Admin,Member")]
        public async Task<IActionResult> GetTransfusionRequestById(int id)
        {
            var transfusionRequest = await _context.TransfusionRequests
                .Include(tr => tr.Member).ThenInclude(m => m.User)
                .Include(tr => tr.BloodType)
                .Include(tr => tr.Component)
                .Where(tr => tr.TransfusionId == id)
                .Select(tr => new
                {
                    tr.TransfusionId,
                    tr.MemberId,
                    tr.Member.User.FullName,
                    Weight = tr.Member.Weight,
                    Height = tr.Member.Height,
                    tr.BloodTypeId,
                    tr.BloodType.BloodTypeName,
                    tr.ComponentId,
                    tr.Component.ComponentName,
                    tr.ResponsibleById,
                    ResponsibleByName = tr.ResponsibleBy != null ? tr.ResponsibleBy.FullName : null,
                    tr.IsEmergency,
                    tr.TransfusionVolume,
                    tr.PreferredReceiveDate,
                    tr.RequestDate,
                    tr.ApprovalDate,
                    tr.CompletionDate,
                    tr.CancelledDate,
                    tr.RejectedDate,
                    tr.Status,
                    tr.Notes,
                    tr.PatientCondition,
                    // Thêm danh sách các đơn vị máu đã truyền/gán cho yêu cầu này
                    BloodUnits = tr.TransfusionRequestBloodUnits.Select(trbu => new {
                        trbu.BloodUnitId,
                        trbu.AssignedVolume,
                        trbu.Status,
                        trbu.AssignedDate,
                        BloodUnit = new {
                            trbu.BloodUnit.BloodTypeId,
                            BloodTypeName = trbu.BloodUnit.BloodType.BloodTypeName,
                            trbu.BloodUnit.ComponentId,
                            ComponentName = trbu.BloodUnit.Component.ComponentName,
                            trbu.BloodUnit.ExpiryDate,
                            trbu.BloodUnit.BloodStatus,
                            trbu.BloodUnit.RemainingVolume
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (transfusionRequest == null)
            {
                return NotFound();
            }

            // Tùy chọn: Thêm logic để đảm bảo thành viên chỉ có thể xem yêu cầu của chính họ
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            if (userRole == "Member" && transfusionRequest.MemberId.ToString() != userId)
            {
                return Forbid();
            }

            return Ok(transfusionRequest);
        }

        // Thêm class input cho API duyệt nhiều túi máu
        public class ApproveTransfusionRequestInput
        {
            public List<BloodUnitUsage> BloodUnits { get; set; }
            public string? Notes { get; set; }
        }
        public class BloodUnitUsage
        {
            public int BloodUnitId { get; set; }
            public int VolumeUsed { get; set; }
        }

        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> ApproveTransfusionRequest(int id, [FromBody] ApproveTransfusionRequestInput model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfusionRequest = await _context.TransfusionRequests
                    .Include(tr => tr.BloodType)
                    .Include(tr => tr.Component)
                    .FirstOrDefaultAsync(tr => tr.TransfusionId == id);
                if (transfusionRequest == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Transfusion request with ID {id} not found.");
                }
                if (transfusionRequest.Status != "Pending")
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Request {id} is not in 'Pending' state and cannot be approved.");
                }
                int totalVolume = model.BloodUnits.Sum(bu => bu.VolumeUsed);
                // Kiểm tra tổng thể tích các túi máu không đủ nhu cầu thực tế
                if (totalVolume < transfusionRequest.TransfusionVolume)
                {
                    await transaction.RollbackAsync();
                    return BadRequest("Tổng thể tích các túi máu không đủ!");
                }
                // Kiểm tra tổng thể tích các túi máu vượt quá nhu cầu thực tế
                if (totalVolume > transfusionRequest.TransfusionVolume)
                {
                    await transaction.RollbackAsync();
                    return BadRequest("Tổng thể tích các túi máu vượt quá nhu cầu thực tế!");
                }
                // Lấy danh sách BloodUnit từ DB
                var bloodUnitIds = model.BloodUnits.Select(bu => bu.BloodUnitId).ToList();
                var bloodUnits = await _context.BloodUnits.Where(bu => bloodUnitIds.Contains(bu.BloodUnitId)).ToListAsync();
                // Kiểm tra từng túi máu
                foreach (var buUsage in model.BloodUnits)
                {
                    var bloodUnit = bloodUnits.FirstOrDefault(bu => bu.BloodUnitId == buUsage.BloodUnitId);
                    if (bloodUnit == null) { await transaction.RollbackAsync(); return BadRequest($"Không tìm thấy túi máu {buUsage.BloodUnitId}"); }
                    if (bloodUnit.RemainingVolume < buUsage.VolumeUsed) { await transaction.RollbackAsync(); return BadRequest($"Túi máu {buUsage.BloodUnitId} không đủ thể tích!"); }
                    if (bloodUnit.BloodStatus != "Available") { await transaction.RollbackAsync(); return BadRequest($"Túi máu {buUsage.BloodUnitId} không sẵn sàng!"); }
                    if (bloodUnit.ExpiryDate < DateOnly.FromDateTime(DateTime.Now)) { await transaction.RollbackAsync(); return BadRequest($"Túi máu {buUsage.BloodUnitId} đã hết hạn!"); }
                    // Kiểm tra tương thích dựa vào bảng BloodCompatibilityRules
                    bool isCompatible = await _context.BloodCompatibilityRules.AnyAsync(rule =>
                        rule.BloodGiveId == bloodUnit.BloodTypeId &&
                        rule.BloodRecieveId == transfusionRequest.BloodTypeId &&
                        rule.IsCompatible == true &&
                        rule.ComponentId == transfusionRequest.ComponentId
                    );
                    if (!isCompatible)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Túi máu {buUsage.BloodUnitId} không tương thích với người nhận!");
                    }
                }
                // Đặt chỗ máu: chỉ cập nhật trạng thái máu thành Reserved, không trừ volume
                foreach (var buUsage in model.BloodUnits)
                {
                    var bloodUnit = bloodUnits.First(bu => bu.BloodUnitId == buUsage.BloodUnitId);
                    bloodUnit.BloodStatus = "Reserved";
                    _context.BloodUnits.Update(bloodUnit);
                    // Tạo bản ghi liên kết trong bảng TransfusionRequestBloodUnits với trạng thái Assigned
                    _context.Add(new TransfusionRequestBloodUnit
                    {
                        TransfusionRequestId = id,
                        BloodUnitId = buUsage.BloodUnitId,
                        AssignedVolume = buUsage.VolumeUsed,
                        AssignedDate = DateTime.Now,
                        Status = "Assigned"
                    });
                }
                transfusionRequest.Status = "Approved";
                transfusionRequest.Notes = model.Notes;
                transfusionRequest.ApprovalDate = DateTime.Now;
                _context.TransfusionRequests.Update(transfusionRequest);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Yêu cầu truyền máu đã được duyệt và máu đã được đặt chỗ." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Đã xảy ra lỗi nội bộ: {ex.Message} {(ex.InnerException != null ? ex.InnerException.Message : "")}");
            }
        }

        [HttpPatch("{id}/complete")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> CompleteTransfusionRequest(int id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfusionRequest = await _context.TransfusionRequests.FindAsync(id);
                if (transfusionRequest == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Transfusion request with ID {id} not found.");
                }

                if (transfusionRequest.Status != "Approved" && transfusionRequest.Status != "Completed")
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Yêu cầu {id} không ở trạng thái 'Approved' hoặc 'Completed' và không thể hoàn thành.");
                }

                // Lấy các bản ghi liên kết máu đã đặt chỗ cho yêu cầu này
                var assignedUnits = await _context.TransfusionRequestBloodUnits
                    .Where(trbu => trbu.TransfusionRequestId == id && trbu.Status == "Assigned")
                    .ToListAsync();

                // Chỉ thực hiện cập nhật nếu còn bản ghi liên kết ở trạng thái Assigned
                if (assignedUnits.Count > 0)
                {
                foreach (var assigned in assignedUnits)
                {
                    var bloodUnit = await _context.BloodUnits.FindAsync(assigned.BloodUnitId);
                    if (bloodUnit == null)
                    {
                        await transaction.RollbackAsync();
                        return StatusCode(500, $"Lỗi không nhất quán dữ liệu: Không tìm thấy đơn vị máu đã được đặt trước với ID {assigned.BloodUnitId}.");
                    }
                    // Trừ thể tích truyền khỏi thể tích còn lại
                    bloodUnit.RemainingVolume -= assigned.AssignedVolume;
                    if (bloodUnit.RemainingVolume > 0)
                    {
                        bloodUnit.BloodStatus = "Available";
                    }
                    else
                    {
                        bloodUnit.BloodStatus = "Used";
                        bloodUnit.RemainingVolume = 0;
                    }
                    _context.BloodUnits.Update(bloodUnit);
                    // Cập nhật trạng thái bản ghi liên kết thành Used
                    assigned.Status = "Used";
                    _context.TransfusionRequestBloodUnits.Update(assigned);
                }
                }

                // Cập nhật trạng thái Yêu cầu Truyền máu
                transfusionRequest.Status = "Completed";
                transfusionRequest.CompletionDate = DateTime.Now;
                _context.TransfusionRequests.Update(transfusionRequest);

                var member = await _context.Members.FindAsync(transfusionRequest.MemberId);
                if (member != null)
                {
                    var stillNeedsBlood = await _context.TransfusionRequests
                        .AnyAsync(tr => tr.MemberId == member.UserId && (tr.Status == "Pending" || tr.Status == "Approved"));
                    member.IsRecipient = stillNeedsBlood;
                    _context.Members.Update(member);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = $"Yêu cầu truyền máu {id} đã được hoàn thành và kho đã được cập nhật." });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Đã xảy ra lỗi nội bộ trong quá trình hoàn thành.");
            }
        }

        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> CancelTransfusionRequest(int id)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfusionRequest = await _context.TransfusionRequests.FindAsync(id);
                if (transfusionRequest == null)
                {
                    await transaction.RollbackAsync();
                    return NotFound($"Transfusion request with ID {id} not found.");
                }

                if (transfusionRequest.Status == "Completed" || transfusionRequest.Status == "Cancelled")
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Request {id} is already '{transfusionRequest.Status}' and cannot be cancelled.");
                }

                var originalStatus = transfusionRequest.Status;
                transfusionRequest.Status = "Cancelled";
                transfusionRequest.CancelledDate = DateTime.Now;
                _context.TransfusionRequests.Update(transfusionRequest);

                // Nếu yêu cầu đã được phê duyệt, chúng ta cần giải phóng các túi máu đã gán
                if (originalStatus == "Approved")
                {
                    // Tìm tất cả túi máu đã gán cho yêu cầu này
                    var assignedBloodUnits = await _context.TransfusionRequestBloodUnits
                        .Where(trbu => trbu.TransfusionRequestId == id && trbu.Status == "Assigned")
                        .ToListAsync();

                    foreach (var assignedUnit in assignedBloodUnits)
                    {
                        // Cập nhật trạng thái liên kết
                        assignedUnit.Status = "Cancelled";
                        assignedUnit.Notes = $"Yêu cầu truyền máu {id} đã bị hủy, túi máu được hoàn trả lại kho.";
                        _context.TransfusionRequestBloodUnits.Update(assignedUnit);

                        // Hoàn trả thể tích cho túi máu
                        var bloodUnit = await _context.BloodUnits.FindAsync(assignedUnit.BloodUnitId);
                        if (bloodUnit != null)
                        {
                            bloodUnit.RemainingVolume += assignedUnit.AssignedVolume;
                            bloodUnit.BloodStatus = "Available";
                            _context.BloodUnits.Update(bloodUnit);
                        }
                    }
                }
                
                var member = await _context.Members.FindAsync(transfusionRequest.MemberId);
                if (member != null)
                {
                    // Khi hủy yêu cầu truyền máu, kiểm tra member còn yêu cầu truyền máu nào chưa hoàn thành không
                    var stillNeedsBlood = await _context.TransfusionRequests
                        .AnyAsync(tr => tr.MemberId == member.UserId && (tr.Status == "Pending" || tr.Status == "Approved"));
                    member.IsRecipient = stillNeedsBlood;
                    _context.Members.Update(member);
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = $"Yêu cầu truyền máu {id} đã được hủy." });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Đã xảy ra lỗi nội bộ trong quá trình hủy bỏ.");
            }
        }

        // GET: api/TransfusionRequest/pending
        [HttpGet("pending")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetPendingTransfusionRequests()
        {
            var pendingRequests = await _context.TransfusionRequests
                .Include(tr => tr.Member).ThenInclude(m => m.User)
                .Include(tr => tr.BloodType)
                .Include(tr => tr.Component)
                .Where(tr => tr.Status == "Pending")
                .Select(tr => new
                {
                    tr.TransfusionId,
                    tr.MemberId,
                    tr.Member.User.FullName,
                    tr.BloodTypeId,
                    tr.BloodType.BloodTypeName,
                    tr.ComponentId,
                    tr.Component.ComponentName,
                    tr.ResponsibleById,
                    tr.IsEmergency,
                    tr.TransfusionVolume,
                    tr.PreferredReceiveDate,
                    tr.RequestDate,
                    tr.Status,
                    tr.Notes,
                    tr.PatientCondition
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(pendingRequests);
        }

        // --- Tín Coding: Start ---

        // Get upcoming transfusion requests for the current user
        // GET: api/TransfusionRequest/up-comming
        [HttpGet("up-comming")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> GetTransfusionRequestUpcomming()
        {
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;

            var history = await _context.TransfusionRequests
                .Where(tr => tr.MemberId == currentUserId)
                .Include(tr => tr.BloodType)
                .Include(tr => tr.Component)
                .OrderByDescending(tr => tr.RequestDate)
                .Select(tr => new {
                    tr.TransfusionId,
                    tr.BloodType.BloodTypeName,
                    tr.Component.ComponentName,
                    tr.TransfusionVolume,
                    tr.Status,
                    tr.RequestDate,
                    tr.ApprovalDate,
                    tr.CompletionDate,
                    tr.CancelledDate,
                    tr.Notes,
                    tr.PatientCondition
                })
                .ToListAsync();
            return Ok(history);
        }

        // Check for expired transfusion requests
        // PATCH: api/TransfusionRequest/expired_check
        [HttpPatch("expired_check")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> ExpiredTransfusionRequestCheck()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Find donation requests that have expired (preferred date in past) but haven't been completed, cancelled or rejected
            var expiredRequests = await _context.TransfusionRequests
                .Where(dr => dr.PreferredReceiveDate < DateTime.Now && ( dr.Status == "Approved" || dr.Status == "Pending"))
                .ToListAsync();

            if (expiredRequests.Count == 0)
                return NoContent();

            // Update all expired requests
            foreach (var request in expiredRequests)
            {
                request.Status = "Cancelled";
                request.Notes = $"Hệ thống tự động hủy đơn vào lúc {DateTime.Now} do quá hạn thời gian yêu cầu ({request.PreferredReceiveDate}).";
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

        // --- Tín Coding: End ---

        // GET: api/TransfusionRequest/suitable-blood-types
        // API trả về nhóm máu phù hợp thay cho GET /api/BloodUnit/suitable
        // Tiêu chí: 1. Trả về nhóm máu chính xác, 2. Nếu không có nhóm máu chính xác trả về nhóm máu tương thích, 3. Nếu không có nhóm máu tương thích trả về danh sách người hiến phù hợp
        [HttpGet("suitable-blood-types")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetSuitableBloodTypes([FromQuery] int bloodTypeId, [FromQuery] int componentId, [FromQuery] int requiredVolume = 0)
        {
            try
            {
                // Kiểm tra tham số đầu vào
                if (bloodTypeId <= 0 || componentId <= 0)
                {
                    return BadRequest("BloodTypeId và ComponentId phải là số nguyên dương.");
                }

                // Kiểm tra BloodType và Component có tồn tại không
                var bloodType = await _context.BloodTypes.FindAsync(bloodTypeId);
                if (bloodType == null)
                {
                    return NotFound($"Không tìm thấy nhóm máu với ID {bloodTypeId}.");
                }

                var component = await _context.BloodComponents.FindAsync(componentId);
                if (component == null)
                {
                    return NotFound($"Không tìm thấy thành phần máu với ID {componentId}.");
                }

                var currentDate = DateOnly.FromDateTime(DateTime.Now);
                var result = new
                {
                    RequestedBloodType = bloodType.BloodTypeName,
                    RequestedComponent = component.ComponentName,
                    RequiredVolume = requiredVolume,
                    ExactMatch = new List<object>(),
                    CompatibleMatch = new List<object>(),
                    EligibleDonors = new List<object>()
                };

                // 1. Tìm nhóm máu chính xác (Exact Match)
                var exactMatchUnits = await _context.BloodUnits
                    .Include(bu => bu.BloodType)
                    .Include(bu => bu.Component)
                    .Where(bu => bu.BloodTypeId == bloodTypeId &&
                                bu.ComponentId == componentId &&
                                bu.BloodStatus == "Available" &&
                                bu.RemainingVolume > 0 &&
                                bu.ExpiryDate >= currentDate)
                    .OrderBy(bu => bu.ExpiryDate)
                    .Select(bu => new
                    {
                        bu.BloodUnitId,
                        bu.BloodType.BloodTypeName,
                        bu.Component.ComponentName,
                        bu.RemainingVolume,
                        bu.ExpiryDate,
                        MatchType = "Exact"
                    })
                    .ToListAsync();

                result = new
                {
                    RequestedBloodType = bloodType.BloodTypeName,
                    RequestedComponent = component.ComponentName,
                    RequiredVolume = requiredVolume,
                    ExactMatch = exactMatchUnits.Cast<object>().ToList(),
                    CompatibleMatch = new List<object>(),
                    EligibleDonors = new List<object>()
                };

                // 2. Nếu không có nhóm máu chính xác hoặc không đủ thể tích, tìm nhóm máu tương thích (Compatible Match)
                var totalExactVolume = exactMatchUnits.Sum(bu => bu.RemainingVolume);
                if (exactMatchUnits.Count == 0 || (requiredVolume > 0 && totalExactVolume < requiredVolume))
                {
                    // Tìm các nhóm máu tương thích từ bảng BloodCompatibilityRules
                    var compatibleBloodTypes = await _context.BloodCompatibilityRules
                        .Include(rule => rule.BloodGive)
                        .Include(rule => rule.BloodRecieve)
                        .Where(rule => rule.BloodRecieveId == bloodTypeId &&
                                     rule.ComponentId == componentId &&
                                     rule.IsCompatible == true &&
                                     rule.BloodGiveId != bloodTypeId) // Loại trừ nhóm máu chính xác
                        .Select(rule => rule.BloodGiveId)
                        .Distinct()
                        .ToListAsync();

                    if (compatibleBloodTypes.Any())
                    {
                        var compatibleMatchUnits = await _context.BloodUnits
                            .Include(bu => bu.BloodType)
                            .Include(bu => bu.Component)
                            .Where(bu => compatibleBloodTypes.Contains(bu.BloodTypeId) &&
                                        bu.ComponentId == componentId &&
                                        bu.BloodStatus == "Available" &&
                                        bu.RemainingVolume > 0 &&
                                        bu.ExpiryDate >= currentDate)
                            .OrderBy(bu => bu.ExpiryDate)
                            .Select(bu => new
                            {
                                bu.BloodUnitId,
                                bu.BloodType.BloodTypeName,
                                bu.Component.ComponentName,
                                bu.RemainingVolume,
                                bu.ExpiryDate,
                                MatchType = "Compatible"
                            })
                            .ToListAsync();

                        result = new
                        {
                            RequestedBloodType = bloodType.BloodTypeName,
                            RequestedComponent = component.ComponentName,
                            RequiredVolume = requiredVolume,
                            ExactMatch = exactMatchUnits.Cast<object>().ToList(),
                            CompatibleMatch = compatibleMatchUnits.Cast<object>().ToList(),
                            EligibleDonors = new List<object>()
                        };
                    }
                }

                // 3. Nếu không có nhóm máu tương thích, tìm danh sách người hiến phù hợp (Eligible Donors)
                var totalCompatibleVolume = result.CompatibleMatch.Count > 0 ? 
                    result.CompatibleMatch.Sum(bu => (int)bu.GetType().GetProperty("RemainingVolume").GetValue(bu)) : 0;
                var totalAvailableVolume = totalExactVolume + totalCompatibleVolume;

                if ((exactMatchUnits.Count == 0 && result.CompatibleMatch.Count == 0) || 
                    (requiredVolume > 0 && totalAvailableVolume < requiredVolume))
                {
                    // Tìm các thành viên có thể hiến máu phù hợp
                    var eligibleDonors = await _context.Members
                        .Include(m => m.User)
                        .Include(m => m.BloodType)
                        .Where(m =>
                            m.IsDonor == true && // Chỉ lấy người hiến máu
                            (m.LastDonationDate == null || m.LastDonationDate <= DateOnly.FromDateTime(DateTime.Now.AddDays(-84))) &&
                            m.BloodTypeId != null &&
                            m.BloodTypeId != 99 // Loại trừ nhóm máu chưa xác định
                        )
                        .Select(m => new
                        {
                            m.UserId,
                            DonorName = m.User.FullName,
                            m.BloodType.BloodTypeName,
                            PhoneNumber = m.User.PhoneNumber,
                            Email = m.User.Email,
                            m.LastDonationDate,
                            m.DonationCount,
                            IsCompatible = _context.BloodCompatibilityRules.Any(rule =>
                                rule.BloodGiveId == m.BloodTypeId &&
                                rule.BloodRecieveId == bloodTypeId &&
                                rule.ComponentId == componentId &&
                                rule.IsCompatible == true)
                        })
                        .Where(m => m.IsCompatible) // Chỉ lấy những người có nhóm máu tương thích
                        .OrderBy(m => m.LastDonationDate) // Ưu tiên người chưa hiến hoặc hiến lâu nhất
                        .Take(10) // Giới hạn 10 người hiến phù hợp
                        .ToListAsync();

                    result = new
                    {
                        RequestedBloodType = bloodType.BloodTypeName,
                        RequestedComponent = component.ComponentName,
                        RequiredVolume = requiredVolume,
                        ExactMatch = exactMatchUnits.Cast<object>().ToList(),
                        CompatibleMatch = result.CompatibleMatch,
                        EligibleDonors = eligibleDonors.Cast<object>().ToList()
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Đã xảy ra lỗi nội bộ: {ex.Message}");
            }
        }

        [HttpPost("send-email-donor")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> SendEmailToDonor([FromBody] TransfusionEmailToDonor model)
        {
            if (model == null)
                return NotFound("Không Tìm Thấy Email Để Gửi.");

            // ===== NGHIỆP VỤ: LẤY THÔNG TIN YÊU CẦU TRUYỀN MÁU =====
            // Lấy thông tin chi tiết của yêu cầu truyền máu để hiển thị trong email
            var transfusionRequest = await _context.TransfusionRequests
                .Include(tr => tr.BloodType)
                .FirstOrDefaultAsync(tr => tr.TransfusionId == model.TransfusionRequestId);

            if (transfusionRequest == null)
                return NotFound("Không tìm thấy yêu cầu truyền máu.");

            // Lấy tên nhóm máu cần thiết
            string bloodTypeName = transfusionRequest.BloodType?.BloodTypeName ?? "Không biết";

            // Gửi email đến người hiến máu
            var mail = new System.Net.Mail.MailMessage();
            mail.From = new System.Net.Mail.MailAddress("tinbusiness.work@gmail.com");
            foreach (var email in model.Email)
                mail.Bcc.Add(new System.Net.Mail.MailAddress(email));
            mail.Priority = System.Net.Mail.MailPriority.High;

            mail.Subject = "🩸 YÊU CẦU HIẾN MÁU TÌNH NGUYỆN";
            mail.Body = $@"<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;'>
                        <h2 style='color: #1976d2; text-align: center; margin-bottom: 16px;'>🩸 YÊU CẦU HIẾN MÁU TÌNH NGUYỆN</h2>
                        <p style='font-size: 18px; color: #1976d2; text-align: center; font-weight: bold; margin-bottom: 24px;'>
                            Một bệnh nhân đang cần sự giúp đỡ của bạn!
                        </p>
                        <p style='font-size: 16px; line-height: 1.6; margin-bottom: 16px;'>
                            Xin chào tình nguyện viên thân mến,
                        </p>
                        <p style='font-size: 16px; line-height: 1.6; margin-bottom: 16px;'>
                            Chúng tôi đã nhận được <b>yêu cầu hiến máu</b> từ một bệnh nhân có nhóm máu phù hợp với bạn.<br>
                            <b>Hãy chung tay vì cộng đồng!</b>
                        </p>
                        <div style='background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 16px; border-radius: 8px; margin: 20px 0;'>
                            <h3 style='color: #495057; margin-top: 0; margin-bottom: 12px;'>Thông tin yêu cầu:</h3>
                            <ul style='color: #495057; margin: 8px 0; padding-left: 20px;'>
                                <li><strong>Loại máu cần:</strong> {bloodTypeName}</li>
                                <li><strong>Thời gian:</strong> Linh hoạt theo lịch đăng ký</li>
                                <li><strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học - 118 Đ. Hồng Bàng, Phường 12, Quận 5, Thành phố Hồ Chí Minh</li>
                            </ul>
                        </div>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='http://localhost:3000/login?redirect=/booking' 
                               style='background-color: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);'>
                                ĐĂNG KÝ HIẾN MÁU
                            </a>
                        </div>
                        <p style='font-size: 14px; color: #6c757d; margin-top: 20px; line-height: 1.5;'>
                            <strong>Lưu ý:</strong> Sau khi xác nhận, bạn sẽ được chuyển đến trang đặt lịch hiến máu. Vui lòng kiểm tra điều kiện sức khỏe trước khi xác nhận.
                        </p>
                        <p style='font-size: 14px; color: #6c757d; margin-top: 16px; line-height: 1.5;'>
                            Nếu bạn không thể hiến máu lúc này, vui lòng bỏ qua email này.
                        </p>
                        <hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>
                        <div style='text-align: center; color: #6c757d; font-size: 14px;'>
                            <p style='margin: 8px 0; font-weight: bold;'>Bệnh Viện Truyền Máu Huyết Học</p>
                            <p style='margin: 5px 0;'>Mọi thắc mắc xin liên hệ: 02839575334</p>
                            <p style='margin: 5px 0;'>Email: tinbusiness.work@gmail.com | Hotline: 02839575334</p>
                        </div>
                      </div>";
            mail.IsBodyHtml = true;

            try
            {
                using (var smtp = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587))
                {
                    smtp.EnableSsl = true;
                    smtp.UseDefaultCredentials = false;
                    smtp.Credentials = new System.Net.NetworkCredential("tinbusiness.work", "hbuv ayid svux duza");
                    await smtp.SendMailAsync(mail);
                }
            }
            catch (Exception)
            {
                return BadRequest("Lỗi khi gửi email");
            }

            return Ok("Email đã được gửi thành công.");
        }

        public class TransfusionEmailToDonor
        {
            public int TransfusionRequestId { get; set; }
            public List<string> Email { get; set; } = new List<string>(); // Khởi tạo mặc định để tránh lỗi nullable
        }

    }
} 