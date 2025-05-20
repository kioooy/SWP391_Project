using System;
using System.Collections.Generic;

namespace Blood_Donation_Support.Model
{
	public partial class User
	{
		public int UserId { get; set; }
		public string? UserName { get; set; }
		public string? Password { get; set; }
		public string? Role { get; set; }
		public string? Phone { get; set; }

	}
}
