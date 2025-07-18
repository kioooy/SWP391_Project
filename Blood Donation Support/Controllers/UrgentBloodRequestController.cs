using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UrgentBloodRequestController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public UrgentBloodRequestController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        [HttpPost]
        // Cho phép Guest (người dùng chưa đăng nhập) tạo yêu cầu khẩn cấp
        // Không có [Authorize] attribute ở đây để cho phép truy cập public.
        public async Task<IActionResult> CreateUrgentBloodRequest([FromBody] CreateUrgentBloodRequestDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int? createdByUserId = null;

            // Nếu người dùng đã đăng nhập, lấy UserId của họ
            if (!string.IsNullOrEmpty(userIdString) && int.TryParse(userIdString, out int parsedUserId))
            {
                createdByUserId = parsedUserId;
            }

            // Ánh xạ BloodTypeId từ tên (nếu có, mặc định là ID 99 cho 'Không biết' nếu FE gửi tên)
            // Frontend sẽ gửi BloodTypeId trực tiếp, không phải name. Đảm bảo BloodType 99 đã tồn tại.
            var bloodTypeExists = await _context.BloodTypes.AnyAsync(bt => bt.BloodTypeId == model.RequestedBloodTypeId);
            if (!bloodTypeExists)
            {
                return BadRequest(new { error = $"Yêu Cầu Mã Loại Máu {model.RequestedBloodTypeId} không tồn tại." });
            }

            var urgentRequest = new UrgentBloodRequest
            {
                PatientName = model.PatientName,
                RequestedBloodTypeId = model.RequestedBloodTypeId,
                Reason = model.Reason,
                CitizenNumber = model.CitizenNumber,
                ContactName = model.ContactName,
                ContactPhone = model.ContactPhone,
                ContactEmail = model.ContactEmail,
                EmergencyLocation = model.EmergencyLocation,
                Notes = model.Notes,
                RequestDate = DateTime.UtcNow, // Ghi nhận thời gian tạo yêu cầu
                Status = "Pending", // Trạng thái ban đầu là 'Pending'
                IsActive = true, // Mặc định là Active
            };

            _context.UrgentBloodRequests.Add(urgentRequest);
            await _context.SaveChangesAsync();

            // Lấy RoleId của Admin và Staff
            var adminRoleId = await _context.Roles.Where(r => r.Name == "Admin").Select(r => r.RoleId).FirstOrDefaultAsync();
            var staffRoleId = await _context.Roles.Where(r => r.Name == "Staff").Select(r => r.RoleId).FirstOrDefaultAsync();

            // Lấy danh sách UserId của Admin và Staff
            var adminStaffUsers = await _context.Users
                                            .Where(u => u.RoleId == adminRoleId || u.RoleId == staffRoleId)
                                            .Select(u => u.UserId)
                                            .ToListAsync();

            var bloodType = await _context.BloodTypes.FindAsync(model.RequestedBloodTypeId);
            string bloodTypeName = bloodType != null ? bloodType.BloodTypeName : "Không biết";

            foreach (var userId in adminStaffUsers)
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Title = "Yêu cầu máu khẩn cấp mới",
                    Message = $"Có một yêu cầu máu khẩn cấp mới từ {model.PatientName} (Nhóm máu: {bloodTypeName}). Vị trí: {model.EmergencyLocation}. ID yêu cầu: {urgentRequest.UrgentRequestId}. Vui lòng kiểm tra và xử lý ngay lập tức.",
                    NotificationType = "UrgentBloodRequest",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
            }
            await _context.SaveChangesAsync(); // Lưu các thông báo mới

            return CreatedAtAction(nameof(GetUrgentBloodRequestById), new { id = urgentRequest.UrgentRequestId }, urgentRequest);
        }

        [HttpGet("{id}")]
        // API này có thể yêu cầu quyền truy cập (Staff, Admin) để xem chi tiết yêu cầu khẩn cấp
        // Hoặc cho phép người tạo xem yêu cầu của họ.
        public async Task<IActionResult> GetUrgentBloodRequestById(int id)
        {
            var urgentRequest = await _context.UrgentBloodRequests
                                        .Include(ubr => ubr.BloodType)
                                        .FirstOrDefaultAsync(ubr => ubr.UrgentRequestId == id);

            if (urgentRequest == null)
            {
                return NotFound();
            }

            // Tùy chọn: Thêm logic phân quyền nếu chỉ người tạo hoặc Admin/Staff mới được xem
            // var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // if (urgentRequest.CreatedByUserId != null && currentUserIdString != urgentRequest.CreatedByUserId.ToString() && !User.IsInRole("Admin") && !User.IsInRole("Staff"))
            // {
            //     return Forbid();
            // }

            return Ok(new
            {
                urgentRequest.UrgentRequestId,
                urgentRequest.PatientName,
                RequestedBloodTypeId = urgentRequest.RequestedBloodTypeId,
                BloodType = new BloodTypeResponseDTO
                {
                    BloodTypeId = urgentRequest.BloodType.BloodTypeId,
                    BloodTypeName = urgentRequest.BloodType.BloodTypeName
                },
                urgentRequest.Reason,
                urgentRequest.CitizenNumber,
                urgentRequest.ContactName,
                urgentRequest.ContactPhone,
                urgentRequest.ContactEmail,
                urgentRequest.EmergencyLocation,
                urgentRequest.Notes,
                urgentRequest.RequestDate,
                urgentRequest.Status,
                urgentRequest.CompletionDate,
                urgentRequest.IsActive,
            });
        }

        [HttpGet]
        // Chỉ cho phép Staff và Admin xem tất cả các yêu cầu khẩn cấp.
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetAllUrgentBloodRequests()
        {
            var urgentRequests = await _context.UrgentBloodRequests
                                        .Include(ubr => ubr.BloodType)
                                        .AsNoTracking()
                                        .ToListAsync();
            return Ok(urgentRequests.Select(ubr => new
            {
                ubr.UrgentRequestId,
                ubr.PatientName,
                RequestedBloodTypeId = ubr.RequestedBloodTypeId,
                BloodType = new BloodTypeResponseDTO
                {
                    BloodTypeId = ubr.BloodType.BloodTypeId,
                    BloodTypeName = ubr.BloodType.BloodTypeName
                },
                ubr.Reason,
                ubr.CitizenNumber,
                ubr.ContactName,
                ubr.ContactPhone,
                ubr.ContactEmail,
                ubr.EmergencyLocation,
                ubr.Notes,
                ubr.RequestDate,
                ubr.Status,
                ubr.CompletionDate,
                ubr.IsActive,
            }));
        }

        [HttpPatch("{id}/fulfill")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> FulfillUrgentBloodRequest(int id, [FromBody] FulfillUrgentBloodRequestInputDTO model)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
            {
                return NotFound();
            }

            if (urgentRequest.Status == "Fulfilled" || urgentRequest.Status == "Cancelled")
            {
                return BadRequest(new { error = "Không thể hoàn thành yêu cầu đã hoàn thành hoặc đã hủy." });
            }

            // Đảm bảo phải có PreemptedTransfusionRequestId HOẶC UsedBloodUnitId khi hoàn thành
            if (!model.PreemptedTransfusionRequestId.HasValue && !model.UsedBloodUnitId.HasValue)
            {
                return BadRequest(new { error = "Phải cung cấp ID yêu cầu truyền máu bị ưu tiên HOẶC ID đơn vị máu đã sử dụng." });
            }
            // Không được cung cấp cả hai
            if (model.PreemptedTransfusionRequestId.HasValue && model.UsedBloodUnitId.HasValue)
            {
                return BadRequest(new { error = "Không được cung cấp cả ID yêu cầu truyền máu bị ưu tiên và ID đơn vị máu đã sử dụng." });
            }

            urgentRequest.Status = "Fulfilled";
            urgentRequest.CompletionDate = DateTime.UtcNow;

            // Lấy nhóm máu yêu cầu của urgent request để kiểm tra tương thích
            var requestedBloodType = await _context.BloodTypes.FindAsync(urgentRequest.RequestedBloodTypeId);
            if (requestedBloodType == null)
            {
                return StatusCode(500, new { error = "Không tìm thấy thông tin nhóm máu yêu cầu." });
            }

            // Xử lý ưu tiên máu nếu có TransfusionRequest bị ưu tiên
            if (model.PreemptedTransfusionRequestId.HasValue)
            {
                var preemptedTransfusionRequest = await _context.TransfusionRequests
                    .Include(tr => tr.TransfusionRequestBloodUnits)
                    .ThenInclude(trbu => trbu.BloodUnit)
                    .FirstOrDefaultAsync(tr => tr.TransfusionId == model.PreemptedTransfusionRequestId.Value);

                if (preemptedTransfusionRequest != null)
                {
                    if (preemptedTransfusionRequest.Status == "Completed")
                    {
                        return BadRequest(new { error = "Không thể ưu tiên máu từ yêu cầu truyền máu đã hoàn thành." });
                    }

                    // Kiểm tra tương thích máu trước khi ưu tiên
                    var assignedBloodUnits = preemptedTransfusionRequest.TransfusionRequestBloodUnits
                        .Where(trbu => trbu.Status == "Assigned")
                        .ToList();

                    foreach (var assignedUnit in assignedBloodUnits)
                    {
                        var bloodUnitToPreempt = assignedUnit.BloodUnit;
                        if (bloodUnitToPreempt != null)
                        {
                            var isCompatible = await _context.BloodCompatibilityRules.AnyAsync(
                                r => r.BloodRecieveId == requestedBloodType.BloodTypeId && r.BloodGiveId == bloodUnitToPreempt.BloodTypeId && r.IsCompatible
                            );

                            if (!isCompatible)
                            {
                                return BadRequest(new { error = $"Đơn vị máu (ID: {bloodUnitToPreempt.BloodUnitId}) không tương thích với nhóm máu yêu cầu ({requestedBloodType.BloodTypeName})." });
                            }
                        }
                    }

                    // Nếu trạng thái là Approved, chuyển về Pending
                    if (preemptedTransfusionRequest.Status == "Approved")
                    {
                        preemptedTransfusionRequest.Status = "Pending";
                        preemptedTransfusionRequest.CancelledDate = DateTime.UtcNow; // Ghi nhận thời gian bị hủy/pending lại
                        _context.TransfusionRequests.Update(preemptedTransfusionRequest);
                    }

                    // Hủy BloodReservation liên quan đến TransfusionRequest bị ưu tiên
                    foreach (var assignedUnit in assignedBloodUnits)
                    {
                        var bloodUnitId = assignedUnit.BloodUnitId;
                        
                        var activeReservations = await _context.BloodReservations
                            .Where(r => r.BloodUnitId == bloodUnitId && r.Status == "Active")
                            .ToListAsync();

                        foreach (var reservation in activeReservations)
                        {
                            reservation.Status = "Hủy Bỏ bởi Khẩn Cấp";
                            _context.BloodReservations.Update(reservation);
                        }

                        // Giải phóng BloodUnit nếu nó đang được Reserved bởi yêu cầu này
                        var preemptedBloodUnit = await _context.BloodUnits.FindAsync(bloodUnitId);
                        if (preemptedBloodUnit != null && preemptedBloodUnit.BloodStatus == "Reserved")
                        {
                            preemptedBloodUnit.BloodStatus = "Available";
                            _context.BloodUnits.Update(preemptedBloodUnit);
                        }

                        // Cập nhật trạng thái bản ghi liên kết
                        assignedUnit.Status = "Cancelled";
                        _context.TransfusionRequestBloodUnits.Update(assignedUnit);
                    }
                }
            }
            else if (model.UsedBloodUnitId.HasValue) // Xử lý nếu cung cấp UsedBloodUnitId thay vì PreemptedTransfusionRequestId
            {
                var usedBloodUnit = await _context.BloodUnits.FindAsync(model.UsedBloodUnitId.Value);
                if (usedBloodUnit == null)
                {
                    return BadRequest(new { error = "Không tìm thấy đơn vị máu được chỉ định." });
                }

                // Kiểm tra tương thích máu trước khi sử dụng
                var isCompatible = await _context.BloodCompatibilityRules.AnyAsync(
                    r => r.BloodRecieveId == requestedBloodType.BloodTypeId && r.BloodGiveId == usedBloodUnit.BloodTypeId && r.IsCompatible
                );

                if (!isCompatible)
                {
                    return BadRequest(new { error = $"Đơn vị máu (ID: {usedBloodUnit.BloodType.BloodTypeName}) không tương thích với nhóm máu yêu cầu ({requestedBloodType.BloodTypeName})." });
                }

                // Kiểm tra trạng thái hiện tại của BloodUnit trước khi đánh dấu là 'Used'
                if (usedBloodUnit.BloodStatus == "Used" || usedBloodUnit.BloodStatus == "Expired" || usedBloodUnit.BloodStatus == "Discarded")
                {
                    return BadRequest(new { error = "Đơn vị máu không thể được sử dụng vì đã ở trạng thái không hợp lệ (Used, Expired, Discarded)." });
                }

                usedBloodUnit.BloodStatus = "Used";
                usedBloodUnit.RemainingVolume = 0; // Đặt RemainingVolume về 0 khi toàn bộ được sử dụng
                _context.BloodUnits.Update(usedBloodUnit);
            }

            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Yêu cầu khẩn cấp {id} đã được hoàn thành." });
        }

        [HttpPatch("{id}/cancel")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> CancelUrgentBloodRequest(int id)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
            {
                return NotFound();
            }

            // Đảm bảo yêu cầu chưa Fulfilled/Cancelled
            if (urgentRequest.Status == "Fulfilled" || urgentRequest.Status == "Cancelled")
            {
                return BadRequest(new { error = "Không thể hủy yêu cầu đã hoàn thành hoặc đã hủy." });
            }

            urgentRequest.Status = "Cancelled";
            urgentRequest.CompletionDate = DateTime.UtcNow;

            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Yêu cầu khẩn cấp {id} đã được hủy." });
        }

        [HttpPatch("{id}/accept")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> AcceptUrgentRequest(int id)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
            {
                return NotFound();
            }

            // Chỉ có thể tiếp nhận các yêu cầu ở trạng thái Pending
            if (urgentRequest.Status != "Pending")
            {
                return BadRequest(new { error = "Chỉ có thể tiếp nhận các yêu cầu ở trạng thái Pending." });
            }

            urgentRequest.Status = "InProgress";
            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Yêu cầu khẩn cấp {id} đã được tiếp nhận và chuyển sang trạng thái InProgress." });
        }

        // [HttpPatch("{id}/link-transfusion-request")]
        // [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        // public async Task<IActionResult> LinkToTransfusionRequest(int id, [FromBody] LinkTransfusionRequestDTO model)
        // {
        //     var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
        //     if (urgentRequest == null)
        //     {
        //         return NotFound();
        //     }

        //     urgentRequest.RelatedTransfusionRequestId = model.TransfusionRequestId;
        //     _context.UrgentBloodRequests.Update(urgentRequest);
        //     await _context.SaveChangesAsync();

        //     return Ok(new { message = $"Yêu cầu khẩn cấp {id} đã được liên kết với yêu cầu truyền máu {model.TransfusionRequestId}." });
        // }

        [HttpGet("search-blood-units")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> SearchBloodUnits([FromQuery] BloodUnitSearchDTO searchParams)
        {
            // Bắt đầu tìm kiếm các nhóm máu tương thích
            var compatibleRulesQuery = _context.BloodCompatibilityRules.AsQueryable();

            // Lọc theo nhóm máu nhận của yêu cầu khẩn cấp
            compatibleRulesQuery = compatibleRulesQuery.Where(r => r.BloodRecieveId == searchParams.RequestedBloodTypeId && r.IsCompatible);

            // Nếu có ComponentId được yêu cầu, lọc thêm theo ComponentId
            if (searchParams.RequestedComponentId.HasValue)
            {
                compatibleRulesQuery = compatibleRulesQuery.Where(r => r.ComponentId == searchParams.RequestedComponentId.Value);
            }

            var compatibleBloodTypeIds = await compatibleRulesQuery.Select(r => r.BloodGiveId).ToListAsync();

            // Bao gồm cả nhóm máu gốc nếu nó chưa có trong danh sách tương thích (ví dụ: A+ tương thích với A+)
            if (!compatibleBloodTypeIds.Contains(searchParams.RequestedBloodTypeId))
            {
                compatibleBloodTypeIds.Add(searchParams.RequestedBloodTypeId);
            }

            var query = _context.BloodUnits
                                .Include(bu => bu.BloodType)
                                .Include(bu => bu.Component)
                                .AsQueryable();

            // Lọc theo các nhóm máu tương thích đã tìm được
            query = query.Where(bu => compatibleBloodTypeIds.Contains(bu.BloodTypeId));

            // Lọc theo thành phần máu yêu cầu nếu có (đã xử lý ở bước trên, nhưng giữ lại để lọc BloodUnits)
            if (searchParams.RequestedComponentId.HasValue)
            {
                query = query.Where(bu => bu.ComponentId == searchParams.RequestedComponentId.Value);
            }
            
            // Chỉ lấy máu có trạng thái Available hoặc Reserved (nếu được yêu cầu)
            if (!searchParams.IncludeReserved)
            {
                query = query.Where(bu => bu.BloodStatus == "Available");
            } else {
                query = query.Where(bu => bu.BloodStatus == "Available" || bu.BloodStatus == "Reserved");
            }
            
            // Chỉ lấy máu còn hạn sử dụng và có RemainingVolume > 0
            query = query.Where(bu => bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) && bu.RemainingVolume > 0);

            var bloodUnits = await query.ToListAsync();

            var results = new List<BloodUnitResponseForUrgentRequestDTO>();

            foreach (var bu in bloodUnits)
            {
                var isReserved = false;
                int? reservedForTransfusionId = null;
                string? reservedForPatientName = null;

                if (bu.BloodStatus == "Reserved")
                {
                    var reservation = await _context.BloodReservations
                                                    .Include(r => r.Transfusion)
                                                        .ThenInclude(tr => tr.Member)
                                                    .FirstOrDefaultAsync(r => r.BloodUnitId == bu.BloodUnitId && r.Status == "Active");
                    if (reservation != null)
                    {
                        isReserved = true;
                        reservedForTransfusionId = reservation.TransfusionId;
                        reservedForPatientName = reservation.Transfusion.PatientCondition; // hoặc Member.FullName nếu phù hợp hơn
                    }
                }

                results.Add(new BloodUnitResponseForUrgentRequestDTO
                {
                    BloodUnitId = bu.BloodUnitId,
                    BloodTypeName = bu.BloodType.BloodTypeName,
                    ComponentName = bu.Component.ComponentName,
                    Volume = bu.Volume,
                    RemainingVolume = bu.RemainingVolume,
                    ExpiryDate = bu.ExpiryDate,
                    BloodStatus = bu.BloodStatus,
                    IsReserved = isReserved,
                    ReservedForTransfusionId = reservedForTransfusionId,
                    ReservedForPatientName = reservedForPatientName
                });
            }

            return Ok(results);
        }

        [HttpGet("pending")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetPendingUrgentBloodRequests()
        {
            var pendingUrgentRequests = await _context.UrgentBloodRequests
                                                .Where(ubr => ubr.Status == "Pending")
                                                .Include(ubr => ubr.BloodType)
                                                .AsNoTracking()
                                                .ToListAsync();

            return Ok(pendingUrgentRequests.Select(ubr => new
            {
                ubr.UrgentRequestId,
                ubr.PatientName,
                RequestedBloodTypeId = ubr.RequestedBloodTypeId,
                BloodType = new BloodTypeResponseDTO
                {
                    BloodTypeId = ubr.BloodType.BloodTypeId,
                    BloodTypeName = ubr.BloodType.BloodTypeName
                },
                ubr.Reason,
                ubr.CitizenNumber,
                ubr.ContactName,
                ubr.ContactPhone,
                ubr.ContactEmail,
                ubr.EmergencyLocation,
                ubr.Notes,
                ubr.RequestDate,
                ubr.Status,
                ubr.CompletionDate,
                ubr.IsActive,
            }));
        }

        // --- Tín Coding: Start ---

        // Get History of Urgent Blood Requests ( Emergency ) for Current User
        // GET api/urgentbloodrequest/history
        [HttpGet("history")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> GetUrgentRequestHistory()
        { 
            // Get current user id
            int currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var idVal) ? idVal : 0;
            
            // Check if currentUserId is valid
            var citizenNumber = await _context.Users.Where(u => u.UserId == currentUserId).Select(u => u.CitizenNumber).FirstOrDefaultAsync();
            if (citizenNumber == null)
                return BadRequest("Không tìm thấy người dùng hiện tại.");

            // Check UrgentBloodRequest exists for this citizen number
            var urgentBloodRequest = await _context.UrgentBloodRequests.FirstOrDefaultAsync(ubr => ubr.CitizenNumber == citizenNumber);
            if (urgentBloodRequest == null)
                return NotFound($"Không tìm thấy lịch sử truyền máu khẩn cấp.");
            
            // Get list history where status isn't pending
            return Ok(await _context.UrgentBloodRequests
                .Where(ubr => ubr.IsActive == true && ubr.CitizenNumber == citizenNumber && ubr.Status != "Pending")
                .Select(ubr => new
                {
                    ubr.UrgentRequestId,           // Urgent Request ID
                    ubr.PatientName,               // Patient Name
                    ubr.BloodType.BloodTypeName,   // Blood Type Name
                    ubr.Reason,                    // Reason requested
                    ubr.CitizenNumber,             // Citizen Number
                    ubr.ContactName,               // Contact Name ( Related of patient name )
                    ubr.ContactPhone,              // contact Phone ( Related of patient name )
                    ubr.ContactEmail,              // contact Email ( Related of patient name )
                    ubr.EmergencyLocation,         // Emergency Location ( Where the patient is located when requestd )
                    ubr.Notes,                     // Notes
                    ubr.RequestDate,               // Request Date ( When the request was created )
                    ubr.Status,                    // Status 
                    ubr.CompletionDate,            // Completion Date 
                })
                .ToListAsync());
        }
        // --- Tín Coding: End ---
    }
} 