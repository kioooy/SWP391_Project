using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model;

public partial class Notification
{
    public int NotificationId { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public string NotificationType { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
