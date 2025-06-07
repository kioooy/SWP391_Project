namespace Blood_Donation_Support.DTO
{
    public class BloodDonationPeriodProgressDto
    {
        public int PeriodId { get; set; }
        public string PeriodName { get; set; } = string.Empty;
        public int TargetQuantity { get; set; }
        public int CurrentQuantity { get; set; }
        public int ProgressPercent { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PeriodDateFrom { get; set; }
        public DateTime PeriodDateTo { get; set; }
    }
}
