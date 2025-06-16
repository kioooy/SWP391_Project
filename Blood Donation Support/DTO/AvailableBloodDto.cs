namespace Blood_Donation_Support.DTO;

public class AvailableBloodDto
{
    public string BloodType { get; set; } = string.Empty;
    public int Units { get; set; }
    public int TotalVolume { get; set; } // mL
}
