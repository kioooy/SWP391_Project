using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries; // Thêm namespace cho Point
using System.Net;
using System.Net.Mail;
using System.Security.Claims;

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
                RequestedBloodTypeId = 99, // Không Biết
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

        /// <summary>
        /// API gợi ý đơn vị máu phù hợp cho yêu cầu khẩn cấp
        /// NGHIỆP VỤ: Tiêu chí chọn nhóm máu phù hợp theo thứ tự ưu tiên
        /// </summary>
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
            
            // ===== NGHIỆP VỤ: XÁC ĐỊNH NHÓM MÁU TƯƠNG THÍCH =====
            // Dựa trên bảng BloodCompatibilityRules để xác định các nhóm máu có thể truyền cho nhau
            // Ví dụ: Người nhận A+ có thể nhận từ A+, A-, O+, O-
            var compatibleBloodTypeIds = await _context.BloodCompatibilityRules
                .Where(r => r.BloodRecieveId == requestedBloodTypeId && r.IsCompatible)
                .Select(r => r.BloodGiveId)
                .ToListAsync();
            if (!compatibleBloodTypeIds.Contains(requestedBloodTypeId))
                compatibleBloodTypeIds.Add(requestedBloodTypeId);

            // ===== TIÊU CHÍ 1: MÁU CÙNG NHÓM (ƯU TIÊN CAO NHẤT) =====
            // Ưu tiên máu cùng nhóm với người nhận (ví dụ: A+ cho A+)
            // Điều kiện: Available, chưa hết hạn, còn thể tích
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

            // ===== TIÊU CHÍ 2: MÁU TƯƠNG THÍCH (ƯU TIÊN THỨ 2) =====
            // Nếu không có máu cùng nhóm, tìm máu tương thích (ví dụ: O+ cho A+)
            // Điều kiện: Available, chưa hết hạn, còn thể tích, thuộc nhóm tương thích
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

            // ===== TIÊU CHÍ 3: MÁU ĐÃ ĐẶT TRƯỚC (ƯU TIÊN THỨ 3) =====
            // Chỉ xem xét máu Reserved nếu 2 nhóm trên không đủ
            // Có thể lấy máu đã đặt cho ca truyền máu thường để ưu tiên cho khẩn cấp
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

            // ===== TIÊU CHÍ 4: TÌM NGƯỜI HIẾN MÁU (CUỐI CÙNG) =====
            // Nếu không có máu trong kho, tìm người hiến máu trong bán kính 20km
            // Điều kiện: Đủ điều kiện hiến máu, nhóm máu tương thích, không có lịch hiến sắp tới
            List<object> eligibleDonors = new();
            
            if ((availableExact.Count + availableCompatible.Count + reserved.Count) == 0)
            {
                // Sử dụng logic giống BloodDistanceSearchController - lấy vị trí trung tâm từ bệnh viện
                var hospital = await _context.Hospitals.FirstOrDefaultAsync();
                if (hospital?.Location != null)
                {
                    var center = hospital.Location;
                    const double searchRadiusMeters = 20000.0; // Bán kính tìm kiếm 20km = 20000m

                    // ===== NGHIỆP VỤ: TIÊU CHÍ CHỌN NGƯỜI HIẾN MÁU (CHUẨN HÓA THEO BloodDistanceSearch) =====
                    // 1. Member phải là donor (IsDonor = true)
                    // 2. Phải có thông tin vị trí (Location)
                    // 3. Nhóm máu phải tương thích với người nhận
                    // 4. Khoảng cách <= bán kính tìm kiếm
                    // 5. Đủ điều kiện hiến máu (84 ngày sau lần hiến gần nhất)
                    // 6. Không có lịch hiến sắp tới
                    // 7. Không trong thời gian phục hồi sau truyền máu (365 ngày)
                    
                    var donors = await _context.Members
                        .Where(m => m.IsDonor == true && m.Location != null)
                        .Where(m => compatibleBloodTypeIds.Contains(m.BloodTypeId ?? 0)) // Lọc theo nhóm máu tương thích
                        .Where(m => m.Location.Distance(center) <= searchRadiusMeters) // Lọc theo khoảng cách (sử dụng NetTopologySuite)
                        .Select(m => new {
                            m.UserId,
                            m.User.FullName,
                            Phone = m.User.PhoneNumber,
                            m.User.Email,
                            BloodTypeId = m.BloodTypeId,
                            BloodType = m.BloodType.BloodTypeName,
                            m.User.Address,
                            Latitude = m.Location.Y,
                            Longitude = m.Location.X,
                            Distance = m.Location.Distance(center), // Khoảng cách theo mét
                            m.Weight,
                            m.Height,
                            m.LastDonationDate
                        })
                        .ToListAsync();

                    // Lọc tiếp trên C# với điều kiện ngày phục hồi (giống BloodDistanceSearch)
                    // Nếu chưa từng hiến máu (LastDonationDate == null) thì ĐỦ điều kiện!
                    var filteredDonors = donors
                        .Where(m => (m.LastDonationDate == null ||
                                    (DateTime.Now - m.LastDonationDate.Value.ToDateTime(TimeOnly.MinValue)).TotalDays >= 84)) // ĐÚNG NGHIỆP VỤ
                        // Loại trừ member vừa truyền máu xong (trong vòng 365 ngày)
                        .Where(m => !_context.TransfusionRequests.Any(tr => tr.MemberId == m.UserId && tr.Status == "Completed" && tr.CompletionDate.HasValue && tr.CompletionDate.Value > DateTime.Now.AddDays(-365)))
                        // Loại trừ member có lịch hiến máu sắp tới (Pending hoặc Approved, có PreferredDonationDate hoặc PeriodDateFrom >= hôm nay)
                        .Where(m => !_context.DonationRequests.Any(dr => dr.MemberId == m.UserId
                            && (dr.Status == "Pending" || dr.Status == "Approved")
                            && (
                                (dr.PreferredDonationDate.HasValue && dr.PreferredDonationDate.Value >= DateOnly.FromDateTime(DateTime.Today))
                                || (!dr.PreferredDonationDate.HasValue && dr.Period.PeriodDateFrom >= DateTime.Today)
                            )
                        )) // ĐÚNG NGHIỆP VỤ: chỉ loại khi member có lịch hiến máu sắp tới thực sự
                        .Select(m => new
                        {
                            m.UserId,
                            m.FullName,
                            m.Phone,
                            m.Email,
                            BloodTypeName = m.BloodType,
                            DistanceKm = Math.Round(m.Distance / 1000.0, 2), // Khoảng cách theo km
                            LastDonationDate = m.LastDonationDate
                        })
                        .OrderBy(d => d.DistanceKm) // Sắp xếp theo khoảng cách gần nhất
                        .ToList();

                    eligibleDonors = filteredDonors.Select(d => (object)d).ToList();
                }
            }

            // ===== PHẦN TRẢ VỀ DỮ LIỆU CHO FRONTEND =====
            // Đây là phần nghiệp vụ trả về dữ liệu gợi ý túi máu cho yêu cầu khẩn cấp
            // Giảng viên có thể xem phần này để hiểu cấu trúc dữ liệu trả về
            return Ok(new
            {
                // ===== TIÊU CHÍ 1: MÁU CÙNG NHÓM (ƯU TIÊN CAO NHẤT) =====
                // Trả về danh sách túi máu cùng nhóm với người nhận (ví dụ: A+ cho A+)
                // Điều kiện: Available, chưa hết hạn, còn thể tích
                availableExact = availableExact.Select(bu => new {
                    bu.BloodUnitId,           // ID túi máu
                    bu.BloodType.BloodTypeName, // Tên nhóm máu (A+, B-, O+, etc.)
                    bu.Component.ComponentName, // Tên thành phần máu (Toàn phần, Hồng cầu, etc.)
                    bu.Volume,                // Thể tích ban đầu
                    bu.RemainingVolume,       // Thể tích còn lại
                    bu.ExpiryDate,            // Ngày hết hạn
                    bu.BloodStatus            // Trạng thái máu (Available)
                }),
                
                // ===== TIÊU CHÍ 2: MÁU TƯƠNG THÍCH (ƯU TIÊN THỨ 2) =====
                // Trả về danh sách túi máu tương thích (ví dụ: O+ cho A+)
                // Điều kiện: Available, chưa hết hạn, còn thể tích, thuộc nhóm tương thích
                availableCompatible = availableCompatible.Select(bu => new {
                    bu.BloodUnitId,           // ID túi máu
                    bu.BloodType.BloodTypeName, // Tên nhóm máu tương thích
                    bu.Component.ComponentName, // Tên thành phần máu
                    bu.Volume,                // Thể tích ban đầu
                    bu.RemainingVolume,       // Thể tích còn lại
                    bu.ExpiryDate,            // Ngày hết hạn
                    bu.BloodStatus            // Trạng thái máu (Available)
                }),
                
                // ===== TIÊU CHÍ 3: MÁU ĐÃ ĐẶT TRƯỚC (ƯU TIÊN THỨ 3) =====
                // Trả về danh sách túi máu đã đặt cho ca truyền máu thường
                // Có thể lấy để ưu tiên cho yêu cầu khẩn cấp
                reserved = reserved.Select(bu => new {
                    bu.BloodUnitId,           // ID túi máu
                    bu.BloodType.BloodTypeName, // Tên nhóm máu
                    bu.Component.ComponentName, // Tên thành phần máu
                    bu.Volume,                // Thể tích ban đầu
                    bu.RemainingVolume,       // Thể tích còn lại
                    bu.ExpiryDate,            // Ngày hết hạn
                    bu.BloodStatus            // Trạng thái máu (Reserved)
                }),
                
                // ===== TIÊU CHÍ 4: NGƯỜI HIẾN MÁU (CUỐI CÙNG) =====
                // Trả về danh sách người hiến máu trong bán kính 20km
                // Chỉ hiển thị khi không có máu trong kho
                // Điều kiện: Đủ điều kiện hiến máu, nhóm máu tương thích, không có lịch hiến sắp tới
                eligibleDonors = eligibleDonors // Danh sách người hiến máu phù hợp
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

        // Sent Email Donor To Call Volunteer 
        [HttpPost("send-email-donor")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> SendEmailToDonor([FromBody] EmailToDonor model)
        {
            if (model == null)
                return NotFound("Không Tìm Thấy Email Để Gửi.");
            
            // ===== NGHIỆP VỤ: LẤY THÔNG TIN YÊU CẦU KHẨN CẤP =====
            // Lấy thông tin chi tiết của yêu cầu khẩn cấp để hiển thị trong email
            var urgentRequest = await _context.UrgentBloodRequests
                .Include(ubr => ubr.BloodType)
                .FirstOrDefaultAsync(ubr => ubr.UrgentRequestId == model.UrgentRequestId);
            
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");
            
            // Lấy tên nhóm máu cần thiết
            string bloodTypeName = urgentRequest.BloodType?.BloodTypeName ?? "Không biết";
            
            // Gửi email đến người hiến máu
            MailAddressCollection mailSent = new MailAddressCollection();
            MailMessage mail = new MailMessage();

            mail.From = new MailAddress("tinbusiness.work@gmail.com"); // My Email Address
            foreach (var email in model.Email)
                mail.Bcc.Add(new MailAddress(email)); // Add each email address from the model           
            mail.Priority = MailPriority.High; // High Priority ( Important )
            
            mail.Subject = "🩸 YÊU CẦU MÁU KHẨN CẤP";
            mail.Body = $@"<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;'>
                            <h2 style='color: #dc3545; text-align: center; margin-bottom: 16px;'>🩸 YÊU CẦU MÁU KHẨN CẤP</h2>
                            <p style='font-size: 18px; color: #dc3545; text-align: center; font-weight: bold; margin-bottom: 24px;'>
                                Một mạng người đang cần sự giúp đỡ của bạn!
                            </p>
                            
                            <p style='font-size: 16px; line-height: 1.6; margin-bottom: 16px;'>
                                Xin chào tình nguyện viên thân mến,
                            </p>
                            <p style='font-size: 16px; line-height: 1.6; margin-bottom: 16px;'>
                                Chúng tôi đã nhận được <b>yêu cầu máu khẩn cấp</b> từ một bệnh nhân có nhóm máu phù hợp với bạn.<br>
                                <b>Thời gian là yếu tố sống còn!</b>
                            </p>
                            
                            <div style='background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 16px; border-radius: 8px; margin: 20px 0;'>
                                <h3 style='color: #495057; margin-top: 0; margin-bottom: 12px;'>Thông tin yêu cầu:</h3>
                                <ul style='color: #495057; margin: 8px 0; padding-left: 20px;'>
                                    <li><strong>Loại máu cần:</strong> {bloodTypeName}</li>
                                    <li><strong>Thời gian:</strong> Càng sớm càng tốt</li>
                                    <li><strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học - 118 Đ. Hồng Bàng, Phường 12, Quận 5, Thành phố Hồ Chí Minh</li>
                                </ul>
                            </div>
                            
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='http://localhost:3000/urgent-donation-registration' 
                                   style='background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);'>
                                    TÔI CÓ THỂ HIẾN MÁU NGAY
                                </a>
                            </div>
                            
                            <p style='font-size: 14px; color: #6c757d; margin-top: 20px; line-height: 1.5;'>
                                <strong>Lưu ý:</strong> Sau khi xác nhận, bạn sẽ được chuyển đến trang đặt lịch hiến máu nhanh chóng. Vui lòng kiểm tra điều kiện sức khỏe trước khi xác nhận.
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
            mail.IsBodyHtml = true; // Mark Body Is HTML 

            try
            {
                using (SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587))
                {
                    smtp.EnableSsl = true; // Enable SSL
                    smtp.UseDefaultCredentials = false; // Use default credentials
                    smtp.Credentials = new NetworkCredential("tinbusiness.work", "hbuv ayid svux duza"); // Use app-specific password
                    await smtp.SendMailAsync(mail); // Send email asynchronously
                }
            }
            catch (Exception)
            {
                return BadRequest("Lỗi khi gửi email");
            }
            
            return Ok("Email đã được gửi thành công.");
        }

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

                // ===== NGHIỆP VỤ: KIỂM TRA TÍNH TƯƠNG THÍCH MÁU =====
                // Kiểm tra xem máu có thể truyền cho người nhận không dựa trên bảng BloodCompatibilityRules
                // Ví dụ: Máu O+ có thể truyền cho A+, B+, AB+, O+ nhưng không thể truyền cho A-, B-, AB-, O-
                // Điều kiện kiểm tra:
                // 1. BloodGiveId = nhóm máu của túi máu
                // 2. BloodRecieveId = nhóm máu của người nhận  
                // 3. IsCompatible = true (có thể truyền)
                // 4. ComponentId phù hợp (nếu có yêu cầu thành phần cụ thể)
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
                    // ===== NGHIỆP VỤ: XỬ LÝ MÁU ĐÃ ĐẶT TRƯỚC =====
                    // Khi lấy máu Reserved cho yêu cầu khẩn cấp, cần hủy liên kết với ca truyền máu thường
                    // Nguyên tắc: Yêu cầu khẩn cấp có ưu tiên cao hơn ca truyền máu thường
                    var existingReservation = await _context.BloodReservations
                        .Include(r => r.Transfusion)
                        .FirstOrDefaultAsync(r => r.BloodUnitId == bu.BloodUnitId && r.Status == "Active");
                    
                    if (existingReservation != null)
                    {
                        // ===== NGHIỆP VỤ: HỦY LIÊN KẾT VỚI CA TRUYỀN MÁU THƯỜNG =====
                        // Chuyển trạng thái reservation từ "Active" sang "Cancelled"
                        // Lý do: Ưu tiên cho yêu cầu khẩn cấp
                        existingReservation.Status = "Cancelled";
                        _context.BloodReservations.Update(existingReservation);

                        // ===== NGHIỆP VỤ: LOG LẠI THÔNG TIN HỦY LIÊN KẾT =====
                        // Ghi lại thông tin để theo dõi và báo cáo
                        // Có thể lưu vào bảng Logs hoặc ghi file log
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

        /// <summary>
        /// API hoàn thành yêu cầu máu khẩn cấp
        /// NGHIỆP VỤ: Cập nhật trạng thái máu và yêu cầu sau khi hoàn thành
        /// </summary>
        [HttpPatch("{id}/fulfill")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> FulfillUrgentRequest(int id)
        {
            var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
            if (urgentRequest == null)
                return NotFound("Không tìm thấy yêu cầu máu khẩn cấp.");
            if (urgentRequest.Status == "Fulfilled" || urgentRequest.Status == "Cancelled")
                return BadRequest("Yêu cầu đã hoàn thành hoặc đã hủy.");

            // ===== NGHIỆP VỤ: LẤY DANH SÁCH MÁU ĐÃ GÁN =====
            // Lấy các bản ghi máu đã gán cho yêu cầu này (trạng thái "Assigned")
            var assignedUnits = await _context.UrgentRequestBloodUnits
                .Where(ubu => ubu.UrgentRequestId == id && ubu.Status == "Assigned")
                .ToListAsync();

            foreach (var ubu in assignedUnits)
            {
                var bloodUnit = await _context.BloodUnits.FindAsync(ubu.BloodUnitId);
                if (bloodUnit == null) continue;

                // ===== NGHIỆP VỤ: CẬP NHẬT TRẠNG THÁI MÁU ĐÃ SỬ DỤNG =====
                // Chuyển trạng thái từ "Assigned" sang "Used" (đã sử dụng)
                ubu.Status = "Used";
                // Giảm thể tích còn lại của túi máu
                bloodUnit.RemainingVolume -= ubu.AssignedVolume;
                _context.UrgentRequestBloodUnits.Update(ubu);

                // ===== NGHIỆP VỤ: XỬ LÝ TRẠNG THÁI TÚI MÁU =====
                // Nếu máu đã dùng hết (RemainingVolume <= 0), chuyển trạng thái sang "Used"
                if (bloodUnit.RemainingVolume <= 0)
                {
                    bloodUnit.RemainingVolume = 0;
                    bloodUnit.BloodStatus = "Used";
                }
                else
                {
                    // ===== NGHIỆP VỤ: KIỂM TRA VÀ CẬP NHẬT TRẠNG THÁI TÚI MÁU =====
                    // Nếu máu còn dư và không còn gán cho ca nào khác, chuyển sang "Available"
                    // Điều kiện: Không còn bản ghi nào trong UrgentRequestBloodUnits với trạng thái "Assigned"
                    var stillAssigned = await _context.UrgentRequestBloodUnits.AnyAsync(x => x.BloodUnitId == bloodUnit.BloodUnitId && x.Status == "Assigned");
                    if (!stillAssigned)
                    {
                        bloodUnit.BloodStatus = "Available";
                    }
                }
                _context.BloodUnits.Update(bloodUnit);
            }

            // ===== NGHIỆP VỤ: HOÀN THÀNH YÊU CẦU KHẨN CẤP =====
            // Chuyển trạng thái yêu cầu từ "InProgress" sang "Fulfilled"
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
