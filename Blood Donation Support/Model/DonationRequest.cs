﻿using System.ComponentModel.DataAnnotations.Schema;

namespace Blood_Donation_Support.Model;

public partial class DonationRequest
{
    public int DonationId { get; set; }

    public int MemberId { get; set; }

    public int PeriodId { get; set; }

    public int ComponentId { get; set; }

    public DateOnly? PreferredDonationDate { get; set; }

    public int? ResponsibleById { get; set; }

    public DateTime? RequestDate { get; set; }

    public DateTime? ApprovalDate { get; set; }

    public int? DonationVolume { get; set; }

    public string Status { get; set; } = null!;

    public string? Notes { get; set; }

    public string? PatientCondition { get; set; }

    public virtual BloodComponent Component { get; set; } = null!;

    [ForeignKey("MemberId")]
    public virtual Member Member { get; set; } = null!;

    public virtual BloodDonationPeriod Period { get; set; } = null!;

    public virtual User? ResponsibleBy { get; set; }
}
