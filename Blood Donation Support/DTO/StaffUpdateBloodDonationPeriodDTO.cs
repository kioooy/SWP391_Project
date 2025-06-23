using System;
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class StaffUpdateBloodDonationPeriodDTO
    {
        [Required]
        [StringLength(100)]
        public string PeriodName { get; set; }

        [Required]
        [StringLength(255)]
        public string Location { get; set; }

        [Required]
        public DateTime PeriodDateFrom { get; set; }

        [Required]
        public DateTime PeriodDateTo { get; set; }

        [Required]
        public int TargetQuantity { get; set; }

        public string ImageUrl { get; set; }
    }
}
