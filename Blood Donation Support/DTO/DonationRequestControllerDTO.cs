using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class DonationRequestControllerDTO
    {
        [Required]
        public int DonationId { get; set; }
        [Required]
        public int MemberId { get; set; }
        [Required]
        public int PeriodId { get; set; }
        [Required]
        public int ComponentId { get; set; }
        public DateOnly? PreferredDonationDate { get; set; }
        [Required]
        public required int ResponsibleById { get; set; }
        [Required]
        public DateTime RequestDate { get; set; }
        public DateTime? ApprovalDate { get; set; }
        [Required]
        public required int DonationVolume { get; set; }
        public required string Status { get; set; }
        public string? Notes { get; set; }
        [Required]
        public required string PatientCondition { get; set; }
    }
    public class UpdateStatusDonationRequest
    {
        [Required]
        public int DonationId { get; set; }
        [Required]
        public int MemberId { get; set; }
        [Required]
        public required int ResponsibleById { get; set; }
        [Required]
        [RegularExpression("Pending|Approved|Rejected",
            ErrorMessage = "Sai định dạng trạng thái. Chỉ có thể là 'Pending', 'Approved' hoặc 'Rejected'.")]
        public required string Status { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateDonationRequest
    {
        [Required]
        public int DonationId { get; set; }
        [Required]
        public int MemberId { get; set; }
        [Required]
        public required int ResponsibleById { get; set; }
        [Required]
        [RegularExpression("Completed",
            ErrorMessage = "Sai định dạng trạng thái. Chỉ có thể là 'Completed'.")]
        public required string Status { get; set; }
        public string? Notes { get; set; }
    }


}