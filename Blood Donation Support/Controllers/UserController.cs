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
using NetTopologySuite.Geometries; // Added for Point type


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
                return Unauthorized(new { message = "Số CCCD Này Không Tồn Tại" });
            }

            var inputHash = ComputeSha256Hash(request.Password);
            if (user.PasswordHash != inputHash)
            {
                return Unauthorized(new { message = "Mật Khẩu Không Chính Xác" });
            }

            if(user.IsActive == false)
            {
                return Unauthorized(new { message = "Tài Khoản Đã Bị Khóa" });
            }

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

            if (await _context.Users.AnyAsync(u => u.CitizenNumber == model.CitizenNumber))
            {
                return BadRequest(new { message = "Số CCCD đã được đăng ký" });
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
                FullName = model.FullName,  // Họ và tên đầy đủ
                CitizenNumber = model.CitizenNumber,  // số CCCD
                PasswordHash = ComputeSha256Hash(model.Password), // Mật khẩu
                Email = model.Email, // email
                PhoneNumber = model.PhoneNumber, // số điện thoại
                DateOfBirth = model.DateOfBirth, // ngày tháng năm sinh
                Sex = model.Sex, // giới tính
                Address = model.Address, // địa chỉ
                RoleId = 3, // Mặc định là Member (RoleId = 3)
                CreatedAt = DateTime.Now, // 
                UpdatedAt = DateTime.Now, // 
                IsActive = true // Mặc định là hoạt động
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

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
                LastCheckupDate = null, // Ngày cập nhật sức khỏe gần nhất (mặc định là null)
                Location = null, // Location is not provided in the model
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
                role = user.Role.Name,
            });
        }

        // Update User Profile 
        // PATCH: api/User/{Id}/profile
        [HttpPatch("{id}/profile")]
        [Authorize(Roles = "Member,Admin")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfile model)
        {
            if (!ModelState.IsValid) // check model state
                return BadRequest(ModelState); // Status code 400 Bad Request 

            var existingUser = await _context.Users.FindAsync(id); // Find the existing User by UserId
            if (existingUser == null)
                return NotFound(); // Status code 404 Not Found 

            if (!string.IsNullOrEmpty(model.FullName) && existingUser.FullName != model.FullName.Trim())
            {
                existingUser.FullName = model.FullName.Trim();
            }

            // Cập nhật Email nếu có thay đổi và chưa bị trùng
            if (!string.IsNullOrEmpty(model.Email) && existingUser.Email != model.Email)
            {
                var isEmailTaken = await _context.Users.AnyAsync(u => u.Email == model.Email && u.UserId != id);
                if (isEmailTaken)
                {
                    return BadRequest(new { message = "Email đã tồn tại cho người dùng khác." });
                }
                existingUser.Email = model.Email;
            }

            // Cập nhật Số điện thoại
            if (!string.IsNullOrEmpty(model.PhoneNumber) && existingUser.PhoneNumber != model.PhoneNumber)
            {
                // Check existing Phone Number
                var isPhoneNumberTaken = await _context.Users.AnyAsync(u => u.PhoneNumber == model.PhoneNumber && u.UserId != id);
                if (isPhoneNumberTaken)
                {
                    return BadRequest(new { message = "Số điện thoại đã tồn tại cho người dùng khác." });
                }
                existingUser.PhoneNumber = model.PhoneNumber;
            }

            if (!string.IsNullOrEmpty(model.Address)) // Check existing andress
                existingUser.Address = model.Address;

            existingUser.UpdatedAt = DateTime.Now;

            // Update only the fields on Member if provided
            var existingMember = await _context.Members.FirstOrDefaultAsync(m => m.UserId == id);
            if (existingMember != null)
            {
                if (model.Weight.HasValue)
                    existingMember.Weight = model.Weight.Value;

                if (model.Height.HasValue)
                    existingMember.Height = model.Height.Value;

                // Update Location if Latitude and Longitude are provided
                if (model.Latitude.HasValue && model.Longitude.HasValue)
                {
                    existingMember.Location = new Point(model.Longitude.Value, model.Latitude.Value) { SRID = 4326 };
                }
            }

            // Add handle commit code ( Use Transaction For multiple update table database )
            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (existingMember != null)
                {
                    _context.Members.Update(existingMember); // Update Member information
                }
                _context.Users.Update(existingUser); // update user
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

        // --- Tín Coding: Start ---

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
                    v.Member.LastDonationDate,
                    Latitude = v.Member != null && v.Member.Location != null ? (double?)v.Member.Location.Y : null,
                    Longitude = v.Member != null && v.Member.Location != null ? (double?)v.Member.Location.X : null
                })
                .ToListAsync();

            return Ok(user);
        }
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
        // Get all Users (Admin)
        // GET: api/User
        [HttpGet]
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
                .FirstOrDefaultAsync();

            if (users == null)
            {
                return NotFound();
            }

            return Ok(users);
        }        
        // Get User by Id
        // GET: api/User/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Member)
                    .ThenInclude(m => m.BloodType)
                .FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound();
            return Ok(new
            {
                user.UserId,
                user.FullName,
                user.CitizenNumber,
                user.Email,
                user.PhoneNumber,
                user.DateOfBirth,
                user.Sex,
                user.Address,
                user.Role.Name,
                user.CreatedAt,
                user.UpdatedAt,
                // Member info
                user.Member?.BloodType?.BloodTypeName,
                user.Member?.Weight,
                user.Member?.Height,
                user.Member?.IsDonor,
                user.Member?.IsRecipient
            });
        }

        // Update User Profile (admin)
        // PATCH: api/User/{id}
        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin")] // Allow only Admin
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUser model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            var roleExists = await _context.Roles.AnyAsync(r => r.RoleId == model.RoleId);
            if (!roleExists)
                return BadRequest(new { message = "Không Thấy Mã ID của Role." });

            // Kiểm tra tuổi (phải từ 18 tuổi trở lên)
            var today = DateOnly.FromDateTime(DateTime.Today);
            var age = today.Year - model.DateOfBirth.Year;
            if (model.DateOfBirth > today.AddYears(-age)) age--;
            if (age < 18)
                return BadRequest(new { message = "Bạn phải đủ 18 tuổi trở lên để đăng ký" });

            // Update only the fields you want to allow to be changed
            if (!string.IsNullOrEmpty(model.PasswordHash))
            {
                user.PasswordHash = ComputeSha256Hash(model.PasswordHash); // Chỉ cập nhật nếu có mật khẩu mới
            }
            user.FullName = model.FullName;        // Full Name
            user.PhoneNumber = model.PhoneNumber;  // Phone Number
            user.DateOfBirth = model.DateOfBirth;  // Date of Birth
            user.Sex = model.Sex;                  // Gender
            user.Address = model.Address;          // Address
            user.RoleId = model.RoleId;            // Role ID
            user.UpdatedAt = DateTime.Now;         // UpdatedAt
            
            var existingMember = await _context.Members.FirstOrDefaultAsync(m => m.UserId == id); // Find the existing Member by UserId
            if (existingMember != null)
            {
                // Kiểm tra điều kiện hồi phục khi cập nhật IsDonor = true
                if (model.IsDonor == true)
                {
                    var lastTransfusion = await _context.TransfusionRequests
                        .Where(tr => tr.MemberId == existingMember.UserId && tr.Status == "Completed")
                        .OrderByDescending(tr => tr.CompletionDate)
                        .FirstOrDefaultAsync();

                    if (lastTransfusion != null && lastTransfusion.CompletionDate.HasValue)
                    {
                        var daysSinceTransfusion = (DateTime.Now - lastTransfusion.CompletionDate.Value).TotalDays;
                        if (daysSinceTransfusion < 365)
                        {
                            return BadRequest(new { message = "Thành viên này vừa truyền máu xong, chưa thể đăng ký hiến máu cho đến khi hồi phục đủ 365 ngày." });
                        }
                    }
                }
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
                    _context.Members.Update(existingMember); // Update Member information

                await _context.SaveChangesAsync(); // Save changes to the database
                await transaction.CommitAsync(); // Commit the transaction

                return Ok(new { message = "Cập Nhập Người Dùng Thành Công." });

            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync(); // Rollback the transaction 
                throw;
            }
        }
        // Create User 
        // PATCH: api/User/create
        [HttpPost("create")]
        [Authorize(Roles = "Admin")] // Allow only Admin
        public async Task<IActionResult> CreateUser([FromBody] CreateUser request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _context.Users.AnyAsync(u => u.CitizenNumber == request.CitizenNumber))
            {
                return BadRequest(new { message = "Số CCCD đã được đăng ký." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email đã được đăng ký." });
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
                return BadRequest(new { message = "Bạn phải đủ 18 tuổi trở lên để đăng ký." });
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

            return CreatedAtAction(nameof(CreateUser), new { id = user.UserId }, user);
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
                return NotFound(new { message = "Không Tìm Thấy Người Dùng" });
            }
            if (!user.IsActive)
            {
                return BadRequest(new { message = "Người Dùng Này Đã Bị Xóa" });
            }
            user.IsActive = false;
            user.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa Người Dùng Thành Công" });
        }
        // --- Tín Coding: End ---

        // Update User Location
        // PUT: api/User/{userId}/location
        [HttpPut("{userId}/location")]
        [Authorize(Roles = "Member,Staff,Admin")] // Allow Member, Staff, Admin to update their location
        public async Task<IActionResult> UpdateUserLocation(int userId, [FromBody] LocationUpdateModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.Include(u => u.Member).FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return NotFound(new { message = "Không Tìm Thấy Người Dùng." });
            }

            // Ensure the user is updating their own location unless they are an Admin
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (currentUserId != userId.ToString() && currentUserRole != "Admin")
            {
                return Forbid(); // User is not authorized to update another user's location
            }

            // Create a Point object from latitude and longitude
            // SRID 4326 is for WGS84 (latitude/longitude)
            if (user.Member == null)
            {
                user.Member = new Member { UserId = user.UserId };
                _context.Members.Add(user.Member);
            }
            user.Member.Location = new Point(model.Longitude, model.Latitude) { SRID = 4326 };
            user.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "User location updated successfully." });
        }

        // GET: api/User/members
        [HttpGet("members")]
        [Authorize(Roles = "Admin, Staff")]
        public async Task<IActionResult> GetAllMembers()
        {
            var members = await _context.Members
                .Include(m => m.User)
                .Include(m => m.BloodType)
                .Where(m => m.User != null && m.User.IsActive)
                .Select(m => new {
                    userId = m.UserId,
                    fullName = m.User != null ? m.User.FullName : null,
                    citizenNumber = m.User != null ? m.User.CitizenNumber : null,
                    email = m.User != null ? m.User.Email : null,
                    bloodTypeId = m.BloodTypeId,
                    isRecipient = m.IsRecipient,
                    isDonor = m.IsDonor,
                    role = m.User != null && m.User.Role != null ? m.User.Role.Name : null
                })
                .ToListAsync();

            return Ok(members);
        }

        // --- Quý Coding: End ---

        // API: GET /api/User/{userId}/blood-type-id
        [HttpGet("{userId}/blood-type-id")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserBloodTypeId(int userId)
        {
            var member = await _context.Members.FirstOrDefaultAsync(m => m.UserId == userId);
            if (member == null)
                return NotFound(new { message = $"Không tìm thấy thành viên với UserId: {userId}" });
            return Ok(new { userId = member.UserId, bloodTypeId = member.BloodTypeId });
        }

        // API: PATCH /api/User/{userId}/blood-type
        [HttpPatch("{userId}/blood-type")]
        [Authorize(Roles = "Staff,Admin")]
        public async Task<IActionResult> UpdateMemberBloodType(int userId, [FromBody] UpdateBloodTypeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Tìm member theo userId
            var member = await _context.Members
                .Include(m => m.BloodType)
                .FirstOrDefaultAsync(m => m.UserId == userId);
            
            if (member == null)
                return NotFound(new { message = $"Không tìm thấy thành viên với UserId: {userId}" });

            // Kiểm tra bloodTypeId hợp lệ (1-8, không cho phép 99 - "Không biết")
            if (request.BloodTypeId < 1 || request.BloodTypeId > 8)
                return BadRequest(new { message = "BloodTypeId phải từ 1-8 (A+, A-, B+, B-, AB+, AB-, O+, O-)" });

            // Kiểm tra bloodType có tồn tại không
            var newBloodType = await _context.BloodTypes.FindAsync(request.BloodTypeId);
            if (newBloodType == null)
                return BadRequest(new { message = $"Không tìm thấy nhóm máu với ID: {request.BloodTypeId}" });

            // Lưu thông tin cũ để log
            var oldBloodTypeId = member.BloodTypeId;
            var oldBloodTypeName = member.BloodType?.BloodTypeName ?? "Không biết";

            // Cập nhật nhóm máu
            member.BloodTypeId = request.BloodTypeId;
            _context.Entry(member).State = EntityState.Modified;

            var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Cập nhật nhóm máu thành công",
                    memberId = userId,
                    oldBloodTypeId = oldBloodTypeId,
                    oldBloodTypeName = oldBloodTypeName,
                    newBloodTypeId = request.BloodTypeId,
                    newBloodTypeName = newBloodType.BloodTypeName
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật nhóm máu", error = ex.Message });
            }
        }
    }
}
