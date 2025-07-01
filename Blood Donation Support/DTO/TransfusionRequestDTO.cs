using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class CreateTransfusionRequestDTO
    {
        [Required]
        public int MemberId { get; set; }

        [Required]
        public int BloodTypeId { get; set; }

        [Required]
        public int ComponentId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Volume must be greater than 0")]
        public int TransfusionVolume { get; set; }

        public bool IsEmergency { get; set; } = false;

        public DateTime? PreferredReceiveDate { get; set; }

        public string? Notes { get; set; }

        public string? PatientCondition { get; set; }

        // Optional: For the "Shortcut Flow" where a staff creates and approves in one step
        public int? BloodUnitIdToReserve { get; set; }
    }
    public class ApproveTransfusionRequestInput
    {
        [Required]
        public int BloodUnitId { get; set; }
        public string? Notes { get; set; }
    }

}