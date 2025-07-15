using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class CreateBloodDonationPeriodDTO
    {
        [Required]
        [StringLength(100)]
        public string PeriodName { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } // Active, Completed, Cancelled

        [Required]
        public DateTime PeriodDateFrom { get; set; }

        [Required]
        public DateTime PeriodDateTo { get; set; }

        [Required]
        public int TargetQuantity { get; set; }

        public string? ImageUrl { get; set; }
    }
    public class UpdateBloodDonationPeriodDTO
    {
        [Required]
        [StringLength(100)]
        public string PeriodName { get; set; }

        [Required]
        [StringLength(255)]
        public string Location { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } // Active, Completed, Cancelled

        [Required]
        public DateTime PeriodDateFrom { get; set; }

        [Required]
        public DateTime PeriodDateTo { get; set; }

        [Required]
        public int TargetQuantity { get; set; }

        public string? ImageUrl { get; set; }
    }

    public class BloodDonationPeriodProgressDTO
    {
        public int PeriodId { get; set; }
        public string PeriodName { get; set; } = string.Empty;
        public required string HospitalName { get; set; }
        public int TargetQuantity { get; set; }
        public int CurrentQuantity { get; set; }
        public int ProgressPercent { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PeriodDateFrom { get; set; }
        public DateTime PeriodDateTo { get; set; }
    }

    public class StaffUpdateBloodDonationPeriodDTO
    {
        [Required]
        [StringLength(100)]
        public string PeriodName { get; set; }

        [Required]
        public DateTime PeriodDateFrom { get; set; }

        [Required]
        public DateTime PeriodDateTo { get; set; }

        [Required]
        public int TargetQuantity { get; set; }

        public string? ImageUrl { get; set; }
    }

}