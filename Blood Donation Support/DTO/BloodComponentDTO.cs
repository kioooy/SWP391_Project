using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class BloodComponentDTO
    {
        public int ComponentId { get; set; }
        public required string ComponentName { get; set; }
        public string? Description { get; set; }
    }

    public class BloodComponentCreateDTO
    {
        [Required(ErrorMessage = "Component name is required")]
        public required string ComponentName { get; set; }
        public string? Description { get; set; }
    }

    public class BloodComponentUpdateDTO
    {
        [Required(ErrorMessage = "Component name is required")]
        public required string ComponentName { get; set; }
        public string? Description { get; set; }
    }
} 