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

        // Bước 1: Lấy danh sách nhóm máu người hiến tương thích.
        var phanHoiTuongThich = await _bloodCompatibilityController.GetComponentCompatibility(nhomMauNguoiNhan, thanhPhan);

        // Xử lý lỗi nếu việc lấy danh sách tương thích thất bại.
        if (phanHoiTuongThich.Result is BadRequestObjectResult || phanHoiTuongThich.Result is NotFoundResult)
        {
            return phanHoiTuongThich.Result; 
        }

        // Trích xuất danh sách nhóm máu tương thích.
        BloodCompatibilityResponseDto? compatibilityData = null;
        if (phanHoiTuongThich.Result is OkObjectResult okResult && okResult.Value is BloodCompatibilityResponseDto dtoValue)
        {
            compatibilityData = dtoValue;
        }

        var danhSachNhomMauTuongThich = compatibilityData?.CompatibleBloodTypes;

        // Trả về NotFound nếu không tìm thấy nhóm máu tương thích nào.
        if (danhSachNhomMauTuongThich == null || !danhSachNhomMauTuongThich.Any())
        {
            return NotFound($"Không tìm thấy nhóm máu tương thích nào cho người nhận {nhomMauNguoiNhan} với thành phần {thanhPhan}. Vui lòng kiểm tra đầu vào hoặc các quy tắc tương thích.");
        }

        // Bước 2: Truy vấn kho máu BloodUnits.
        // Lấy ComponentId từ bảng BloodComponents.
        var thongTinThanhPhanMau = await _context.BloodComponents
                                    .FirstOrDefaultAsync(c => c.ComponentName.ToLower() == thanhPhan.ToLower());

        // Xử lý lỗi nếu loại thành phần không hợp lệ.
        if (thongTinThanhPhanMau == null)
        {
            return BadRequest($"Loại thành phần không hợp lệ: '{thanhPhan}'. Đảm bảo thành phần này tồn tại trong bảng BloodComponents.");
        }

        int idThanhPhanMucTieu = thongTinThanhPhanMau.ComponentId;

        // Xây dựng truy vấn để tìm đơn vị máu có sẵn theo trạng thái, ngày hết hạn, nhóm máu và thành phần.
        var truyVanDonViMauCoSan = _context.BloodUnits.Where(donVi =>
            donVi.BloodStatus == "Available" &&
            donVi.ExpiryDate >= DateOnly.FromDateTime(DateTime.Today) &&
            danhSachNhomMauTuongThich.Contains(donVi.BloodType.BloodTypeName) &&
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
