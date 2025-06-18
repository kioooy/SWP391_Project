using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using System;
using System.Threading.Tasks;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HospitalController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        public HospitalController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // GET: api/Hospital
        [HttpGet]
        public async Task<IActionResult> GetHospital()
        {
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital == null)
                return NotFound();

            return Ok(new
            {
                hospital.HospitalId,
                hospital.Name,
                hospital.Address,
                hospital.Phone,
                hospital.Email,
                Latitude = hospital.Location?.Y,
                Longitude = hospital.Location?.X,
                hospital.CreatedAt,
                hospital.UpdatedAt
            });
        }

        // PUT: api/Hospital/{id}/location
        [HttpPut("{id}/location")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] HospitalLocationUpdateDTO dto)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital == null)
                return NotFound();

            hospital.Location = new Point(dto.Longitude, dto.Latitude) { SRID = 4326 };
            hospital.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hospital location updated successfully." });
        }
    }
}
