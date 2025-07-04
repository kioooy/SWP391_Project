using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model
{
    public partial class UrgentBloodRequest
    {
        public int UrgentRequestId { get; set; }
        public string PatientName { get; set; } = null!;
        public int RequestedBloodTypeId { get; set; }
        public string? Reason { get; set; }
        public string ContactName { get; set; } = null!;
        public string ContactPhone { get; set; } = null!;
        public string? ContactEmail { get; set; }
        public string EmergencyLocation { get; set; } = null!;
        public string? Notes { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? CompletionDate { get; set; }
        public bool IsActive { get; set; }
        public int? RelatedTransfusionRequestId { get; set; }
        public int? CreatedByUserId { get; set; }

        // Navigation properties
        public virtual BloodType BloodType { get; set; } = null!;
        public virtual TransfusionRequest? RelatedTransfusionRequest { get; set; }
        public virtual User? CreatedByUser { get; set; }
    }
} 