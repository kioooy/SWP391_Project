using System;

namespace Blood_Donation_Support.DTO;

public class ReservationDto
{
    public int ReservationId { get; set; }
    public int BloodUnitId { get; set; }
    public int TransfusionId { get; set; }
    public DateTime ReservedAt { get; set; }
    public DateTime ExpireAt { get; set; }
    public string Status { get; set; } = string.Empty;
}
