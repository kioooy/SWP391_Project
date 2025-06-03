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
            var user = await _context.Users.FirstOrDefaultAsync(u => u.CitizenNumber == request.CitizenNumber);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid citizen number or password" });
            }

            // Hash the input password for comparison (giả sử dùng SHA256)
            var inputHash = ComputeSha256Hash(request.Password);
            if (user.PasswordHash != inputHash)
            {
                return Unauthorized(new { message = "Invalid citizen number or password" });
            }

            // Tạo JWT token
            var token = GenerateJwtToken(user);
            return Ok(new { token, userId = user.UserId, fullName = user.FullName, role = user.Role });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role),
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
            // Tạo SHA256 hash cho mật khẩu
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

            // Kiểm tra số CCCD/CMND đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.CitizenNumber == model.CitizenNumber))
            {
                return BadRequest(new { message = "Số CCCD/CMND đã được đăng ký" });
            }

            // Kiểm tra email đã tồn tại chưa
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest(new { message = "Email đã được đăng ký" });
            }

            // Kiểm tra số điện thoại đã tồn tại chưa
            if (!string.IsNullOrEmpty(model.PhoneNumber) && await _context.Users.AnyAsync(u => u.PhoneNumber == model.PhoneNumber))
            {
                return BadRequest(new { message = "Số điện thoại đã được đăng ký" });
            }

            // Kiểm tra tuổi (phải từ 18 tuổi trở lên)
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - model.DateOfBirth.Year;
            if (model.DateOfBirth > today.AddYears(-age)) age--;
            if (age < 18)
            {
                return BadRequest(new { message = "Bạn phải đủ 18 tuổi trở lên để đăng ký" });
            }

            // Tạo user mới
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
                Role = "Member", // Mặc định là Member
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Tạo Member record liên kết với User
            var member = new Member
            {
                UserId = user.UserId,
                BloodTypeId = model.BloodTypeId,
                Weight = model.Weight,
                Height = model.Height,
                IsDonor = model.IsDonor,
                IsRecipient = model.IsRecipient,
                DonationCount = 0,
                LastDonationDate = null,
                RecoveryDueDate = null,
                LastCheckupDate = null
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            // Tạo JWT token và trả về
            var token = GenerateJwtToken(user);
            return Ok(new 
            { 
                message = "Đăng ký thành công",
                token, 
                userId = user.UserId, 
                fullName = user.FullName, 
                role = user.Role 
            });
        }

        // GET API

        // Get User by CitizenNumber (Admin or for search)
        [HttpGet("{citizenNumber}")]
        public async Task<ActionResult<User>> GetUserByCitizenNumber(string citizenNumber)
        {
            if (string.IsNullOrWhiteSpace(citizenNumber))
            {
                return BadRequest("Citizen number is required.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.CitizenNumber == citizenNumber);
            if (user == null)
            {
                return NotFound();
            }
           return user;
        }

        // PUT API for User Management


        // ADMIN API for User Management

        // Get all Users (Admin)
        // Get: api/User/GetAllUsers
        [HttpGet("GetAllUsers")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
        {
            if (_context.Users == null)
            {
                return NotFound();
            }
            return await _context.Users.ToListAsync(); // Return all Users
        }

        // Update User Profile using DTO
        // PUT: api/User/UpdateUser
        [HttpPut("UpdateUser")]
        public async Task<IActionResult> UpdateUser([FromBody] AddUser model)
        {
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            if (userId == null)
            {
                return Unauthorized("User not Authenticated");
            }

            int id = int.Parse(userId);

            // Uniqueness checks (exclude current user)
            if (await _context.Users.AnyAsync(u => u.CitizenNumber == model.CitizenNumber && u.UserId != id))
            {
                return BadRequest(new { message = "Số CCCD/CMND đã được đăng ký" });
            }
            if (await _context.Users.AnyAsync(u => u.Email == model.Email && u.UserId != id))
            {
                return BadRequest(new { message = "Email đã được đăng ký" });
            }
            if (!string.IsNullOrEmpty(model.PhoneNumber) && await _context.Users.AnyAsync(u => u.PhoneNumber == model.PhoneNumber && u.UserId != id))
            {
                return BadRequest(new { message = "Số điện thoại đã được đăng ký" });
            }

            var existingUser = await _context.Users.FindAsync(id); // Find the existing User by UserId
            if (existingUser == null)
            {
                return NotFound(); // Status code 404 Not Found
            }

            // Update only the fields you want to allow to be changed
            existingUser.FullName = model.FullName;        // Full Name
            existingUser.PhoneNumber = model.PhoneNumber;  // Phone Number
            existingUser.FullName = model.FullName;        // Full Name
            existingUser.DateOfBirth = model.DateOfBirth;  // Date of Birth
            existingUser.Sex = model.Sex;                  // Gender
            existingUser.Address = model.Address;          // Address
            existingUser.Role = model.Role;                // Role
            existingUser.UpdatedAt = DateTime.Now;        // UpdatedAt

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


