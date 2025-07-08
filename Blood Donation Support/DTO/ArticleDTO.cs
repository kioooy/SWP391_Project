using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class ArticleDTO
    {
        public int ArticleId { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public DateTime? PublishedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; }
    }

    public class ArticleCreateDTO
    {
        public int UserId { get; set; }
        [Required(ErrorMessage = "Title is required")]
        public required string Title { get; set; }
        [Required(ErrorMessage = "Content is required")]
        public required string Content { get; set; }
        [Required(ErrorMessage = "Status is required")]
        public required string Status { get; set; }
        [Required(ErrorMessage = "Image is required")]
        public required IFormFile ImageUrl { get; set; }

    }

    public class ArticleUpdateDTO
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public required string Status { get; set; }
        public IFormFile? ImageUrl { get; set; }

    }

    public class ArticleStatusDTO
    {
        [Required(ErrorMessage = "Status is required")]
        public required string Status { get; set; }
    }
}
