
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO;

public class BloodUnitAdd
{
    [Required]
    public int BloodTypeId { get; set; }
    [Required]
    public int ComponentId { get; set; }
    public DateOnly? AddDate { get; set; }
    [Required]
    public required int Volume { get; set; }
    [Required]
    [StringLength(15)]
    public required string BloodStatus { get; set; }
    public int MemberId { get; set; } 
}
public class BloodUnitUpdate
{
    [Required]
    public required int BloodTypeId { get; set; }
    [Required]
    public required int ComponentId { get; set; }
    [Required]
    public DateOnly? AddDate { get; set; }
    [Required]
    public required int Volume { get; set; }
    public int remainingVolume { get; set; }
    [Required]
    [StringLength(15)]
    public required string BloodStatus { get; set; }
    public int MemberId { get; set; }

}
public class BloodUnitDelete
{
    [Required]
    public required string BloodStatus { get; set; }
}