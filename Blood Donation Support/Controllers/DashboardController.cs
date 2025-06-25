using Blood_Donation_Support.Data;
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
                .GroupBy(bu => bu.BloodTypeId)
                .Select(g => new { BloodTypeId = g.Key, Count = g.Count() })
                .ToListAsync();
            // Count blood units by component 
            var bloodByComponent = await _context.BloodUnits
                .Where(bu => bu.BloodStatus == "Available")
                .GroupBy(bu => bu.ComponentId)
                .Select(g => new { ComponentId = g.Key, Count = g.Count() })
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

            // Count status of donation requests
            var donationByStatus = await _context.DonationRequests
                .GroupBy(dr => dr.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();
                
            return Ok(new { 
                DonationByStatus = donationByStatus 
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