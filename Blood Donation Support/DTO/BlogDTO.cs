using System;

namespace Blood_Donation_Support.DTO
{
    public class BlogDTO
    {
        public int PostId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? PublishedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string ImageUrl { get; set; }
    }

    public class BlogCreateDTO
    {
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string ImageUrl { get; set; }
        public string Status { get; set; }
    }

    public class BlogUpdateDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string ImageUrl { get; set; }
        public string Status { get; set; }
    }

    public class BlogStatusDTO
    {
        public string Status { get; set; }
    }
}
