using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BloodTypeController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;

        public BloodTypeController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/BloodType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BloodTypeDTO>>> GetBloodTypes()
        {
            var bloodTypes = await _context.BloodTypes
                .Select(bt => new BloodTypeDTO
                {
                    BloodTypeId = bt.BloodTypeId,
                    BloodTypeName = bt.BloodTypeName
                })
                .ToListAsync();

            return Ok(bloodTypes);
        }

        // GET: api/BloodType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BloodTypeDTO>> GetBloodType(int id)
        {
            var bloodType = await _context.BloodTypes.FindAsync(id);

            if (bloodType == null)
            {
                return NotFound();
            }

            var bloodTypeDTO = new BloodTypeDTO
            {
                BloodTypeId = bloodType.BloodTypeId,
                BloodTypeName = bloodType.BloodTypeName
            };

            return Ok(bloodTypeDTO);
        }
    }
} 