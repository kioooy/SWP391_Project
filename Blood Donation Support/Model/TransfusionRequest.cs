namespace Blood_Donation_Support.Model;

public partial class TransfusionRequest
{
    public int TransfusionId { get; set; }

    public int MemberId { get; set; }

    public int BloodTypeId { get; set; }

    public int ComponentId { get; set; }

    public int? BloodUnitId { get; set; }

    public int? ResponsibleById { get; set; }

    public bool? IsEmergency { get; set; }

    public int TransfusionVolume { get; set; }

    public DateTime? PreferredReceiveDate { get; set; }

    public DateTime? RequestDate { get; set; }

    public DateTime? ApprovalDate { get; set; }

    public DateTime? CompletionDate { get; set; }

    public DateTime? CancelledDate { get; set; }

    public DateTime? RejectedDate { get; set; }

    public string Status { get; set; } = null!;

    public string? Notes { get; set; }

    public string? PatientCondition { get; set; }

    public virtual BloodType BloodType { get; set; } = null!;

    public virtual BloodUnit? BloodUnit { get; set; }

    public virtual BloodComponent Component { get; set; } = null!;

    public virtual Member Member { get; set; } = null!;

    public virtual User ResponsibleBy { get; set; } = null!;
}
