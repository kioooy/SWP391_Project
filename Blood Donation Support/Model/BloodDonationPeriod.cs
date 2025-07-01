namespace Blood_Donation_Support.Model;

public partial class BloodDonationPeriod
{
    public int PeriodId { get; set; }

    public string PeriodName { get; set; } = null!;

    public int HospitalId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime PeriodDateFrom { get; set; }

    public DateTime PeriodDateTo { get; set; }

    public int TargetQuantity { get; set; }

    public int? CurrentQuantity { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual ICollection<DonationRequest> DonationRequests { get; set; } = new List<DonationRequest>();

    public virtual Hospital Hospital { get; set; } = null!;

}
