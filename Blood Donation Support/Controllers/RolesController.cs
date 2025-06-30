using Microsoft.AspNetCore.Mvc;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Data;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public RolesController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/Roles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleDTO>>> GetRoles()
        {
            if (_context.Roles == null)
            {
                return NotFound();
            }
            return await _context.Roles
                .Select(r => new RoleDTO
                {
                    RoleId = r.RoleId,
                    Name = r.Name
                })
                .ToListAsync();
        }

        // GET: api/Roles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDTO>> GetRole(int id)
        {
            if (_context.Roles == null)
            {
                return NotFound();
            }
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound();
            }

            return new RoleDTO
            {
                RoleId = role.RoleId,
                Name = role.Name
            };
        }
    }
}
