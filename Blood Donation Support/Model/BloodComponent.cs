﻿namespace Blood_Donation_Support.Model;

public class BloodComponent
{
    public int ComponentId { get; set; }

    public required string ComponentName { get; set; }

    public string? Description { get; set; }

    public int ShelfLifeDays { get; set; }

    public virtual ICollection<BloodUnit> BloodUnits { get; set; } = new List<BloodUnit>();

    public virtual ICollection<DonationRequest> DonationRequests { get; set; } = new List<DonationRequest>();

    public virtual ICollection<TransfusionRequest> TransfusionRequests { get; set; } = new List<TransfusionRequest>();
}
