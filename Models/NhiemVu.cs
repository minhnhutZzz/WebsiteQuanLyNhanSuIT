namespace HRManagement.Models
{
    public class NhiemVu
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string TenNhiemVu { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public DateTime? NgayBatDau { get; set; }
        public DateTime? HanChot { get; set; }
    }
}
