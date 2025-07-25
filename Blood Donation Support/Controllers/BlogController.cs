﻿using Blood_Donation_Support.DTO;
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
                    UserId = b.UserId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                    Status = b.Status,
                    IsActive = b.IsActive,
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
                    UserId = b.UserId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                    Status = b.Status,
                    IsActive = b.IsActive,
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
                    UserId = b.UserId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                    Status = b.Status,
                    IsActive = b.IsActive,
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
        public async Task<ActionResult<BlogDTO>> CreateBlog([FromForm] BlogCreateDTO dto)
        {
            var blog = new Blog
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Content = dto.Content,
                Status = dto.Status,
                IsActive = true,
                PublishedDate = DateTime.Now,
                ImageUrl = dto.ImageUrl,
            };
            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBlog), new { id = blog.PostId }, blog);
        
        }

        // PUT: api/blogs/{id}
        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBlog(int id, [FromForm] BlogUpdateDTO dto)
        {

            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound();

            blog.Title = dto.Title;
            blog.Content = dto.Content;
            blog.Status = dto.Status;
            blog.UpdatedDate = DateTime.Now;
            blog.ImageUrl = dto.ImageUrl;

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
            Console.WriteLine($"[DEBUG] Nhận yêu cầu deactivate blog id: {id}");
            var total = _context.Blogs.Count();
            Console.WriteLine($"[DEBUG] Tổng số blog trong DB: {total}");
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
            {
                Console.WriteLine($"[DEBUG] Không tìm thấy blog với id: {id}");
                return NotFound();
            }
            blog.IsActive = false;
            blog.UpdatedDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/blogs/{id}/activate
        [HttpPatch("{id}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ActivateBlog(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound();

            blog.IsActive = true;
            blog.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
