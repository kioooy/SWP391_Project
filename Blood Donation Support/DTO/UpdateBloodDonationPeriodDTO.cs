using System;
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
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

        public string ImageUrl { get; set; }
    }
}
