using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class ArticleDTO
    {
        public int ArticleId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime? PublishedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class ArticleCreateDTO
    {
        public required int UserId { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public required string Status { get; set; }
    }

    public class ArticleUpdateDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string Status { get; set; }
    }

    public class ArticleStatusDTO
    {
        [Required]
        public string Status { get; set; }
    }
}
