using System;
using System.ComponentModel.DataAnnotations;

namespace Blood_Donation_Support.DTO
{
    public class RegisterModel
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số CCCD/CMND là bắt buộc")]
        [RegularExpression(@"^\d{9,12}$", ErrorMessage = "Số CCCD/CMND không hợp lệ")]
        public string CitizenNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [RegularExpression(@"^0\d{9}$", ErrorMessage = "Số điện thoại không hợp lệ")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Ngày sinh là bắt buộc")]
        public DateOnly DateOfBirth { get; set; }

        [Required(ErrorMessage = "Giới tính là bắt buộc")]
        public bool Sex { get; set; } // true = Nam, false = Nữ

        [Required(ErrorMessage = "Địa chỉ là bắt buộc")]
        public string Address { get; set; } = string.Empty;

        // Thông tin thêm cho Member (không bắt buộc)
        public int? BloodTypeId { get; set; }
        public int? Weight { get; set; }
        public int? Height { get; set; }
        public bool IsDonor { get; set; } = true; // Mặc định là người hiến máu
        public bool IsRecipient { get; set; } = false; // Mặc định không phải người nhận máu
    }
}
