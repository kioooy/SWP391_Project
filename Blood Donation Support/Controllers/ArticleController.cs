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
    public class ArticleController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public ArticleController(BloodDonationSupportContext context)
        {
            _context = context;
        }
        // Get Article
        // GET: api/Article
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ArticleDTO>>> GetArticles()
        {
            var Article = await _context.Articles
                .Where(b => b.IsActive == true && b.Status == "Published")
                .OrderByDescending(b => b.PublishedDate)
                .Select(b => new ArticleDTO
                {
                    ArticleId = b.ArticleId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                })
                .ToListAsync();
            return Ok(Article);
        }
        // Get All Articles for Admin
        // GET: api/Article/admin
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ArticleDTO>>> GetAllArticlesForAdmin()
        {
            var Article = await _context.Articles
                .OrderByDescending(b => b.PublishedDate)
                .Select(b => new ArticleDTO
                {
                    ArticleId = b.ArticleId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                })
                .ToListAsync();
            return Ok(Article);
        }
        // Get Article by ID
        // GET: api/Article/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ArticleDTO>> GetArticle(int id)
        {
            var Article = await _context.Articles
                .Where(b => b.ArticleId == id && b.IsActive == true && b.Status == "Published")
                .Select(b => new ArticleDTO
                {
                    ArticleId = b.ArticleId,
                    Title = b.Title,
                    Content = b.Content,
                    PublishedDate = b.PublishedDate,
                    UpdatedDate = b.UpdatedDate,
                })
                .FirstOrDefaultAsync();

            if (Article == null)
                return NotFound();

            return Ok(Article);
        }
        // Create Article (Admin Only)
        // POST: api/Article
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ArticleDTO>> CreateArticle([FromBody] ArticleCreateDTO dto)
        {
            var Article = new Article
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Content = dto.Content,
                Status = dto.Status,
                IsActive = true,
                PublishedDate = DateTime.Now
            };
            _context.Articles.Add(Article);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetArticle), new { id = Article.ArticleId }, Article);
        }
        // Update Article (Admin Only)
        // PUT: api/Article/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateArticle(int id, [FromBody] ArticleUpdateDTO dto)
        {
            var Article = await _context.Articles.FindAsync(id);
            if (Article == null)
                return NotFound();

            Article.Title = dto.Title;
            Article.Content = dto.Content;
            Article.Status = dto.Status;
            Article.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        // Delete Article (Admin Only)
        // PATCH: api/Article/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeStatus(int id, [FromBody] ArticleStatusDTO dto)
        {
            var Article = await _context.Articles.FindAsync(id);
            if (Article == null)
                return NotFound();

            Article.Status = dto.Status;
            Article.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        // Deactivate Article (Admin Only)
        // PATCH: api/Article/{id}/deactivate
        [HttpPatch("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateArticle(int id)
        {
            var Article = await _context.Articles.FindAsync(id);
            if (Article == null)
                return NotFound();

            Article.IsActive = false;
            Article.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
