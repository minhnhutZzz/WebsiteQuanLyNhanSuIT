namespace HRManagement.Models
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public NhanVien? User { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class PhanCongRequest
    {
        public string MaNV { get; set; } = string.Empty;
        public string TenNhiemVu { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public DateTime? NgayBatDau { get; set; }
        public DateTime? HanChot { get; set; }
    }

    public class PayrollConfirmRequest
    {
        public string[] PayrollIds { get; set; } = new string[0];
        public string Date { get; set; } = string.Empty;
    }
}
