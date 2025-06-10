using Blood_Donation_Support.Data;
using Blood_Donation_Support.DTO;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;


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

        // POST API
        // đăng nhập người dùng
        // api/User/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.CitizenNumber == request.CitizenNumber);
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
            return Ok(new
            {
                token,
                userId = user.UserId,
                fullName = user.FullName,
                role = user.Role.Name,
            });
        }

        // Hàm để tạo JWT token
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()), 
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
        // Hàm để tính toán SHA256 hash cho mật khẩu
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
        // Đăng ký người dùng mới
        // api/User/register
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
                FullName = model.FullName,  // Họ và tên đầy đủ
                CitizenNumber = model.CitizenNumber,  // số CCCD
                PasswordHash = ComputeSha256Hash(model.Password), // Mật khẩu
                Email = model.Email, // email
                PhoneNumber = model.PhoneNumber, // số điện thoại
                DateOfBirth = model.DateOfBirth, // ngày tháng năm sinh
                Sex = model.Sex, // giới tính
                Address = model.Address, // địa chỉ
                RoleId = '3', // Mặc định là Member (RoleId = 3)
                CreatedAt = DateTime.Now, // 
                UpdatedAt = DateTime.Now, // 
                IsActive = true // Mặc định là hoạt động
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Tạo Member record liên kết với User
            var member = new Member
            {
                UserId = user.UserId, // Liên kết với User mới tạo
                BloodTypeId = model.BloodTypeId, // Loại máu 
                Weight = model.Weight, // Cân nặng
                Height = model.Height, // Chiều cao
                IsDonor = model.IsDonor, // Mặc định là người hiến máu
                IsRecipient = model.IsRecipient, // Mặc định người nhận máu
                DonationCount = 0, // Số lần hiến máu (mặc định là 0)
                LastDonationDate = null, // Ngày hiến máu gần nhất (mặc định là null)
                RecoveryDueDate = null, // Ngày hồi phục (mặc định là null)
                LastCheckupDate = null // Ngày cập nhật sức khỏe gần nhất (mặc định là null)
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
                role = user.Role.Name,
            });
        }


        // Member Management

        // Update User Profile 
        // PATCH: api/User/update/{id}
        [HttpPatch("profile/update")]
        [Authorize(Roles = "Member,Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateProfile model)
        {
            if (!ModelState.IsValid) // check model state
                return BadRequest(ModelState); // Status code 400 Bad Request 

            var existingUser = await _context.Users.FindAsync(id); // Find the existing User by UserId
            if (existingUser == null) // check if User or Member exists
                return NotFound(); // Status code 404 Not Found 

            // Kiểm tra tuổi (phải từ 18 tuổi trở lên)
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - model.DateOfBirth.Year;
            if (model.DateOfBirth > today.AddYears(-age)) age--;// Calculate age (subtracting years)
            if (age < 18)
                return BadRequest(new { message = "Bạn phải đủ 18 tuổi trở lên để đăng ký" });

            // Update only the fields on User
            existingUser.Email = model.Email;             // Email  
            existingUser.PhoneNumber = model.PhoneNumber; // Phone Number
            existingUser.DateOfBirth = model.DateOfBirth; // Date of Birth
            existingUser.Address = model.Address;         // Address
            existingUser.UpdatedAt = DateTime.Now;        // UpdatedAt            // Update only the fields on Member 
            var existingMember = await _context.Members.FirstOrDefaultAsync(m => m.UserId == id); // Find the existing Member by UserId
            if (existingMember != null)
            {
                existingMember.Weight = model.Weight;      // Weight
                existingMember.Height = model.Height;      // Height
            }

            // Add handle commit code ( Use Transaction For multiple update tabledatabase )
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (existingMember != null)
                {
                    _context.Members.Update(existingMember); // Update Member information
                }

                await _context.SaveChangesAsync(); // Save changes to the database
                await transaction.CommitAsync(); // Commit the transaction  
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;
            }
            return NoContent(); // Return 204 No Content if successful
        }
        // Get User Profile by UserId
        // api/User/profile
        [HttpGet("profile")]
        [Authorize(Roles = "Member,Admin,Staff")]
        public async Task<IActionResult> GetUserProfile()
        {
            // Extract the current user ID from the JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value.ToString();
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) )
                return Unauthorized(); // Status code 401 Unauthorized

            var user = await _context.Users
                .Include(m => m.Member)           // Include Member information
                .ThenInclude(t => t.BloodType)    // Include BloodType information 
                .Where(u => u.UserId == userId)   // Filter UserID from token 
                .Select(v => new
                {
                    v.FullName,
                    v.CitizenNumber,
                    v.Email,
                    v.PhoneNumber,
                    v.DateOfBirth,
                    v.Sex,
                    v.Address,
                    v.CreatedAt,
                    v.UpdatedAt,
                    // Member information
                    v.Member.BloodType.BloodTypeName,
                    v.Member.Weight,
                    v.Member.Height,
                    v.Member.IsDonor,
                    v.Member.IsRecipient,
                })
                .ToListAsync();

            return Ok(user);
        }


        // Staff Management

        // Get User by CitizenNumber
        // GET: api/User/search/{citizenNumber}
        [HttpGet("search/{citizenNumber}")]
        [Authorize(Roles = "Admin,Staff")] // Allow only Admin and Staff to access this endpoint
        public async Task<IActionResult> GetUserByCitizenNumber(string citizenNumber)
        {
            var usercitizennumber = await _context.Users.FirstOrDefaultAsync(u => u.CitizenNumber == citizenNumber);
            if (usercitizennumber == null)
            {
                return NotFound();
            }
            var user = await _context.Users
                .Where(u => u.IsActive == true) // Filter active users only
                .Include(r => r.Role)           // Include Role information
                .Select(v => new
                {
                    v.UserId,
                    v.FullName,
                    v.CitizenNumber,
                    v.Email,
                    v.PhoneNumber,
                    v.DateOfBirth,
                    v.Sex,
                    v.Address,
                    v.Role.Name,
                    v.CreatedAt,
                    v.UpdatedAt
                })
            .ToListAsync();

            return Ok(user);
        }


        // Admin Management

        // Get all Users (Admin)
        // GET: api/User/all 
        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Allow only Admin and Staff to access this endpoint
        public async Task<IActionResult> GetAllUser()
        {
            var users = await _context.Users
                .Include(r => r.Role) // Include Role information
                .Select(v => new
                {
                    v.UserId,
                    v.FullName,
                    v.CitizenNumber,
                    v.Email,
                    v.PhoneNumber,
                    v.DateOfBirth,
                    v.Sex,
                    v.Address,
                    v.Role.Name,
                    v.CreatedAt,
                    v.UpdatedAt
                })
                .ToListAsync();

            return Ok(users);
        }
        // Update User Profile (admin)
        // Patch: api/User/update/{id}
        [HttpPatch("update/{id}")]
        [Authorize(Roles = "Admin")] // Allow only Admin
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUser model)
        {
            if (!ModelState.IsValid) // validate check DTO model state
            {
                return BadRequest(ModelState); // Status code 400 Bad Request
            }
            var existingUser = await _context.Users.FindAsync(id); // Find the existing User by UserId
            if (existingUser == null)
            {
                return NotFound(); // Status code 404 Not Found
            }
            // Kiểm tra tuổi (phải từ 18 tuổi trở lên)
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - model.DateOfBirth.Year;
            if (model.DateOfBirth > today.AddYears(-age)) age--;
            if (age < 18)
                return BadRequest(new { message = "Bạn phải đủ 18 tuổi trở lên để đăng ký" });

            // Update only the fields you want to allow to be changed
            existingUser.PasswordHash = ComputeSha256Hash(model.PasswordHash); // Password Hash
            existingUser.FullName = model.FullName;        // Full Name
            existingUser.PhoneNumber = model.PhoneNumber;  // Phone Number
            existingUser.FullName = model.FullName;        // Full Name
            existingUser.DateOfBirth = model.DateOfBirth;  // Date of Birth
            existingUser.Sex = model.Sex;                  // Gender
            existingUser.Address = model.Address;          // Address
            existingUser.RoleId = model.RoleId;            // Role ID
            existingUser.UpdatedAt = DateTime.Now;         // UpdatedAt

            var existingMember = await _context.Members.FirstOrDefaultAsync(m => m.UserId == id); // Find the existing Member by UserId
            if (existingMember != null)
            {
                // Update Member information if it exists
                existingMember.BloodTypeId = model.BloodTypeId; // Blood Type ID
                existingMember.Weight = model.Weight;           // Weight
                existingMember.Height = model.Height;           // Height
                existingMember.IsDonor = model.IsDonor;         // Is Donor
                existingMember.IsRecipient = model.IsRecipient; // Is Recipient
            }
            // Add handle commit code ( Use Transaction For multiple update table database )
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (existingMember != null)
                {
                    _context.Members.Update(existingMember); // Update Member information
                }
                await _context.SaveChangesAsync(); // Save changes to the database
                await transaction.CommitAsync(); // Commit the transaction
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw; // Rethrow the exception if it is a concurrency issue 
            }
            return NoContent(); // Return 204 No Content if successful
        }

        // Delete User (soft delete)
        // PATCH: api/User/soft-delete
        [HttpPatch("soft-delete")]
        [Authorize(Roles = "Admin")] // Allow only Admin
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


