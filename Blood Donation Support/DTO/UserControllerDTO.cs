using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    
    public class AddUser // Add User for Admin to create new user
    {
        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        [StringLength(40)]
        public required string FullName { get; set; }

        [StringLength(12)]
        [RegularExpression(@"^\d{12}$", ErrorMessage = "Số CCCD/CMND không hợp lệ")]
        public required string CitizenNumber { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [RegularExpression(@"^0\d{9}$", ErrorMessage = "Số điện thoại không hợp lệ")]
        public required string? PhoneNumber { get; set; }

        [Required]
        public DateOnly? DateOfBirth { get; set; }

        [Required]
        [Range(0, 1, ErrorMessage = "Giới tính không hợp lệ. 0 = Nữ, 1 = Nam")]
        public bool Sex { get; set; }

        [Required]
        public string? Address { get; set; }

        [Required]
        [RegularExpression("^(Admin|Staff|Member|Guest)$")]
        public required string Role { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}

