using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class BlogDTO
    {
        public int PostId { get; set; }
        public int UserId { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        public DateTime? PublishedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public required string ImageUrl { get; set; }
        public required string Status { get; set; }
        public bool IsActive { get; set; }
    }

    public class BlogCreateDTO
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

    public class BlogUpdateDTO
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        [Required(ErrorMessage = "Status is required")]
        public required string Status { get; set; }
        public IFormFile? ImageUrl { get; set; }
    }

    public class BlogStatusDTO
    {
        [Required(ErrorMessage = "Status is required")]
        public required string Status { get; set; }
    }
}
