using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Blood_Donation_Support.Controllers;

namespace Blood_Donation_Support.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompatibleBloodSearchController : ControllerBase
{
    private readonly BloodDonationSupportContext _context;
    private readonly BloodCompatibilityController _bloodCompatibilityController;

    public CompatibleBloodSearchController(BloodDonationSupportContext context, BloodCompatibilityController bloodCompatibilityController)
    {
        _context = context;
        _bloodCompatibilityController = bloodCompatibilityController;
    }

    /// <summary>
    /// Tìm kiếm đơn vị máu có sẵn tương thích.
    /// </summary>
    /// <param name="nhomMauNguoiNhan">Nhóm máu người nhận (ví dụ: "A+", "O-").</param>
    /// <param name="thanhPhan">Thành phần máu cần tìm (ví dụ: "Whole Blood", "Plasma").</param>
    /// <returns>Danh sách tóm tắt máu có sẵn.</returns>
    [HttpGet("available")]
    [Authorize(Roles = "Member,Staff,Admin")]
    public async Task<ActionResult<IEnumerable<AvailableBloodDto>>> GetAvailableCompatible(
        [FromQuery] string nhomMauNguoiNhan,
        [FromQuery] string thanhPhan)
    {
        // Xác thực tham số đầu vào.
        if (string.IsNullOrWhiteSpace(nhomMauNguoiNhan) || string.IsNullOrWhiteSpace(thanhPhan))
            return BadRequest("Các tham số nhóm máu người nhận và thành phần là bắt buộc.");

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
        int idThanhPhanMucTieu = thongTinThanhPhanMau.ComponentId;

        // Lấy danh sách nhóm máu tương thích về mặt lý thuyết
        var danhSachIdNhomMauChoTuongThich = await _context.BloodCompatibilityRules
            .Where(rule => rule.BloodRecieveId == thongTinNhomMauNguoiNhan.BloodTypeId
                        && rule.IsCompatible
                        && rule.ComponentId == idThanhPhanMucTieu)
            .Select(rule => rule.BloodGiveId)
            .ToListAsync();
        if (!danhSachIdNhomMauChoTuongThich.Any())
            return NotFound($"Không có nhóm máu nào tương thích về mặt lý thuyết cho người nhận {nhomMauNguoiNhan} và thành phần {thanhPhan}.");

        // Lấy tên các nhóm máu tương thích
        var danhSachTenNhomMauTuongThich = await _context.BloodTypes
            .Where(bt => danhSachIdNhomMauChoTuongThich.Contains(bt.BloodTypeId))
            .Select(bt => bt.BloodTypeName)
            .ToListAsync();
        if (!danhSachTenNhomMauTuongThich.Any())
            return NotFound($"Không có nhóm máu nào tương thích cho người nhận {nhomMauNguoiNhan} và thành phần {thanhPhan}.");

        // Bước 2: Truy vấn kho máu BloodUnits.
        var truyVanDonViMauCoSan = _context.BloodUnits.Where(donVi =>
            donVi.BloodStatus == "Available" &&
            donVi.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) &&
            danhSachTenNhomMauTuongThich.Contains(donVi.BloodType.BloodTypeName) &&
            donVi.ComponentId == idThanhPhanMucTieu);

        // Nhóm và tổng hợp kết quả.
        var tomTatMauCoSan = await truyVanDonViMauCoSan
            .GroupBy(donVi => donVi.BloodType.BloodTypeName)
            .Select(nhom => new AvailableBloodDto
            {
                BloodType = nhom.Key,
                Units = nhom.Count(),
                TotalVolume = nhom.Sum(donVi => donVi.RemainingVolume)
            })
            .ToListAsync();

        // Trả về bản tóm tắt các đơn vị máu có sẵn.
        return Ok(tomTatMauCoSan);
    }
}
