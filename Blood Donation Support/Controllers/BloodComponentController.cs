using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BloodComponentController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public BloodComponentController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/BloodComponent
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BloodComponentDTO>>> GetBloodComponents()
        {
            var bloodComponents = await _context.BloodComponents
                .Select(bc => new BloodComponentDTO
                {
                    ComponentId = bc.ComponentId,
                    ComponentName = bc.ComponentName,
                    Description = bc.Description
                })
                .ToListAsync();

            return Ok(bloodComponents);
        }

        // GET: api/BloodComponent/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BloodComponentDTO>> GetBloodComponent(int id)
        {
            var bloodComponent = await _context.BloodComponents.FindAsync(id);

            if (bloodComponent == null)
            {
                return NotFound();
            }

            var bloodComponentDTO = new BloodComponentDTO
            {
                ComponentId = bloodComponent.ComponentId,
                ComponentName = bloodComponent.ComponentName,
                Description = bloodComponent.Description
            };

            return Ok(bloodComponentDTO);
        }
    }
} 