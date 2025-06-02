using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Blood_Donation_Support.DTO
{
    public class LoginModel
    {
        public string CitizenNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
