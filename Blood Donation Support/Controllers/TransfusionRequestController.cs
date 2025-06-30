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
    public class TransfusionRequestController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public TransfusionRequestController(BloodDonationSupportContext context)
        {
            _context = context;
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
                return Forbid("Authenticated user not found in the database.");
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
                RequestDate = DateTime.UtcNow,
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
                    tr.BloodTypeId,
                    tr.BloodType.BloodTypeName,
                    tr.ComponentId,
                    tr.Component.ComponentName,
                    tr.ResponsibleById,
                    tr.IsEmergency,
                    tr.TransfusionVolume,
                    tr.PreferredReceiveDate,
                    tr.RequestDate,
                    tr.ApprovalDate,
                    tr.CompletionDate,
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
                    tr.ApprovalDate,
                    tr.CompletionDate,
                    tr.Status,
                    tr.Notes,
                    tr.PatientCondition
                })
                .FirstOrDefaultAsync(tr => tr.TransfusionId == id);

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
                var transfusionRequest = await _context.TransfusionRequests.FindAsync(id);
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

                var bloodUnit = await _context.BloodUnits.FindAsync(model.BloodUnitId);
                if (bloodUnit == null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Blood unit {model.BloodUnitId} does not exist.");
                }
                if (bloodUnit.BloodStatus != "Available")
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Blood unit {model.BloodUnitId} is not available for reservation (current status: {bloodUnit.BloodStatus}).");
                }
                // 1. Kiểm tra hạn sử dụng
                if (bloodUnit.ExpiryDate < DateOnly.FromDateTime(DateTime.Now))
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Blood unit {model.BloodUnitId} has expired (expiry date: {bloodUnit.ExpiryDate:yyyy-MM-dd}).");
                }
                // 2. Kiểm tra thành phần máu
                var transfusionRequestFull = await _context.TransfusionRequests
                    .Include(tr => tr.BloodType)
                    .Include(tr => tr.Component)
                    .FirstOrDefaultAsync(tr => tr.TransfusionId == id);
                if (transfusionRequestFull == null)
                {
                    return NotFound($"Transfusion request with ID {id} not found.");
                }
                if (bloodUnit.ComponentId != transfusionRequestFull.ComponentId)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Blood unit {model.BloodUnitId} component does not match the requested component (required: {transfusionRequestFull.ComponentId}, actual: {bloodUnit.ComponentId}).");
                }
                // 3. Kiểm tra tương thích nhóm máu
                var isCompatible = await _context.BloodCompatibilityRules.AnyAsync(rule =>
                    rule.BloodGiveId == bloodUnit.BloodTypeId &&
                    rule.BloodRecieveId == transfusionRequestFull.BloodTypeId &&
                    rule.IsCompatible == true);
                if (!isCompatible)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Blood unit {model.BloodUnitId} blood type is not compatible with the requested blood type (unit: {bloodUnit.BloodTypeId}, request: {transfusionRequestFull.BloodTypeId}).");
                }
                // 4. Kiểm tra thể tích còn lại
                if (bloodUnit.RemainingVolume < transfusionRequestFull.TransfusionVolume)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Blood unit {model.BloodUnitId} does not have enough remaining volume (required: {transfusionRequestFull.TransfusionVolume}, available: {bloodUnit.RemainingVolume}).");
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var responsibleUser = await _context.Users.FindAsync(int.Parse(userId!));

                // 1. Cập nhật Yêu cầu Truyền máu
                transfusionRequest.Status = "Approved";
                transfusionRequest.Notes = model.Notes ?? transfusionRequest.Notes;
                transfusionRequest.ApprovalDate = DateTime.UtcNow;
                transfusionRequest.ResponsibleById = responsibleUser!.UserId;
                transfusionRequest.BloodUnitId = model.BloodUnitId;
                _context.TransfusionRequests.Update(transfusionRequest);
                
                // 2. Cập nhật Đơn vị máu
                bloodUnit.BloodStatus = "Reserved";
                _context.BloodUnits.Update(bloodUnit);

                // 3. Tạo Đặt chỗ máu
                var reservation = new BloodReservation
                {
                    BloodUnitId = bloodUnit.BloodUnitId,
                    TransfusionId = transfusionRequest.TransfusionId,
                    ReservedById = responsibleUser.UserId,
                    ReservedAt = DateTime.UtcNow,
                    ExpireAt = DateTime.UtcNow.AddHours(24), // Đặt chỗ sẽ hết hạn sau 24 giờ
                    Status = "Active"
                };
                _context.BloodReservations.Add(reservation);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = $"Yêu cầu truyền máu {id} đã được phê duyệt và đơn vị máu {model.BloodUnitId} đã được đặt chỗ." });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Đã xảy ra lỗi nội bộ trong quá trình phê duyệt.");
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

                if (transfusionRequest.Status != "Approved")
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Yêu cầu {id} không ở trạng thái 'Approved' và không thể hoàn thành.");
                }

                // 1. Tìm bản ghi đặt chỗ (BloodReservation) đang hoạt động cho yêu cầu này
                var reservation = await _context.BloodReservations
                    .FirstOrDefaultAsync(r => r.TransfusionId == id && r.Status == "Active");

                if (reservation == null)
                {
                    await transaction.RollbackAsync();
                    // Trường hợp này cho thấy sự không nhất quán về dữ liệu, vì một yêu cầu "Approved" phải có một đặt chỗ đang hoạt động.
                    return StatusCode(500, $"Lỗi không nhất quán dữ liệu: Không tìm thấy đặt chỗ nào đang hoạt động cho yêu cầu đã được phê duyệt {id}.");
                }

                // 3. Tìm Đơn vị máu (BloodUnit) được liên kết
                var bloodUnit = await _context.BloodUnits.FindAsync(reservation.BloodUnitId);
                if (bloodUnit == null)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"Lỗi không nhất quán dữ liệu: Không tìm thấy đơn vị máu đã được đặt trước với ID {reservation.BloodUnitId}.");
                }

                // 4. Trừ thể tích truyền (TransfusionVolume) khỏi thể tích còn lại (RemainingVolume) của Đơn vị máu
                bloodUnit.RemainingVolume -= transfusionRequest.TransfusionVolume;

                // 5. Cập nhật trạng thái của Đơn vị máu (BloodStatus)
                if (bloodUnit.RemainingVolume > 0)
                {
                    bloodUnit.BloodStatus = "PartialUsed";
                }
                else
                {
                    bloodUnit.BloodStatus = "Used";
                    bloodUnit.RemainingVolume = 0; // Đảm bảo thể tích không bị âm
                }
                _context.BloodUnits.Update(bloodUnit);

                // 2. Cập nhật trạng thái đặt chỗ (BloodReservation) thành "Fulfilled"
                reservation.Status = "Fulfilled";
                _context.BloodReservations.Update(reservation);

                // Cập nhật trạng thái Yêu cầu Truyền máu
                transfusionRequest.Status = "Completed";
                transfusionRequest.CompletionDate = DateTime.UtcNow;
                _context.TransfusionRequests.Update(transfusionRequest);

                // Cập nhật trạng thái IsRecipient của Thành viên
                var member = await _context.Members.FindAsync(transfusionRequest.MemberId);
                if (member != null)
                {
                    member.IsRecipient = true;
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
                _context.TransfusionRequests.Update(transfusionRequest);

                // Nếu yêu cầu đã được phê duyệt, chúng ta cần giải phóng đơn vị máu đã đặt chỗ
                if (originalStatus == "Approved" && transfusionRequest.BloodUnitId.HasValue)
                {
                    var reservation = await _context.BloodReservations
                        .FirstOrDefaultAsync(r => r.TransfusionId == id && r.Status == "Active");

                    if (reservation != null)
                    {
                        reservation.Status = "Cancelled";
                        _context.BloodReservations.Update(reservation);

                        var bloodUnit = await _context.BloodUnits.FindAsync(reservation.BloodUnitId);
                        if (bloodUnit != null)
                        {
                            bloodUnit.BloodStatus = "Available";
                            _context.BloodUnits.Update(bloodUnit);
                        }
                    }
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
    }
} 