namespace HRManagement.Models
{
    public class NhanVien
    {
        public string MaNV { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "NhanVien";
    }

    public class QuanLy : NhanVien
    {
        public QuanLy()
        {
            Role = "QuanLy";
        }
    }

    public class HR : NhanVien
    {
        public HR()
        {
            Role = "HR";
        }
    }
}
