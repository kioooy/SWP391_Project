using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using NetTopologySuite.Geometries; // Thêm namespace cho Point

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
                RequestDate = DateTime.Now, // Ghi nhận thời gian tạo yêu cầu
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
                    CreatedAt = DateTime.Now,
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
                AssignedBloodUnits = assignedBloodUnits.Select(abu => new
                {
                    abu.BloodUnitId,
                    abu.BloodTypeName,
                    abu.ComponentName,
                    abu.AssignedVolume,
                    abu.Status,
                    abu.BloodStatus
                }).ToList()
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
            urgentRequest.CompletionDate = DateTime.Now;
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

            // Sử dụng bloodTypeId từ query parameter nếu có sử dụng từ urgent request
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

            // 4. Tìm kiếm người hiến máu đủ điều kiện trong bán kính 20km nếu không có máu trong kho
            List<object> eligibleDonors = new();
            if ((availableExact.Count + availableCompatible.Count + reserved.Count) == 0)
            {
                // Chuyển đổi EmergencyLocation của yêu cầu khẩn cấp thành Point
                var emergencyPoint = ParseLocationToPoint(urgentRequest.EmergencyLocation);
                const double searchRadiusKm = 20.0; // Bán kính tìm kiếm 20km

                if (emergencyPoint != null)
                {
                    var minDonationIntervalDays = 84; // 84 ngày
                    // var minTransfusionRecoveryDays = 365; // 365 ngày - Tạm thời bỏ qua do không tìm thấy trường LastTransfusionDate

                    var potentialDonors = await _context.Users
                        .Include(u => u.Member)
                            .ThenInclude(m => m.BloodType) // Bao gồm BloodType của Member
                        .Where(u => u.IsActive == true && u.Member != null && u.Member.IsDonor == true && u.Member.Location != null) // Sửa IsDonor
                        .Where(u => compatibleBloodTypeIds.Contains(u.Member.BloodTypeId ?? 0)) // Lọc theo nhóm máu tương thích
                        .Where(u => (u.Member.LastDonationDate == null || EF.Functions.DateDiffDay(u.Member.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue), DateTime.Today) >= minDonationIntervalDays))
                        // Kiểm tra lịch hiến máu sắp tới trong bảng DonationRequests
                        .Where(u => !_context.DonationRequests.Any(dr => dr.MemberId == u.Member.UserId && dr.Status == "Scheduled" && dr.PreferredDonationDate >= DateOnly.FromDateTime(DateTime.Today)))
                        .ToListAsync(); // Lấy dữ liệu về client trước

                    eligibleDonors = potentialDonors
                        .AsEnumerable() // Chuyển sang client-side evaluation để tính khoảng cách
                        .Where(u => CalculateDistance(emergencyPoint, u.Member.Location) <= searchRadiusKm)
                        .Select(u => new
                        {
                            u.UserId,
                            u.FullName,
                            u.PhoneNumber, // Thay thế ContactPhone bằng PhoneNumber
                            u.Email,       // Thay thế ContactEmail bằng Email
                            u.Address,
                            BloodTypeName = u.Member.BloodType != null ? u.Member.BloodType.BloodTypeName : "Không biết",
                            u.Member.LastDonationDate,
                            DistanceKm = CalculateDistance(emergencyPoint, u.Member.Location) // Thêm khoảng cách vào kết quả
                        })
                        .OrderBy(d => d.DistanceKm) // Sắp xếp theo khoảng cách
                        .ToList<object>();
                }
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
                }),
                eligibleDonors = eligibleDonors // Thêm danh sách người hiến máu
            });
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
                            CancelledDate = DateTime.Now,
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
        public async Task<IActionResult> FulfillUrgentRequest(int id)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");
            if (urgentRequest.Status == "Fulfilled" || urgentRequest.Status == "Cancelled")
                return BadRequest("Yêu cầu đã hoàn thành hoặc đã hủy.");

            // Lấy các bản ghi máu đã gán cho yêu cầu này
            var assignedUnits = await _context.UrgentRequestBloodUnits
                .Where(ubu => ubu.UrgentRequestId == id && ubu.Status == "Assigned")
                .ToListAsync();

            foreach (var ubu in assignedUnits)
            {
                var bloodUnit = await _context.BloodUnits.FindAsync(ubu.BloodUnitId);
                if (bloodUnit == null) continue;

                // Sử dụng toàn bộ lượng máu đã được gán
                ubu.Status = "Used";
                bloodUnit.RemainingVolume -= ubu.AssignedVolume;
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
                    var stillAssigned = await _context.UrgentRequestBloodUnits.AnyAsync(x => x.BloodUnitId == bloodUnit.BloodUnitId && x.Status == "Assigned");
                    if (!stillAssigned)
                    {
                        bloodUnit.BloodStatus = "PartialUsed";
                    }
                }
                _context.BloodUnits.Update(bloodUnit);
            }

            urgentRequest.Status = "Fulfilled";
            urgentRequest.CompletionDate = DateTime.Now;
            _context.UrgentBloodRequests.Update(urgentRequest);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã hoàn thành yêu cầu khẩn cấp và cập nhật kho máu." });
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

        /// <summary>
        /// Chuyển đổi chuỗi tọa độ "latitude,longitude" thành đối tượng Point của NetTopologySuite.
        /// </summary>
        /// <param name="locationString">Chuỗi tọa độ (ví dụ: "10.762622,106.660172")</param>
        /// <returns>Đối tượng Point hoặc null nếu chuỗi không hợp lệ.</returns>
        private Point ParseLocationToPoint(string locationString)
        {
            if (string.IsNullOrEmpty(locationString))
            {
                return null;
            }
            var parts = locationString.Split(',');
            if (parts.Length == 2 && double.TryParse(parts[0], System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double lat) && double.TryParse(parts[1], System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double lon))
            {
                // SRID 4326 là WGS84 (hệ tọa độ địa lý)
                return new Point(lon, lat) { SRID = 4326 };
            }
            return null;
        }

        /// <summary>
        /// Tính khoảng cách giữa hai điểm địa lý (Latitude, Longitude) sử dụng công thức Haversine.
        /// </summary>
        /// <param name="point1">Điểm thứ nhất.</param>
        /// <param name="point2">Điểm thứ hai.</param>
        /// <returns>Khoảng cách theo km.</returns>
        private double CalculateDistance(Point point1, Point point2)
        {
            if (point1 == null || point2 == null)
            {
                return double.MaxValue; // Hoặc một giá trị lớn để biểu thị không thể tính toán
            }

            const double R = 6371; // Bán kính Trái Đất bằng km

            var dLat = ToRadians(point2.Y - point1.Y);
            var dLon = ToRadians(point2.X - point1.X);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(point1.Y)) * Math.Cos(ToRadians(point2.Y)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c; // Khoảng cách theo km
        }

        /// <summary>
        /// Chuyển đổi độ sang radian.
        /// </summary>
        /// <param name="angle">Góc theo độ.</param>
        /// <returns>Góc theo radian.</returns>
        private double ToRadians(double angle)
        {
            return Math.PI * angle / 180.0;
        }
    }
}
