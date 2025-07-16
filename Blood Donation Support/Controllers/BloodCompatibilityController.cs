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
        public async Task<ActionResult<BloodCompatibilityResponseDto>> GetWholeBloodCompatibility([FromQuery] int bloodTypeId)
        {
            var bloodType = await _context.BloodTypes.FindAsync(bloodTypeId);
            if (bloodType == null)
                return NotFound($"Không tìm thấy nhóm máu với BloodTypeId: {bloodTypeId}.");

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
                return NotFound($"Không tìm thấy nhóm máu toàn phần tương thích cho bloodTypeId {bloodTypeId}.");
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
        public async Task<ActionResult<BloodCompatibilityResponseDto>> GetComponentCompatibilityByUser([FromQuery] int bloodTypeId, [FromQuery] int componentId)
        {
            // Kiểm tra bloodTypeId có tồn tại không
            var bloodType = await _context.BloodTypes.FindAsync(bloodTypeId);
            if (bloodType == null)
                return BadRequest($"BloodTypeId không hợp lệ: {bloodTypeId}.");

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
                return NotFound($"Không có nhóm máu nào tương thích về mặt lý thuyết cho bloodTypeId {bloodTypeId} và componentId {componentId}.");

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
                return NotFound($"Không có nhóm máu nào còn tồn kho thực tế phù hợp với bloodTypeId {bloodTypeId} và componentId {componentId}.");

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
