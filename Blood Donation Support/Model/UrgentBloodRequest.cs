using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.Model
{
    public partial class UrgentBloodRequest
    {
        public int UrgentRequestId { get; set; }
        public string PatientName { get; set; } = null!;
        public int RequestedBloodTypeId { get; set; }
        public string? Reason { get; set; }
        public string CitizenNumber { get; set; } = null!;
        public string ContactName { get; set; } = null!;
        public string ContactPhone { get; set; } = null!;
        public string? ContactEmail { get; set; }
        public string EmergencyLocation { get; set; } = null!;
        public string? Notes { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? CompletionDate { get; set; }
        public bool IsActive { get; set; }
        // Navigation properties
        public virtual BloodType BloodType { get; set; } = null!;
    }
} 