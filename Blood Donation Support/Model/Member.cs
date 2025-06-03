using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model;

public partial class Member
{
    public int UserId { get; set; }

    public int? BloodTypeId { get; set; }

    public int? Weight { get; set; }

    public int? Height { get; set; }

    public DateOnly? LastDonationDate { get; set; }

    public DateOnly? RecoveryDueDate { get; set; }

    public bool? IsDonor { get; set; }

    public bool? IsRecipient { get; set; }

    public int? DonationCount { get; set; }

    public DateOnly? LastCheckupDate { get; set; }

    public virtual BloodType? BloodType { get; set; }

    public virtual ICollection<BloodUnit> BloodUnits { get; set; } = new List<BloodUnit>();

    public virtual ICollection<DonationRequest> DonationRequests { get; set; } = new List<DonationRequest>();

    public virtual ICollection<TransfusionRequest> TransfusionRequests { get; set; } = new List<TransfusionRequest>();

    public virtual User User { get; set; } = null!;
}
