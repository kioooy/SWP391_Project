using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Blood_Donation_Support.Model
{
    public class EmailConfirmationToken
    {
        [Key]
        public int TokenId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Token { get; set; } = null!;
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = null!;
        
        [Required]
        [Column("UrgentRequestId")]
        public int UrgentRequestId { get; set; }
        
        [Required]
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        [Column("ExpiresAt")]
        public DateTime ExpiresAt { get; set; }
        
        [Column("IsUsed")]
        public bool IsUsed { get; set; } = false;
        
        [Column("UsedAt")]
        public DateTime? UsedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("UrgentRequestId")]
        public virtual UrgentBloodRequest UrgentBloodRequest { get; set; } = null!;
    }
} 