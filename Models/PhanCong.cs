namespace HRManagement.Models
{
    public class PhanCong
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string MaNV { get; set; } = string.Empty;
        public string NhiemVuId { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "Mới giao"; 
    }
}
