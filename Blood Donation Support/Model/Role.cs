using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.Model;

public partial class Role
{
    [Key]
    public int RoleId { get; set; }
    public string Name { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>(); 
}
