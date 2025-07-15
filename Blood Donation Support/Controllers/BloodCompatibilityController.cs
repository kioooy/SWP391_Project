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
        /// Lấy các nhóm máu toàn phần tương thích cho một user cụ thể (dựa vào BloodTypeId trong bảng Members).
        /// </summary>
        /// <param name="userId">UserId của người nhận.</param>
        /// <returns>Một BloodCompatibilityResponseDto chứa danh sách tên các nhóm máu tương thích.</returns>
        [HttpGet("whole-blood")]
        public async Task<ActionResult<BloodCompatibilityResponseDto>> GetWholeBloodCompatibility([FromQuery] int userId)
        {
            // Tìm Member theo userId
            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
            if (member == null)
                return NotFound($"Không tìm thấy thông tin thành viên với UserId: {userId}.");
            if (member.BloodTypeId == null)
                return BadRequest($"Thành viên UserId {userId} chưa khai báo nhóm máu.");

            int bloodTypeId = member.BloodTypeId.Value;

            // Truy vấn bảng BloodCompatibilityRules để tìm các nhóm máu tương thích cho MÁU TOÀN PHẦN.
            // Giả định: Các quy tắc tương thích cho máu toàn phần trong bảng BloodCompatibilityRules có ComponentId là NULL.
            var danhSachIdNhomMauChoTuongThich = await _context.BloodCompatibilityRules
                .Where(rule => rule.BloodRecieveId == bloodTypeId
                    && rule.IsCompatible
                    && rule.ComponentId == null)
                .Select(rule => rule.BloodGiveId)
                .ToListAsync();

            // Lấy tên của các nhóm máu tương thích dựa trên các ID đã tìm được.
            var danhSachTenNhomMauTuongThich = await _context.BloodTypes
                .Where(bt => danhSachIdNhomMauChoTuongThich.Contains(bt.BloodTypeId))
                .Select(bt => bt.BloodTypeName)
                .ToListAsync();

            if (!danhSachTenNhomMauTuongThich.Any())
            {
                return NotFound($"Không tìm thấy nhóm máu toàn phần tương thích cho userId {userId}.");
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

        /// <summary>
        /// Lấy các nhóm máu tương thích cho một user cụ thể và một thành phần máu (chỉ trả về các nhóm máu còn tồn kho thực tế).
        /// </summary>
        /// <param name="userId">UserId của người nhận.</param>
        /// <param name="componentId">Id của thành phần máu (BloodComponents.ComponentId).</param>
        /// <returns>BloodCompatibilityResponseDto chứa danh sách tên các nhóm máu còn tồn kho thực tế và tương thích.</returns>
        [HttpGet("component-by-user")]
        public async Task<ActionResult<BloodCompatibilityResponseDto>> GetComponentCompatibilityByUser([FromQuery] int userId, [FromQuery] int componentId)
        {
            // Tìm Member theo userId
            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
            if (member == null)
                return NotFound($"Không tìm thấy thông tin thành viên với UserId: {userId}.");
            if (member.BloodTypeId == null)
                return BadRequest($"Thành viên UserId {userId} chưa khai báo nhóm máu.");

            int bloodTypeId = member.BloodTypeId.Value;

            // Kiểm tra componentId có tồn tại không
            var component = await _context.BloodComponents.FirstOrDefaultAsync(c => c.ComponentId == componentId);
            if (component == null)
                return BadRequest($"ComponentId không hợp lệ: {componentId}.");

            // 1. Lấy danh sách nhóm máu tương thích về mặt lý thuyết
            var danhSachIdNhomMauChoTuongThich = await _context.BloodCompatibilityRules
                .Where(rule => rule.BloodRecieveId == bloodTypeId
                            && rule.IsCompatible
                            && rule.ComponentId == componentId)
                .Select(rule => rule.BloodGiveId)
                .ToListAsync();

            if (!danhSachIdNhomMauChoTuongThich.Any())
                return NotFound($"Không có nhóm máu nào tương thích về mặt lý thuyết cho userId {userId} và componentId {componentId}.");

            // 2. Lọc các nhóm máu còn tồn kho thực tế
            var bloodTypesConTonKho = await _context.BloodUnits
                .Where(bu => danhSachIdNhomMauChoTuongThich.Contains(bu.BloodTypeId)
                          && bu.ComponentId == componentId
                          && bu.RemainingVolume > 0
                          && (bu.BloodStatus == "Available" || bu.BloodStatus == "PartialUsed"))
                .Select(bu => bu.BloodTypeId)
                .Distinct()
                .ToListAsync();

            if (!bloodTypesConTonKho.Any())
                return NotFound($"Không có nhóm máu nào còn tồn kho thực tế phù hợp với userId {userId} và componentId {componentId}.");

            // 3. Lấy tên các nhóm máu còn tồn kho thực tế
            var danhSachTenNhomMauTonKho = await _context.BloodTypes
                .Where(bt => bloodTypesConTonKho.Contains(bt.BloodTypeId))
                .Select(bt => bt.BloodTypeName)
                .ToListAsync();

            return Ok(new BloodCompatibilityResponseDto
            {
                CompatibleBloodTypes = danhSachTenNhomMauTonKho
            });
        }

        // Helper method GetCompatibleList removed as it was for hardcoded data
    }
}
