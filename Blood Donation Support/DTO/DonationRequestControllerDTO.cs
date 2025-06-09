

using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class DonationRequestController
    {
        public int DonationId { get; set; }
        public int MemberId { get; set; }
        public int PeriodId { get; set; }
        public int ComponentId { get; set; }
        public DateOnly? PreferredDonationDate { get; set; }
        public int? ResponsibleById { get; set; }
        public DateTime? RequestDate { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public int? DonationVolume { get; set; }
        public required string Status { get; set; }
        public string? Notes { get; set; }
        public string? PatientCondition { get; set; }
    }
    public class UpdateDonationRequest
    {
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

}