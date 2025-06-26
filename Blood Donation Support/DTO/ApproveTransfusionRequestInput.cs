using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class ApproveTransfusionRequestInput
    {
        [Required]
        public int BloodUnitId { get; set; }
        public string? Notes { get; set; }
    }
} 