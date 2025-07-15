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
                if (totalVolume < transfusionRequest.TransfusionVolume)
                {
                    await transaction.RollbackAsync();
                    return BadRequest("Tổng thể tích các túi máu không đủ!");
                }
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
                        bloodUnit.BloodStatus = "PartialUsed";
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
    }
} 