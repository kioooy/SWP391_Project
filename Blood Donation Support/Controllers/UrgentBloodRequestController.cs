using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

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
                return BadRequest(new { error = $"Requested BloodType ID {model.RequestedBloodTypeId} không tồn tại." });
            }

            var urgentRequest = new UrgentBloodRequest
            {
                PatientName = model.PatientName,
                RequestedBloodTypeId = model.RequestedBloodTypeId,
                Reason = model.Reason,
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
                CreatedByUserName = urgentRequest.CreatedByUser != null ? urgentRequest.CreatedByUser.FullName : null
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

        // [HttpPatch("{id}/update-status")]
        // [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Staff,Admin")]
        // public async Task<IActionResult> UpdateUrgentRequestStatus(int id, [FromBody] UpdateUrgentRequestStatusDTO model)
        // {
        //     var urgentRequest = await _context.UrgentBloodRequests.FindAsync(id);
        //     if (urgentRequest == null)
        //     {
        //         return NotFound();
        //     }

        //     urgentRequest.Status = model.Status;
        //     if (model.Status == "Fulfilled" || model.Status == "Cancelled")
        //     {
        //         urgentRequest.CompletionDate = DateTime.UtcNow;
        //     }

        //     _context.UrgentBloodRequests.Update(urgentRequest);
        //     await _context.SaveChangesAsync();

        //     return Ok(new { message = $"Trạng thái yêu cầu khẩn cấp {id} đã được cập nhật thành {model.Status}." });
        // }

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
    }
} 