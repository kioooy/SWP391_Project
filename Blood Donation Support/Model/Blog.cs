namespace Blood_Donation_Support.Model;

public partial class Blog
{
    public int PostId { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime? PublishedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public string? ImageUrl { get; set; }

    public string Status { get; set; } = null!;

    public bool IsActive { get; set; }
    public virtual User User { get; set; } = null!;
}
