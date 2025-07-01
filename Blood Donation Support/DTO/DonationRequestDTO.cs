using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class CreateDonationRequest
    {
        [Required]
        public int MemberId { get; set; }
        [Required]
        public int PeriodId { get; set; }
        [Required]
        public int ComponentId { get; set; }
        [Required]
        public required int ResponsibleById { get; set; }
        public DateOnly? PreferredDonationDate { get; set; }
        [Required]
        public DateTime RequestDate { get; set; }
        [Required]
        public required int DonationVolume { get; set; }
        public string? Notes { get; set; }
        [Required]
        public required string PatientCondition { get; set; }
    }
    public class UpdateStatusDonationRequest
    {
        [Required]
        public required int ResponsibleById { get; set; }
        [Required]
        [RegularExpression("Approved|Rejected|Cancelled",
            ErrorMessage = "Only Approved, Rejected, Cancelled .")]
        public required string Status { get; set; }
        public string? Notes { get; set; }
    }

    public class CompletedDonationRequest
    {
        [Required]
        public int MemberId { get; set; }
        [Required]
        [RegularExpression("Completed",
            ErrorMessage = "Only Completed.")]
        public required string Status { get; set; }
        public string? Notes { get; set; }
    }

}