﻿namespace Blood_Donation_Support.Model;

public class BloodType
{
    public int BloodTypeId { get; set; }

    public required string BloodTypeName { get; set; }

    public virtual ICollection<BloodCompatibilityRule> BloodCompatibilityRuleBloodGives { get; set; } = new List<BloodCompatibilityRule>();

    public virtual ICollection<BloodCompatibilityRule> BloodCompatibilityRuleBloodRecieves { get; set; } = new List<BloodCompatibilityRule>();

    public virtual ICollection<BloodUnit> BloodUnits { get; set; } = new List<BloodUnit>();

    public virtual ICollection<Member> Members { get; set; } = new List<Member>();

    public virtual ICollection<TransfusionRequest> TransfusionRequests { get; set; } = new List<TransfusionRequest>();
}
