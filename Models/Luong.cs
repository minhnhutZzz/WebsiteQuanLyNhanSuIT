namespace HRManagement.Models
{
    public class BangLuong
    {
        public string MaBangLuong { get; set; } = Guid.NewGuid().ToString();
        public string MaNV { get; set; } = string.Empty;
        public int Thang { get; set; }
        public int Nam { get; set; }
        public float SoNgayCong { get; set; }
        public decimal LuongCoBan { get; set; }
        public decimal ThuongKPI { get; set; }
        public decimal KhauTru { get; set; }
        public decimal ThueTNCN { get; set; }
        public decimal ThucLanh { get; set; }
        public string TrangThai { get; set; } = "ChuaThanhToan"; // ChuaThanhToan, DaThanhToan
    }
}
