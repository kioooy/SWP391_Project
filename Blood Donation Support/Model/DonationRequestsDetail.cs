using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model;

public partial class DonationRequestsDetail
{
    public int DetailsId { get; set; }

    public int DonationId { get; set; }

    public int BloodUnitId { get; set; }

    public int Volume { get; set; }

    public virtual BloodUnit BloodUnit { get; set; } = null!;

    public virtual DonationRequest Donation { get; set; } = null!;
}
