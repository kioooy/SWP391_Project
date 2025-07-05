using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class BloodTypeDTO
    {
        public int BloodTypeId { get; set; }
        public required string BloodTypeName { get; set; }
    }

    public class BloodTypeCreateDTO
    {
        [Required(ErrorMessage = "BloodType name is required")]
        public required string BloodTypeName { get; set; }
    }

    public class BloodTypeUpdateDTO
    {
        [Required(ErrorMessage = "BloodType name is required")]
        public required string BloodTypeName { get; set; }
    }
} 