using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class ApproveTransfusionRequestDTO
    {
        [Required]
        public int BloodUnitId { get; set; }

        public string? Notes { get; set; }
    }
} 