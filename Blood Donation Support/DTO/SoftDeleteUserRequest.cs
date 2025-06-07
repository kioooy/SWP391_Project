using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class SoftDeleteUserRequest
    {
        [Required]
        public int UserId { get; set; }
    }
}
