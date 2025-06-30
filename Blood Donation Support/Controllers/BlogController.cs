using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Data;

namespace Blood_Donation_Support.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public BlogController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/blogs
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<BlogDTO>>> GetBlogs()
        {
            var blogs = await _context.Blogs
                .Where(b => b.IsActive == true && b.Status == "Published")
                .OrderByDescending(b => b.PublishedDate)
                .Select(b => new BlogDTO
                {
                    PostId = b.PostId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                    ImageUrl = b.ImageUrl ?? string.Empty, // If ImageUrl is null, return empty string
                })
                .ToListAsync();
            return Ok(blogs);
        }

        // GET: api/blogs/admin
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<BlogDTO>>> GetAllBlogsForAdmin()
        {
            var blogs = await _context.Blogs
                .OrderByDescending(b => b.PublishedDate)
                .Select(b => new BlogDTO
                {
                    PostId = b.PostId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                    ImageUrl = b.ImageUrl ?? string.Empty, // If ImageUrl is null, return empty string
                })
                .ToListAsync();
            return Ok(blogs);
        }

        // GET: api/blogs/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BlogDTO>> GetBlog(int id)
        {
            var blog = await _context.Blogs
                .Where(b => b.PostId == id && b.IsActive == true && b.Status == "Published")
                .Select(b => new BlogDTO
                {
                    PostId = b.PostId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                    ImageUrl = b.ImageUrl ?? string.Empty, // If ImageUrl is null, return empty string
                })
                .FirstOrDefaultAsync();
            if (blog == null)
                return NotFound();
            return Ok(blog);
        }

        // POST: api/blogs
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BlogDTO>> CreateBlog([FromBody] BlogCreateDTO dto)
        {
            var blog = new Blog
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
                Status = dto.Status,
                IsActive = true,
                PublishedDate = DateTime.Now
            };
            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBlog), new { id = blog.PostId }, blog);
        }

        // PUT: api/blogs/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] BlogUpdateDTO dto)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound();
            blog.Title = dto.Title;
            blog.Content = dto.Content;
            blog.ImageUrl = dto.ImageUrl;
            blog.Status = dto.Status;
            blog.UpdatedDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/blogs/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] BlogStatusDTO dto)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound();
            blog.Status = dto.Status;
            blog.UpdatedDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/blogs/{id}/deactivate
        [HttpPatch("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateBlog(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound();
            blog.IsActive = false;
            blog.UpdatedDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
