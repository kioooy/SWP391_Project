using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model
{
    public partial class Blog
    {
        public int PostId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? Author { get; set; }
        public DateTime? CreateDate { get; set; }

    }
}
