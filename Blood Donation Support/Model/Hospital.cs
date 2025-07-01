using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace Blood_Donation_Support.Model
{
    [Table("Hospital")]
    public class Hospital
    {
        public int HospitalId { get; set; }

        public string Name { get; set; } = null!;

        public string? Address { get; set; }

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public Point Location { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<BloodDonationPeriod> BloodDonationPeriod { get; set; } = new List<BloodDonationPeriod>();

    }
}
