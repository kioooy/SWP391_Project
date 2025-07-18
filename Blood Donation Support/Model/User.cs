using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.Model;

public partial class User
{
    [Key]
    public int UserId { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string FullName { get; set; } = null!;

    [StringLength(20)]
    public string CitizenNumber { get; set; } = null!;

    [StringLength(100)]
    public string Email { get; set; } = null!;

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public bool Sex { get; set; }

    public string? Address { get; set; }

    public int RoleId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<Blog> Blogs { get; set; } = new List<Blog>();
    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
    public virtual ICollection<DonationRequest> DonationRequests { get; set; } = new List<DonationRequest>();

    public virtual Member Member { get; set; } = null!;
  
    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<TransfusionRequest> TransfusionRequests { get; set; } = new List<TransfusionRequest>();
}
