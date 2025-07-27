using System;

namespace Blood_Donation_Support.Model
{
    public class UrgentRequestBloodUnit
    {
        public int UrgentRequestBloodUnitId { get; set; }
        public int UrgentRequestId { get; set; }
        public int BloodUnitId { get; set; }
        public int AssignedVolume { get; set; }
        public int? ComponentId { get; set; }
        public DateTime AssignedDate { get; set; }
        public string Status { get; set; }

        // Navigation properties
        public UrgentBloodRequest UrgentRequest { get; set; }
        public BloodUnit BloodUnit { get; set; }
        public BloodComponent Component { get; set; }
    }
} 