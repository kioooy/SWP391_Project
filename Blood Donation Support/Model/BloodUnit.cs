using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.Model;

public partial class BloodUnit
{
    [Key]
    public int BloodUnitId { get; set; }

    public int BloodTypeId { get; set; }

    public int ComponentId { get; set; }

    public DateOnly? AddDate { get; set; }

    public DateOnly ExpiryDate { get; set; }

    public int Volume { get; set; }

    // Remaining volume (mL) for partially used units; equals Volume for new units
    public int RemainingVolume { get; set; }

    public string BloodStatus { get; set; } = null!;

    public int MemberId { get; set; }

    public virtual Member Member { get; set; } = null!;

    public virtual BloodType BloodType { get; set; } = null!;

    public virtual BloodComponent Component { get; set; } = null!;

    public virtual ICollection<TransfusionRequest> TransfusionRequests { get; set; } = new List<TransfusionRequest>();
}
