using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class CreateUrgentBloodRequestDTO
    {
        public string PatientName { get; set; } = null!;
        public int RequestedBloodTypeId { get; set; }
        public string? Reason { get; set; }
        public string CitizenNumber { get; set; } = null!;
        public string ContactName { get; set; } = null!;
        public string ContactPhone { get; set; } = null!;
        public string? ContactEmail { get; set; }
        public string EmergencyLocation { get; set; } = null!;
        public string? Notes { get; set; }
    }

    // DTO cho cập nhật trạng thái yêu cầu máu khẩn cấp
    public class UpdateUrgentRequestStatusDTO
    {
        [Required]
        [RegularExpression("Pending|InProgress|Fulfilled|Cancelled", ErrorMessage = "Trạng thái không hợp lệ.")]
        public string Status { get; set; } = string.Empty;

        public int? PreemptedTransfusionRequestId { get; set; }
        public int? UsedBloodUnitId { get; set; }
    }

    // DTO cho liên kết yêu cầu truyền máu với yêu cầu khẩn cấp
    public class LinkTransfusionRequestDTO
    {
        [Required]
        public int TransfusionRequestId { get; set; }
    }

    // DTO cho tham số tìm kiếm đơn vị máu
    public class BloodUnitSearchDTO
    {
        [Required]
        public int RequestedBloodTypeId { get; set; }
        public int? RequestedComponentId { get; set; }
        public bool IncludeReserved { get; set; } = false; // Mặc định không bao gồm máu đã đặt chỗ
    }

    // DTO cho kết quả trả về của đơn vị máu khi tìm kiếm khẩn cấp
    public class BloodUnitResponseForUrgentRequestDTO
    {
        public int BloodUnitId { get; set; }
        public string BloodTypeName { get; set; } = null!;
        public string ComponentName { get; set; } = null!;
        public int Volume { get; set; }
        public int RemainingVolume { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public string BloodStatus { get; set; } = null!;
        public bool IsReserved { get; set; }
        public int? ReservedForTransfusionId { get; set; }
        public string? ReservedForPatientName { get; set; }
    }

    // DTO cho input của API FulfillUrgentBloodRequest
    public class FulfillUrgentBloodRequestInputDTO
    {
        public int? PreemptedTransfusionRequestId { get; set; }
        public int? UsedBloodUnitId { get; set; }
    }

    // DTO cho input của API gán máu cho yêu cầu khẩn cấp
    public class AssignUrgentBloodUnitsInputDTO
    {
        public List<BloodUnitAssignment> BloodUnits { get; set; }
    }
    public class BloodUnitAssignment
    {
        public int BloodUnitId { get; set; }
        public int AssignedVolume { get; set; }
        public int? ComponentId { get; set; }
    }
    public class EmailToDonor
    {
        [Required]
        public required List<string> Email { get; set; }
    }
} 