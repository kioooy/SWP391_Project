namespace Blood_Donation_Support.Model;

public partial class TransfusionRequestBloodUnit
{
    public int Id { get; set; }

    public int TransfusionRequestId { get; set; }

    public int BloodUnitId { get; set; }

    public int AssignedVolume { get; set; }

    public DateTime AssignedDate { get; set; }

    public string Status { get; set; } = null!;

    public string? Notes { get; set; }

    // Navigation properties
    public virtual TransfusionRequest TransfusionRequest { get; set; } = null!;

    public virtual BloodUnit BloodUnit { get; set; } = null!;
} 