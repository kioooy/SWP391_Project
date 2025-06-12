using Blood_Donation_Support.DTO;
using Microsoft.AspNetCore.Mvc;

namespace Blood_Donation_Support.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BloodCompatibilityController : ControllerBase
    {
        // Hardcoded blood compatibility tables for demonstration
        private static readonly Dictionary<string, List<string>> WholeBloodCompatibility = new()
        {
            { "O-", new List<string> { "O-" } },
            { "O+", new List<string> { "O-", "O+" } },
            { "A-", new List<string> { "O-", "A-" } },
            { "A+", new List<string> { "O-", "O+", "A-", "A+" } },
            { "B-", new List<string> { "O-", "B-" } },
            { "B+", new List<string> { "O-", "O+", "B-", "B+" } },
            { "AB-", new List<string> { "O-", "A-", "B-", "AB-" } },
            { "AB+", new List<string> { "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+" } }
        };

        private static readonly Dictionary<string, List<string>> RedCellCompatibility = WholeBloodCompatibility; // Same as whole blood
        private static readonly Dictionary<string, List<string>> PlasmaCompatibility = new()
        {
            { "O-", new List<string> { "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+" } },
            { "O+", new List<string> { "O+", "A+", "B+", "AB+" } },
            { "A-", new List<string> { "A-", "A+", "AB-", "AB+" } },
            { "A+", new List<string> { "A+", "AB+" } },
            { "B-", new List<string> { "B-", "B+", "AB-", "AB+" } },
            { "B+", new List<string> { "B+", "AB+" } },
            { "AB-", new List<string> { "AB-", "AB+" } },
            { "AB+", new List<string> { "AB+" } }
        };
        private static readonly Dictionary<string, List<string>> PlateletCompatibility = PlasmaCompatibility; // For simplicity

        [HttpGet("whole-blood")]
        public ActionResult<BloodCompatibilityResponseDto> GetWholeBloodCompatibility([FromQuery] string recipientBloodType)
        {
            if (string.IsNullOrWhiteSpace(recipientBloodType))
                return BadRequest("recipientBloodType is required");
            if (!WholeBloodCompatibility.ContainsKey(recipientBloodType))
                return NotFound("Unknown blood type");
            return Ok(new BloodCompatibilityResponseDto
            {
                CompatibleBloodTypes = WholeBloodCompatibility[recipientBloodType]
            });
        }

        [HttpGet("component")]
        public ActionResult<BloodCompatibilityResponseDto> GetComponentCompatibility([FromQuery] string recipientBloodType, [FromQuery] string component)
        {
            if (string.IsNullOrWhiteSpace(recipientBloodType) || string.IsNullOrWhiteSpace(component))
                return BadRequest("recipientBloodType and component are required");
            Dictionary<string, List<string>> compatibilityTable = component.ToLower() switch
            {
                "whole-blood" => WholeBloodCompatibility,
                "red-cell" => RedCellCompatibility,
                "plasma" => PlasmaCompatibility,
                "platelet" => PlateletCompatibility,
                _ => null
            };
            if (compatibilityTable == null)
                return BadRequest("Invalid component type");
            if (!compatibilityTable.ContainsKey(recipientBloodType))
                return NotFound("Unknown blood type");
            return Ok(new BloodCompatibilityResponseDto
            {
                CompatibleBloodTypes = compatibilityTable[recipientBloodType]
            });
        }

        // Helper method used by BloodInventoryController – not exposed as API
        [NonAction]
        public List<string>? GetCompatibleList(string recipientBloodType, string component)
        {
            if (string.IsNullOrWhiteSpace(recipientBloodType) || string.IsNullOrWhiteSpace(component))
                return null;

            Dictionary<string, List<string>> compatibilityTable = component.ToLower() switch
            {
                "whole-blood" => WholeBloodCompatibility,
                "red-cell" => RedCellCompatibility,
                "plasma" => PlasmaCompatibility,
                "platelet" => PlateletCompatibility,
                _ => null
            };

            if (compatibilityTable == null || !compatibilityTable.ContainsKey(recipientBloodType))
                return null;

            return compatibilityTable[recipientBloodType];
        }
    }
}
