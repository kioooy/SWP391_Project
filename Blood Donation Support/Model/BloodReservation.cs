using System;
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.Model;

public partial class BloodReservation
{
    [Key]
    public int ReservationId { get; set; }

    public int BloodUnitId { get; set; }

    public int TransfusionId { get; set; }

    public int? ReservedById { get; set; }

    public DateTime ReservedAt { get; set; }

    public DateTime ExpireAt { get; set; }

    public string Status { get; set; } = "Active";

    public virtual BloodUnit BloodUnit { get; set; } = null!;

    public virtual TransfusionRequest Transfusion { get; set; } = null!;

    public virtual User? ReservedBy { get; set; }
}
