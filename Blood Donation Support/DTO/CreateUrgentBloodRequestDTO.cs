namespace Blood_Donation_Support.DTO
{
    public class CreateUrgentBloodRequestDTO
    {
        public string PatientName { get; set; } = null!;
        public int RequestedBloodTypeId { get; set; }
        public string? Reason { get; set; }
        public string ContactName { get; set; } = null!;
        public string ContactPhone { get; set; } = null!;
        public string? ContactEmail { get; set; }
        public string EmergencyLocation { get; set; } = null!;
        public string? Notes { get; set; }
    }
} 