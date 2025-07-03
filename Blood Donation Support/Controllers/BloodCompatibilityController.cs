using Blood_Donation_Support.DTO;
using Microsoft.AspNetCore.Mvc;
using Blood_Donation_Support.Data;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BloodCompatibilityController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public BloodCompatibilityController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy các nhóm máu toàn phần tương thích cho một nhóm máu người nhận cụ thể.
        /// API này được thiết kế cho các quy tắc tương thích đặc biệt cho máu toàn phần,
        /// nơi ComponentId thường là NULL trong bảng BloodCompatibilityRules.
        /// </summary>
        /// <param name="nhomMauNguoiNhan">Nhóm máu của người nhận (ví dụ: "A+", "O-").</param>
        /// <returns>Một BloodCompatibilityResponseDto chứa danh sách tên các nhóm máu tương thích.</returns>
        [HttpGet("whole-blood")]
        public async Task<ActionResult<BloodCompatibilityResponseDto>> GetWholeBloodCompatibility([FromQuery] string nhomMauNguoiNhan)
        {
            if (string.IsNullOrWhiteSpace(nhomMauNguoiNhan))
                return BadRequest("Nhóm máu người nhận là bắt buộc.");

            // Tìm BloodTypeId của nhóm máu người nhận từ bảng BloodTypes.
            var thongTinNhomMauNguoiNhan = await _context.BloodTypes
                                                .FirstOrDefaultAsync(bt => bt.BloodTypeName.ToLower() == nhomMauNguoiNhan.ToLower());

            if (thongTinNhomMauNguoiNhan == null)
                return NotFound($"Không tìm thấy nhóm máu người nhận: {nhomMauNguoiNhan}.");

            // Truy vấn bảng BloodCompatibilityRules để tìm các nhóm máu tương thích cho MÁU TOÀN PHẦN.
            // Giả định: Các quy tắc tương thích cho máu toàn phần trong bảng BloodCompatibilityRules có ComponentId là NULL.
            var danhSachIdNhomMauChoTuongThich = await _context.BloodCompatibilityRules
                                                    .Where(rule => rule.BloodRecieveId == thongTinNhomMauNguoiNhan.BloodTypeId
                                                                 && rule.IsCompatible
                                                                 && rule.ComponentId == null) // Lọc các quy tắc cho máu toàn phần (ComponentId = NULL)
                                                    .Select(rule => rule.BloodGiveId)
                                                    .ToListAsync();

            // Lấy tên của các nhóm máu tương thích dựa trên các ID đã tìm được.
            var danhSachTenNhomMauTuongThich = await _context.BloodTypes
                                                        .Where(bt => danhSachIdNhomMauChoTuongThich.Contains(bt.BloodTypeId))
                                                        .Select(bt => bt.BloodTypeName)
                                                        .ToListAsync();

            if (!danhSachTenNhomMauTuongThich.Any())
            {
                return NotFound($"Không tìm thấy nhóm máu toàn phần tương thích cho người nhận {nhomMauNguoiNhan}.");
            }

            return Ok(new BloodCompatibilityResponseDto
            {
                CompatibleBloodTypes = danhSachTenNhomMauTuongThich
            });
        }

        /// <summary>
        /// Lấy các nhóm máu tương thích cho một nhóm máu người nhận và một thành phần máu cụ thể.
        /// API này tự động xác định ComponentId bằng cách tra cứu tên thành phần trong bảng BloodComponents.
        /// </summary>
        /// <param name="nhomMauNguoiNhan">Nhóm máu của người nhận (ví dụ: "A+", "O-").</param>
        /// <param name="thanhPhan">Tên của thành phần máu (ví dụ: "Red Blood Cells", "Plasma", "Platelets", "Whole Blood").</param>
        /// <returns>Một BloodCompatibilityResponseDto chứa danh sách tên các nhóm máu tương thích.</returns>
        [HttpGet("component")]
        public async Task<ActionResult<BloodCompatibilityResponseDto>> GetComponentCompatibility([FromQuery] string nhomMauNguoiNhan, [FromQuery] string thanhPhan)
        {
            if (string.IsNullOrWhiteSpace(nhomMauNguoiNhan) || string.IsNullOrWhiteSpace(thanhPhan))
                return BadRequest("Nhóm máu người nhận và thành phần là bắt buộc.");

            // Tìm BloodTypeId của nhóm máu người nhận.
            var thongTinNhomMauNguoiNhan = await _context.BloodTypes
                                                .FirstOrDefaultAsync(bt => bt.BloodTypeName.ToLower() == nhomMauNguoiNhan.ToLower());

            if (thongTinNhomMauNguoiNhan == null)
                return NotFound($"Không tìm thấy nhóm máu người nhận: {nhomMauNguoiNhan}.");

            // Xác định ComponentId dựa trên tên thành phần yêu cầu.
            var thongTinThanhPhanMau = await _context.BloodComponents
                                        .FirstOrDefaultAsync(c => c.ComponentName.ToLower() == thanhPhan.ToLower());

            if (thongTinThanhPhanMau == null)
                return BadRequest($"Loại thành phần không hợp lệ: {thanhPhan}. Đảm bảo thành phần này tồn tại trong bảng BloodComponents.");
            
            int? idThanhPhanMucTieu = thongTinThanhPhanMau.ComponentId;

            // Truy vấn BloodCompatibilityRules dựa trên nhóm máu người nhận, trạng thái tương thích (IsCompatible = true),
            // VÀ ComponentId đã xác định.
            var danhSachIdNhomMauChoTuongThich = await _context.BloodCompatibilityRules
                                                    .Where(rule => rule.BloodRecieveId == thongTinNhomMauNguoiNhan.BloodTypeId
                                                                 && rule.IsCompatible
                                                                 && rule.ComponentId == idThanhPhanMucTieu)
                                                    .Select(rule => rule.BloodGiveId)
                                                    .ToListAsync();

            // Lấy tên của các nhóm máu tương thích.
            var danhSachTenNhomMauTuongThich = await _context.BloodTypes
                                                        .Where(bt => danhSachIdNhomMauChoTuongThich.Contains(bt.BloodTypeId))
                                                        .Select(bt => bt.BloodTypeName)
                                                        .ToListAsync();

            if (!danhSachTenNhomMauTuongThich.Any())
            {
                return NotFound($"Không tìm thấy loại {thanhPhan} tương thích cho người nhận {nhomMauNguoiNhan}. Vui lòng kiểm tra đầu vào hoặc các quy tắc tương thích.");
            }

            return Ok(new BloodCompatibilityResponseDto
            {
                CompatibleBloodTypes = danhSachTenNhomMauTuongThich
            });
        }

        // Helper method GetCompatibleList removed as it was for hardcoded data
    }
}
