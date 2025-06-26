using Blood_Donation_Support.Data;
using Blood_Donation_Support.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly BloodDonationSupportContext _context;
        public DashboardController(BloodDonationSupportContext context)
        {
            _context = context;
        }

        // Get Count of data in the dashboard
        // GET: api/Dashboard/
        [HttpGet("total-number")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TotalNumberData()
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

            var totalMember = await _context.Users.CountAsync(m => m.RoleId == 3 && m.IsActive == true);                  // Total number of members
            var totalStaff = await _context.Users.CountAsync(s => s.RoleId == 2 && s.IsActive == true);                   // Total number of staff
            var totalDonationRequest = await _context.DonationRequests.CountAsync(dr => dr.Status == "Completed");        // Total of donation requests completed
            var totalTransfusionRequest = await _context.TransfusionRequests.CountAsync(tr => tr.Status == "Completed");  // Total of transfusion requests completed
            var totalBloodUnits = await _context.BloodUnits.CountAsync(bu => bu.BloodStatus == "Available");              // Total of available blood units
            var totalBlogs = await _context.Blogs.CountAsync(b => b.Status == "Published" && b.IsActive == true);         // Total of active blogs 
            var totalArticles = await _context.Articles.CountAsync(a => a.Status == "Published" && a.IsActive == true);   // Total of active articles
            return Ok(new
            {   
                TotalMembers = totalMember,                         // Total number of members
                TotalStaff = totalStaff,                            // Total number of staff
                TotalDonationRequests = totalDonationRequest,       // Total number of donation requests completed
                TotalTransfusionRequests = totalTransfusionRequest, // Total number of transfusion requests completed
                TotalBloodUnits = totalBloodUnits,                  // Total number of available blood units
                TotalBlogs = totalBlogs,                            // Total number of active blogs
                TotalArticles = totalArticles                       // Total number of active articles
            });
        }

        // Get Blood Inventory and Donation Analytics
        // GET: api/Dashboard/blood-inventory
        [HttpGet("blood-inventory")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBloodInventoryStats()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid
            // Count blood units by type and component
            var bloodByType = await _context.BloodUnits
                .Where(bu => bu.BloodStatus == "Available")
                .GroupBy(bu => new { bu.BloodTypeId, bu.BloodType.BloodTypeName })
                .Select(g => new { g.Key.BloodTypeId,g.Key.BloodTypeName, Count = g.Count() })
                .ToListAsync();
            // Count blood units by component 
            var bloodByComponent = await _context.BloodUnits
                .Where(bu => bu.BloodStatus == "Available")
                .GroupBy(bu => new { bu.ComponentId, bu.Component.ComponentName })
                .Select(g => new { g.Key.ComponentId,g.Key.ComponentName, Count = g.Count() })
                .ToListAsync();
                
            return Ok(new { 
                BloodByType = bloodByType, 
                BloodByComponent = bloodByComponent 
            });
        }

        // Get Donation Analytics ( view status count )
        // GET: api/Dashboard/donation-analytics
        [HttpGet("donation-analytics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDonationAnalytics()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

            // Total volume of blood donated
            var totalDonationVolume = await _context.DonationRequests
                .Where(dr => dr.Status == "Completed")
                .SumAsync(dr => dr.DonationVolume);
            // Count status of donation requests
            var donationByStatus = await _context.DonationRequests
                .GroupBy(dr => dr.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();
            // Count staff take responsible of donation requests
            var staffResponsible = await _context.DonationRequests
                .GroupBy(dr => new { dr.ResponsibleById, dr.ResponsibleBy.FullName })
                .Select(g => new { g.Key.ResponsibleById, g.Key.FullName, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(5) // Get top 5
                .ToListAsync();

            return Ok(new {
                TotalDonationVolume = totalDonationVolume,
                DonationByStatus = donationByStatus,
                StaffResponsible = staffResponsible
            });
        }

        // Get Transfusion Analytics
        // GET: api/Dashboard/donation-analytics
        [HttpGet("transfusion-analytics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTransfusionAnalytics()
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid
            
            // Total transfusion volume of blood transfusion
            var totalDonationVolume = await _context.TransfusionRequests
                .Where(dr => dr.Status == "Completed")
                .SumAsync(dr => dr.TransfusionVolume);
            // Count status of donation requests
            var donationByStatus = await _context.TransfusionRequests
                .GroupBy(dr => dr.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();
            // Count top 3 staff take most responsible of transfusion requests
            var staffResponsible = await _context.TransfusionRequests
                .GroupBy(dr => new { dr.ResponsibleById, dr.ResponsibleBy.FullName })
                .Select(g => new { g.Key.ResponsibleById,g.Key.FullName, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(5) // Get top 5
                .ToListAsync();
            // Count top 3 members who have most of transfusion requests
            var memberTransfusion = await _context.TransfusionRequests
                .GroupBy(dr => new { dr.MemberId, dr.Member.User.FullName })
                .Select(g => new { g.Key.MemberId, g.Key.FullName, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(5) // Get top 5
                .ToListAsync();
            // Count staff take responsible of donation requests
            var bloodType = await _context.TransfusionRequests
                .GroupBy(dr => new { dr.BloodTypeId, dr.BloodType.BloodTypeName })
                .Select(g => new { g.Key.BloodTypeId, g.Key.BloodTypeName, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(5) // Get top 5
                .ToListAsync();
            // Count component of transfusion requests
            var componentId = await _context.TransfusionRequests
                .GroupBy(dr => new { dr.ComponentId, dr.Component.ComponentName })
                .Select(g => new { g.Key.ComponentId, g.Key.ComponentName, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .Take(5) // Get top 5
                .ToListAsync();

            return Ok(new
            {
                DonationByStatus = donationByStatus,
                StaffResponsible = staffResponsible,
                MemberTransfusion = memberTransfusion,
                BloodType = bloodType,
                Component = componentId,
                TotalDonationVolume = totalDonationVolume
            });
        }

        //[HttpGet("donation-periods")]
        //[Authorize(Roles = "Admin")]
        //public async Task<IActionResult> GetDonationPeriodStats()
        //{
        //    var activePeriods = await _context.BloodDonationPeriods
        //        .Where(p => p.Status == "Active")
        //        .Select(p => new {
        //            p.PeriodId,
        //            p.PeriodName,
        //            p.Location,
        //            p.TargetQuantity,
        //            p.CurrentQuantity,
        //            Progress = p.CurrentQuantity.HasValue ?
        //                (int)((float)p.CurrentQuantity.Value / p.TargetQuantity * 100) : 0,
        //            DaysRemaining = EF.Functions.DateDiffDay(DateTime.Now, p.PeriodDateTo)
        //        })
        //        .ToListAsync();

        //    return Ok(activePeriods);
        //}

        // Get Recent Activity From Requests (Top 10 recently each request type)
        // GET: api/Dashboard/recent-activity
        [HttpGet("recent-activity")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRecentActivity(int count = 10)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Status 400 Bad Request if model state is invalid

            var recentDonations = await _context.DonationRequests
                .OrderByDescending(dr => dr.RequestDate)
                .Take(count)
                .Select(dr => new { Type = "Donation", dr.RequestDate, dr.Status })
                .ToListAsync();

            var recentTransfusions = await _context.TransfusionRequests
                .OrderByDescending(tr => tr.RequestDate)
                .Take(count)
                .Select(tr => new { Type = "Transfusion", tr.RequestDate, tr.Status })
                .ToListAsync();

            var recentActivity = recentDonations.Concat(recentTransfusions)
                .OrderByDescending(a => a.RequestDate)
                .Take(count);

            return Ok(recentActivity);
        }
    }
}