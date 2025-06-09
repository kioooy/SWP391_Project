using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.Model;

public partial class Role
{
    [Key]
    public int RoleId { get; set; }
    public required string Name { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>(); 

}
