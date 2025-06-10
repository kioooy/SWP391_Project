using Azure.Core;
using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        private readonly IConfiguration _configuration;

        public UserController(BloodDonationSupportContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel request)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.CitizenNumber == request.CitizenNumber);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "Invalid citizen number or password" });
            }

            var inputHash = ComputeSha256Hash(request.Password);
            if (user.PasswordHash != inputHash)
            {
                return Unauthorized(new { message = "Invalid citizen number or password" });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, userId = user.UserId, fullName = user.FullName, role = user.Role.Name });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.Name),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT key is not configured.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddHours(2);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string ComputeSha256Hash(string rawData)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                var builder = new StringBuilder();
                foreach (var b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _context.Users.AnyAsync(u => u.CitizenNumber == model.CitizenNumber))
            {
                return BadRequest(new { message = "Số CCCD/CMND đã được đăng ký" });
            }

            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest(new { message = "Email đã được đăng ký" });
            }

            if (!string.IsNullOrEmpty(model.PhoneNumber) && await _context.Users.AnyAsync(u => u.PhoneNumber == model.PhoneNumber))
            {
                return BadRequest(new { message = "Số điện thoại đã được đăng ký" });
            }

            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - model.DateOfBirth.Year;
            if (model.DateOfBirth > today.AddYears(-age)) age--;
            if (age < 18)
            {
                return BadRequest(new { message = "Bạn phải đủ 18 tuổi trở lên để đăng ký" });
            }

            var memberRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Member");
            if (memberRole == null)
            {
                return StatusCode(500, new { message = "Default role 'Member' not found." });
            }

            var user = new User
            {
                FullName = model.FullName,
                CitizenNumber = model.CitizenNumber,
                PasswordHash = ComputeSha256Hash(model.Password),
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                DateOfBirth = model.DateOfBirth,
                Sex = model.Sex,
                Address = model.Address,
                RoleId = memberRole.RoleId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var member = new Member
            {
                UserId = user.UserId,
                BloodTypeId = model.BloodTypeId,
                Weight = model.Weight,
                Height = model.Height,
                IsDonor = model.IsDonor,
                IsRecipient = model.IsRecipient
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            user.Role = memberRole;
            var token = GenerateJwtToken(user);
            return Ok(new
            {
                message = "Đăng ký thành công",
                token,
                userId = user.UserId,
                fullName = user.FullName,
                role = user.Role.Name
            });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.CitizenNumber,
                    u.Email,
                    u.PhoneNumber,
                    u.DateOfBirth,
                    u.Sex,
                    u.Address,
                    Role = u.Role.Name,
                    u.CreatedAt,
                    u.UpdatedAt,
                    u.IsActive
                }).ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.CitizenNumber,
                    u.Email,
                    u.PhoneNumber,
                    u.DateOfBirth,
                    u.Sex,
                    u.Address,
                    Role = u.Role.Name,
                    u.CreatedAt,
                    u.UpdatedAt,
                    u.IsActive
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("search/{citizenNumber}")]
        public async Task<IActionResult> GetUserByCitizenNumber(string citizenNumber)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.CitizenNumber == citizenNumber)
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.CitizenNumber,
                    u.Email,
                    u.PhoneNumber,
                    u.DateOfBirth,
                    u.Sex,
                    u.Address,
                    Role = u.Role.Name,
                    u.CreatedAt,
                    u.UpdatedAt,
                    u.IsActive
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUser request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == request.RoleId);
            if (!roleExists)
            {
                return BadRequest(new { message = "Invalid RoleId." });
            }

            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - request.DateOfBirth.Year;
            if (request.DateOfBirth > today.AddYears(-age)) age--;
            if (age < 18)
            {
                return BadRequest(new { message = "User must be 18 or older." });
            }

            user.FullName = request.FullName;
            user.CitizenNumber = request.CitizenNumber;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.DateOfBirth = request.DateOfBirth;
            user.Sex = request.Sex;
            user.Address = request.Address;
            user.RoleId = request.RoleId;
            user.UpdatedAt = DateTime.Now;

            if (!string.IsNullOrEmpty(request.PasswordHash))
            {
                user.PasswordHash = ComputeSha256Hash(request.PasswordHash);
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "User updated successfully." });
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUser request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _context.Users.AnyAsync(u => u.CitizenNumber == request.CitizenNumber))
            {
                return BadRequest(new { message = "Citizen Number already exists." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists." });
            }

            var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == request.RoleId);
            if (!roleExists)
            {
                return BadRequest(new { message = "Invalid RoleId." });
            }

            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - request.DateOfBirth.Year;
            if (request.DateOfBirth > today.AddYears(-age)) age--;
            if (age < 18)
            {
                return BadRequest(new { message = "User must be 18 or older." });
            }

            var user = new User
            {
                FullName = request.FullName,
                CitizenNumber = request.CitizenNumber,
                PasswordHash = ComputeSha256Hash(request.PasswordHash),
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                Sex = request.Sex,
                Address = request.Address,
                RoleId = request.RoleId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.UserId }, user);
        }

        [HttpPatch("soft-delete")]
        public async Task<IActionResult> SoftDeleteUser([FromBody] SoftDeleteUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            if (!user.IsActive)
            {
                return BadRequest(new { message = "User already deleted" });
            }
            user.IsActive = false;
            user.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(new { message = "User soft deleted successfully" });
        }
    }
}
