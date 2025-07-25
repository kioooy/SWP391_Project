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
                CreatedByUserId = createdByUserId // Ghi nhận ID người tạo (có thể NULL)
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
                                        .Include(ubr => ubr.CreatedByUser)
                                        .FirstOrDefaultAsync(ubr => ubr.UrgentRequestId == id);

            if (urgentRequest == null)
            {
                return NotFound();
            }

            // Lấy danh sách máu đã gán cho yêu cầu này
            var assignedBloodUnits = await _context.UrgentRequestBloodUnits
                .Where(ubu => ubu.UrgentRequestId == id)
                .Join(_context.BloodUnits,
                    ubu => ubu.BloodUnitId,
                    bu => bu.BloodUnitId,
                    (ubu, bu) => new {
                        ubu.BloodUnitId,
                        ubu.AssignedVolume,
                        ubu.Status,
                        bu.BloodStatus,
                        bu.BloodTypeId,
                        bu.ComponentId
                    })
                .Join(_context.BloodTypes,
                    bu => bu.BloodTypeId,
                    bt => bt.BloodTypeId,
                    (bu, bt) => new { bu, bt.BloodTypeName })
                .Join(_context.BloodComponents,
                    bu2 => bu2.bu.ComponentId,
                    bc => bc.ComponentId,
                    (bu2, bc) => new {
                        bu2.bu.BloodUnitId,
                        bu2.BloodTypeName,
                        ComponentName = bc.ComponentName,
                        bu2.bu.AssignedVolume,
                        bu2.bu.Status,
                        bu2.bu.BloodStatus
                    })
                .ToListAsync();

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
                urgentRequest.RelatedTransfusionRequestId,
                CreatedByUserId = urgentRequest.CreatedByUserId,
                CreatedByUserName = urgentRequest.CreatedByUser != null ? urgentRequest.CreatedByUser.FullName : null,
                AssignedBloodUnits = assignedBloodUnits
            });
        }

        [HttpGet]
        // Chỉ cho phép Staff và Admin xem tất cả các yêu cầu khẩn cấp.
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetAllUrgentBloodRequests()
        {
            var urgentRequests = await _context.UrgentBloodRequests
                                        .Include(ubr => ubr.BloodType)
                                        .Include(ubr => ubr.CreatedByUser)
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
                ubr.RelatedTransfusionRequestId,
                CreatedByUserId = ubr.CreatedByUserId,
                CreatedByUserName = ubr.CreatedByUser != null ? ubr.CreatedByUser.FullName : null
            }));
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

            // --- Bổ sung logic trả máu về kho khi hủy yêu cầu ---
            var assignedUnits = await _context.UrgentRequestBloodUnits
                .Where(ubu => ubu.UrgentRequestId == id && ubu.Status == "Assigned")
                .ToListAsync();

            foreach (var ubu in assignedUnits)
            {
                // Cập nhật trạng thái bản ghi gán máu
                ubu.Status = "Returned";
                _context.UrgentRequestBloodUnits.Update(ubu);

                // Cập nhật trạng thái túi máu về Available nếu đang Reserved
                var bloodUnit = await _context.BloodUnits.FindAsync(ubu.BloodUnitId);
                if (bloodUnit != null && bloodUnit.BloodStatus == "Reserved")
                {
                    bloodUnit.BloodStatus = "Available";
                    _context.BloodUnits.Update(bloodUnit);
                }
            }
            // --- End bổ sung ---

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

        [HttpGet("{id}/suggest-blood-units")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> SuggestBloodUnits(int id, [FromQuery] int? bloodTypeId = null, [FromQuery] int? componentId = null)
        {
            // Lấy thông tin yêu cầu khẩn cấp
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");

            // Sử dụng bloodTypeId từ query parameter nếu có,否则 sử dụng từ urgent request
            var requestedBloodTypeId = bloodTypeId ?? urgentRequest.RequestedBloodTypeId;
            
            // Lấy các nhóm máu tương thích
            var compatibleBloodTypeIds = await _context.BloodCompatibilityRules
                .Where(r => r.BloodRecieveId == requestedBloodTypeId && r.IsCompatible)
                .Select(r => r.BloodGiveId)
                .ToListAsync();
            if (!compatibleBloodTypeIds.Contains(requestedBloodTypeId))
                compatibleBloodTypeIds.Add(requestedBloodTypeId);

            // 1. Máu Available đúng nhóm máu
            var availableExactQuery = _context.BloodUnits
                .Include(bu => bu.BloodType)
                .Include(bu => bu.Component)
                .Where(bu => bu.BloodTypeId == requestedBloodTypeId && bu.BloodStatus == "Available" && bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) && bu.RemainingVolume > 0);
            
            // Nếu có componentId, thêm điều kiện lọc theo thành phần
            if (componentId.HasValue)
            {
                availableExactQuery = availableExactQuery.Where(bu => bu.ComponentId == componentId.Value);
            }
            
            var availableExact = await availableExactQuery.ToListAsync();

            // 2. Máu Available nhóm tương thích (khác nhóm nhưng truyền được)
            var availableCompatibleQuery = _context.BloodUnits
                .Include(bu => bu.BloodType)
                .Include(bu => bu.Component)
                .Where(bu => bu.BloodTypeId != requestedBloodTypeId && compatibleBloodTypeIds.Contains(bu.BloodTypeId) && bu.BloodStatus == "Available" && bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) && bu.RemainingVolume > 0);
            
            // Nếu có componentId, thêm điều kiện lọc theo thành phần
            if (componentId.HasValue)
            {
                availableCompatibleQuery = availableCompatibleQuery.Where(bu => bu.ComponentId == componentId.Value);
            }
            
            var availableCompatible = await availableCompatibleQuery.ToListAsync();

            // 3. Máu Reserved (chỉ trả về nếu 2 nhóm trên không đủ)
            List<BloodUnit> reserved = new();
            if (availableExact.Count + availableCompatible.Count == 0)
            {
                var reservedQuery = _context.BloodUnits
                    .Include(bu => bu.BloodType)
                    .Include(bu => bu.Component)
                    .Where(bu => (bu.BloodTypeId == requestedBloodTypeId || compatibleBloodTypeIds.Contains(bu.BloodTypeId)) && bu.BloodStatus == "Reserved" && bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) && bu.RemainingVolume > 0);
                
                // Nếu có componentId, thêm điều kiện lọc theo thành phần
                if (componentId.HasValue)
                {
                    reservedQuery = reservedQuery.Where(bu => bu.ComponentId == componentId.Value);
                }
                
                reserved = await reservedQuery.ToListAsync();
            }

            return Ok(new
            {
                availableExact = availableExact.Select(bu => new {
                    bu.BloodUnitId,
                    bu.BloodType.BloodTypeName,
                    bu.Component.ComponentName,
                    bu.Volume,
                    bu.RemainingVolume,
                    bu.ExpiryDate,
                    bu.BloodStatus
                }),
                availableCompatible = availableCompatible.Select(bu => new {
                    bu.BloodUnitId,
                    bu.BloodType.BloodTypeName,
                    bu.Component.ComponentName,
                    bu.Volume,
                    bu.RemainingVolume,
                    bu.ExpiryDate,
                    bu.BloodStatus
                }),
                reserved = reserved.Select(bu => new {
                    bu.BloodUnitId,
                    bu.BloodType.BloodTypeName,
                    bu.Component.ComponentName,
                    bu.Volume,
                    bu.RemainingVolume,
                    bu.ExpiryDate,
                    bu.BloodStatus
                })
            });
        }

        [HttpGet("pending")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetPendingUrgentBloodRequests()
        {
            var pendingUrgentRequests = await _context.UrgentBloodRequests
                                                .Where(ubr => ubr.Status == "Pending")
                                                .Include(ubr => ubr.BloodType)
                                                .Include(ubr => ubr.CreatedByUser)
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
                ubr.RelatedTransfusionRequestId,
                CreatedByUserId = ubr.CreatedByUserId,
                CreatedByUserName = ubr.CreatedByUser != null ? ubr.CreatedByUser.FullName : null
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
                   ubr.UrgentRequestId,
                   ubr.PatientName,
                   ubr.RequestedBloodTypeId,
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
                })
                .ToListAsync());
        }
        // --- Tín Coding: End ---

        [HttpGet("{id}/reserved-blood-units")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> GetReservedBloodUnits(int id)
        {
            // Lấy thông tin yêu cầu khẩn cấp
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");

            var requestedBloodTypeId = urgentRequest.RequestedBloodTypeId;
            
            // Lấy các nhóm máu tương thích
            var compatibleBloodTypeIds = await _context.BloodCompatibilityRules
                .Where(r => r.BloodRecieveId == requestedBloodTypeId && r.IsCompatible)
                .Select(r => r.BloodGiveId)
                .ToListAsync();
            if (!compatibleBloodTypeIds.Contains(requestedBloodTypeId))
                compatibleBloodTypeIds.Add(requestedBloodTypeId);

            // Lấy danh sách máu Reserved đang đặt cho ca truyền máu thường
            var reservedBloodUnits = await _context.BloodUnits
                .Include(bu => bu.BloodType)
                .Include(bu => bu.Component)
                .Where(bu => (bu.BloodTypeId == requestedBloodTypeId || compatibleBloodTypeIds.Contains(bu.BloodTypeId)) 
                            && bu.BloodStatus == "Reserved" 
                            && bu.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) 
                            && bu.RemainingVolume > 0)
                .ToListAsync();

            var results = new List<object>();

            foreach (var bloodUnit in reservedBloodUnits)
            {
                // Tìm thông tin reservation của máu này
                var reservation = await _context.BloodReservations
                    .Include(r => r.Transfusion)
                        .ThenInclude(tr => tr.Member)
                    .FirstOrDefaultAsync(r => r.BloodUnitId == bloodUnit.BloodUnitId && r.Status == "Active");

                if (reservation != null)
                {
                    results.Add(new
                    {
                        bloodUnit.BloodUnitId,
                        bloodUnit.BloodType.BloodTypeName,
                        bloodUnit.Component.ComponentName,
                        bloodUnit.Volume,
                        bloodUnit.RemainingVolume,
                        bloodUnit.ExpiryDate,
                        bloodUnit.BloodStatus,
                        ReservedForTransfusionId = reservation.TransfusionId,
                        ReservedForPatientName = reservation.Transfusion.PatientCondition,
                        ReservedDate = reservation.ReservedAt,
                        ReservationId = reservation.ReservationId
                    });
                }
            }

            return Ok(results);
        }

        [HttpPatch("{id}/assign-blood-units")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> AssignBloodUnitsToUrgentRequest(int id, [FromBody] AssignUrgentBloodUnitsInputDTO model)
        {
            if (model?.BloodUnits == null || model.BloodUnits.Count == 0)
                return BadRequest("Danh sách đơn vị máu không được để trống.");

            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");
            if (urgentRequest.Status == "Fulfilled" || urgentRequest.Status == "Cancelled")
                return BadRequest("Yêu cầu đã hoàn thành hoặc đã hủy.");

            int totalVolume = model.BloodUnits.Sum(bu => bu.AssignedVolume);
            // Có thể kiểm tra tổng thể tích nếu cần

            // Lấy nhóm máu yêu cầu
            var requestedBloodType = await _context.BloodTypes.FindAsync(urgentRequest.RequestedBloodTypeId);
            if (requestedBloodType == null)
                return StatusCode(500, "Không tìm thấy thông tin nhóm máu yêu cầu.");

            // Lấy thông tin user hiện tại để log
            var currentUserId = int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) ? userId : 0;
            var currentUser = await _context.Users.FindAsync(currentUserId);

            foreach (var bu in model.BloodUnits)
            {
                var bloodUnit = await _context.BloodUnits.FindAsync(bu.BloodUnitId);
                if (bloodUnit == null)
                    return BadRequest($"Không tìm thấy đơn vị máu {bu.BloodUnitId}");
                if (bloodUnit.RemainingVolume < bu.AssignedVolume)
                    return BadRequest($"Đơn vị máu {bu.BloodUnitId} không đủ thể tích!");
                if (bloodUnit.ExpiryDate < DateOnly.FromDateTime(DateTime.Now))
                    return BadRequest($"Đơn vị máu {bu.BloodUnitId} đã hết hạn!");

                // Thêm log kiểm tra giá trị truyền vào và rule tương thích
                var compatibleRules = await _context.BloodCompatibilityRules
                    .Where(rule =>
                        rule.BloodGiveId == bloodUnit.BloodTypeId &&
                        rule.BloodRecieveId == requestedBloodType.BloodTypeId &&
                        rule.IsCompatible == true &&
                        (bu.ComponentId == null || rule.ComponentId == bu.ComponentId)
                    ).ToListAsync();
                bool isCompatible = compatibleRules.Any();
                if (!isCompatible)
                    return BadRequest($"Đơn vị máu {bu.BloodUnitId} không tương thích với người nhận!");

                // Xử lý theo trạng thái máu
                if (bloodUnit.BloodStatus == "Available")
                {
                    // Logic xử lý máu Available (giữ nguyên như cũ)
                    bloodUnit.BloodStatus = "Reserved";
                    _context.BloodUnits.Update(bloodUnit);
                }
                else if (bloodUnit.BloodStatus == "Reserved")
                {
                    // Logic xử lý máu Reserved: hủy liên kết với ca truyền máu thường cũ
                    var existingReservation = await _context.BloodReservations
                        .Include(r => r.Transfusion)
                        .FirstOrDefaultAsync(r => r.BloodUnitId == bu.BloodUnitId && r.Status == "Active");
                    
                    if (existingReservation != null)
                    {
                        // Hủy liên kết với ca truyền máu thường cũ
                        existingReservation.Status = "Cancelled";
                        _context.BloodReservations.Update(existingReservation);

                        // Log lại thông tin hủy liên kết
                        var logEntry = new
                        {
                            LogType = "BloodReservationCancelled",
                            BloodUnitId = bu.BloodUnitId,
                            CancelledTransfusionId = existingReservation.TransfusionId,
                            UrgentRequestId = id,
                            CancelledByUserId = currentUserId,
                            CancelledByUserName = currentUser?.FullName ?? "Unknown",
                            CancelledDate = DateTime.UtcNow,
                            Reason = $"Ưu tiên cho yêu cầu máu khẩn cấp ID: {id}, Bệnh nhân: {urgentRequest.PatientName}",
                            CancelledTransfusionPatient = existingReservation.Transfusion?.PatientCondition ?? "Unknown"
                        };

                        // TODO: Lưu log vào bảng Logs hoặc ghi file log
                    }
                }
                else
                {
                    return BadRequest($"Đơn vị máu {bu.BloodUnitId} không sẵn sàng (trạng thái: {bloodUnit.BloodStatus})!");
                }

                // Tạo bản ghi liên kết trong bảng UrgentRequestBloodUnits
                _context.Add(new UrgentRequestBloodUnit
                {
                    UrgentRequestId = id,
                    BloodUnitId = bu.BloodUnitId,
                    AssignedVolume = bu.AssignedVolume,
                    ComponentId = bu.ComponentId,
                    AssignedDate = DateTime.Now,
                    Status = "Assigned"
                });
            }
            
            urgentRequest.Status = "InProgress";
            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Đã gán máu cho yêu cầu khẩn cấp thành công." });
        }

        [HttpPatch("{id}/fulfill")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> FulfillUrgentRequest(int id, [FromBody] List<FulfillBloodUnitInput> usedUnits)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");
            if (urgentRequest.Status == "Fulfilled" || urgentRequest.Status == "Cancelled")
                return BadRequest("Yêu cầu đã hoàn thành hoặc đã hủy.");

            // Lấy các bản ghi máu đã gán cho yêu cầu này
            var assignedUnits = await _context.UrgentRequestBloodUnits
                .Where(ubu => ubu.UrgentRequestId == id && (ubu.Status == "Assigned" || ubu.Status == "PartialUsed"))
                .ToListAsync();

            foreach (var used in usedUnits)
            {
                var ubu = assignedUnits.FirstOrDefault(x => x.BloodUnitId == used.BloodUnitId);
                if (ubu == null) continue;
                var bloodUnit = await _context.BloodUnits.FindAsync(used.BloodUnitId);
                if (bloodUnit == null) continue;

                // Trừ máu thực tế
                if (used.UsedVolume >= ubu.AssignedVolume)
                {
                    ubu.Status = "Used";
                    bloodUnit.RemainingVolume -= ubu.AssignedVolume;
                }
                else if (used.UsedVolume > 0)
                {
                    ubu.Status = "PartialUsed";
                    bloodUnit.RemainingVolume -= used.UsedVolume;
                }
                else
                {
                    ubu.Status = "Returned";
                }
                _context.UrgentRequestBloodUnits.Update(ubu);

                // Nếu máu đã dùng hết, chuyển trạng thái túi máu sang Used
                if (bloodUnit.RemainingVolume <= 0)
                {
                    bloodUnit.RemainingVolume = 0;
                    bloodUnit.BloodStatus = "Used";
                }
                else
                {
                    // Nếu máu còn dư và không còn gán cho ca nào khác, chuyển sang Available
                    var stillAssigned = await _context.UrgentRequestBloodUnits.AnyAsync(x => x.BloodUnitId == bloodUnit.BloodUnitId && (x.Status == "Assigned" || x.Status == "PartialUsed"));
                    if (!stillAssigned)
                    {
                        bloodUnit.BloodStatus = "Available";
                    }
                }
                _context.BloodUnits.Update(bloodUnit);
            }

            urgentRequest.Status = "Fulfilled";
            urgentRequest.CompletionDate = DateTime.UtcNow;
            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã hoàn thành yêu cầu khẩn cấp và cập nhật kho máu." });
        }

        public class FulfillBloodUnitInput
        {
            public int BloodUnitId { get; set; }
            public int UsedVolume { get; set; }
        }

        [HttpPatch("{id}/actual-blood-type")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> UpdateUrgentBloodRequestActualBloodType(int id, [FromBody] UpdateUrgentBloodRequestDTO model)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");

            if (model.RequestedBloodTypeId != null)
                urgentRequest.RequestedBloodTypeId = model.RequestedBloodTypeId.Value;

            // Có thể cập nhật thêm các trường khác nếu muốn

            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã cập nhật nhóm máu thực tế cho yêu cầu máu khẩn cấp." });
        }

        public class UpdateUrgentBloodRequestDTO
        {
            public int? RequestedBloodTypeId { get; set; }
            // Có thể thêm các trường khác nếu muốn cập nhật nhiều thông tin
        }
    }
} 