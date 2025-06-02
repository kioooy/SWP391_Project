using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model;

public partial class BloodUnit
{
    public int BloodUnitId { get; set; }

    public int BloodTypeId { get; set; }

    public int ComponentId { get; set; }

    public int? DonorId { get; set; }

    public DateOnly? AddDate { get; set; }

    public DateOnly ExpiryDate { get; set; }

    public int Volume { get; set; }

    public string BloodStatus { get; set; } = null!;

    public virtual BloodType BloodType { get; set; } = null!;

    public virtual BloodComponent Component { get; set; } = null!;

    public virtual ICollection<DonationRequestsDetail> DonationRequestsDetails { get; set; } = new List<DonationRequestsDetail>();

    public virtual Member? Donor { get; set; }

    public virtual ICollection<TransfusionRequest> TransfusionRequests { get; set; } = new List<TransfusionRequest>();
}
