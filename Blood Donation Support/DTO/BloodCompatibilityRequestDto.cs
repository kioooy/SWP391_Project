using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class BloodCompatibilityRequestDto
    {
        [Required]
        public string RecipientBloodType { get; set; } // e.g., "A+", "O-"

        // "whole-blood", "red-cell", "plasma", "platelet"
        public string Component { get; set; } = "whole-blood";
    }
}
