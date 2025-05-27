using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Blood_Donation_Support.Model;

namespace Blood_Donation_Support.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        public UserController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        /// <summary>
        ///  GET API      
        /// </summary>

        // GET: api/User
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            if (_context.Users == null)
            {
                return NotFound();
            }
            return await _context.Users.ToListAsync();
        }
        // Get User by UserId (Admin)
        // GET: api/User/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }
            var user = await _context.Users.FindAsync(id); // Find User by UserId
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }
        // Get User Profile (Authenticated User)
        // Get: api/User/Profile
        [HttpGet("Profile")]
        public async Task<ActionResult<User>> GetUserProfile()
        {
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (userId == null)
            {
                return Unauthorized("User not Authenticated"); // Status code 401 Unauthorized
            }
            var user = await _context.Users.FindAsync(int.Parse(userId)); // Find User By UserId
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        // Get User Profile by UserId
        // GET: api/User/Profile/{id}
        [HttpGet("Profile/{id}")]
        public async Task<ActionResult<User>> GetUserProfileById(int id)
        {
            if (_context.Users == null)
            {
                return NotFound(); // Status code 404 Not Found
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id); // Find User by UserId 
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        /// <summary>
        ///  PUT API      
        /// </summary>

        // Check if a user exists by UserId
        private bool UserExists(int id) 
        {
            return _context.Users.Any(e => e.UserId == id); 
        }

        // Update User (Admin)
        // PUT: api/User/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest("User ID mismatch"); // Status code 400 Bad Request
            }
            _context.Entry(user).State = EntityState.Modified; // Set the state to Modified
            try
            {
                await _context.SaveChangesAsync();  // Save changes to the database
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound(); // Status code 404 Not Found
                }
                else
                {
                    throw; // rethow the exception if it is not a concurrency issue
                }
            }
            return NoContent(); // Status code 204 No Content
        }

        // Update User Profile
        // PUT: api/User/Profile
        [HttpPut("Profile")]
        public async Task<IActionResult> UpdateUserProfile(User user)
        {
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value; // Check authenticated User
            if (userId == null)
            {
                return Unauthorized("User not Authenticated"); // Status code 401 Unauthorized
            }

            int id = int.Parse(userId);
            if (id != user.UserId) // Check if the UserId in the request matches the authenticated UserId
            {
                return BadRequest("User ID mismatch"); // Status code 400 Bad Request
            }

            var existingUser = await _context.Users.FindAsync(id); // Find the existing User by UserId
            if (existingUser == null)
            {
                return NotFound(); // Status code 404 Not Found
            }

            // Update only the fields you want to allow to be changed
            existingUser.UserName = user.UserName;                          // Username
            existingUser.PhoneNumber = user.PhoneNumber;                    // Phone Number
            existingUser.FullName = user.FullName;                          // Full Name
            existingUser.DateOfBirth = user.DateOfBirth;                    // Date of Birth
            existingUser.Gender = user.Gender;                              // Gender
            existingUser.Address = user.Address;                            // Address
            existingUser.Role = user.Role;                                  // Role
            existingUser.UpdateAt = DateOnly.FromDateTime(DateTime.Now);    // Update Timestamp 

            try
            {
                await _context.SaveChangesAsync(); // Save changes to the database
                return Ok(existingUser); // Return the updated User
            }
            catch (DbUpdateConcurrencyException)
            {
                throw; // Rethrow the exception if it is a concurrency issue 
            }
        }


    }
}

