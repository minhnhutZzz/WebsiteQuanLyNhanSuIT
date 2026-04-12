namespace HRManagement.Models
{
    public class DatabaseData
    {
        public List<NhanVien> NhanViens { get; set; } = new();
        public List<NhiemVu> NhiemVus { get; set; } = new();
        public List<PhanCong> PhanCongs { get; set; } = new();
        public List<BangLuong> BangLuongs { get; set; } = new();
        public List<Dictionary<string, object>> ChamCong { get; set; } = new();
    }

    public class BangLuong
    {
        public string id { get; set; }
        public string MaNV { get; set; }
        public string HoTen { get; set; }
        public string Thang { get; set; }
        public long LuongCoBan { get; set; }
        public long PhuCap { get; set; }
        public long Thuong { get; set; }
        public long TiemNang { get; set; }
        public long TongThuNhap { get; set; }
        public long BaoHiem { get; set; }
        public long ThueThuNhap { get; set; }
        public long CacKhoanTru { get; set; }
        public long TongTruNhap { get; set; }
        public long ThuongThuc { get; set; }
        public string TrangThai { get; set; }
        public string NgayXuat { get; set; }
        public string NgayThanhToan { get; set; }
    }
}
