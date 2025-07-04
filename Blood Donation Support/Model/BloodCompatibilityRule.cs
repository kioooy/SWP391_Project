namespace Blood_Donation_Support.Model;

public partial class BloodCompatibilityRule
{
    public int BloodRuleId { get; set; }

    public int BloodGiveId { get; set; }

    public int BloodRecieveId { get; set; }

    public bool IsCompatible { get; set; }

    public int? ComponentId { get; set; }

    public virtual BloodType BloodGive { get; set; } = null!;

    public virtual BloodType BloodRecieve { get; set; } = null!;

    public virtual BloodComponent? Component { get; set; }
}
