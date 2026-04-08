namespace HRManagement.Models
{
    public class DatabaseData
    {
        public List<NhanVien> NhanViens { get; set; } = new();
        public List<NhiemVu> NhiemVus { get; set; } = new();
        public List<PhanCong> PhanCongs { get; set; } = new();
        public List<BangLuong> BangLuongs { get; set; } = new();
    }
}
