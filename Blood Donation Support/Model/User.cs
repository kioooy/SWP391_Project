using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model
{
	public partial class User
	{
		public int UserId { get; set; }
		public string? UserName { get; set; }
		public string? PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
		public string? FullName { get; set; }
		public DateTime? DateOfBirth { get; set; }
		public int Gender { get; set; }
		public string? Address { get; set; }
        public string? Role { get; set; }
		public DateOnly? CreatedAt { get; set; }
		public DateOnly? UpdateAt { get; set; }

    }
}
