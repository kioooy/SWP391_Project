using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO;

public class CreateReservationDTO
{
    [Required]
    public int BloodUnitId { get; set; }

    [Required]
    public int TransfusionId { get; set; }

    [Required]
    public DateTime ExpireAt { get; set; }
}
public class ReservationDTO
{
    public int ReservationId { get; set; }
    public int BloodUnitId { get; set; }
    public int TransfusionId { get; set; }
    public DateTime ReservedAt { get; set; }
    public DateTime ExpireAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

