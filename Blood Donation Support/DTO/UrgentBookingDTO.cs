namespace Blood_Donation_Support.DTO
{
    public class UrgentBookingDTO
    {
        public int MemberId { get; set; }
        public string? Notes { get; set; }
        public string Token { get; set; }
        // Removed BloodBankId, PreferredTime, ContactPhone as they don't exist in database
    }
} 