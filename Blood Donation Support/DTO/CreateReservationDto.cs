using System;
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO;

public class CreateReservationDto
{
    [Required]
    public int BloodUnitId { get; set; }

    [Required]
    public int TransfusionId { get; set; }

    [Required]
    public DateTime ExpireAt { get; set; }
}
