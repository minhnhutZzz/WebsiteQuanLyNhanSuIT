using System.Text.Json;
using HRManagement.Models;

namespace HRManagement.Services
{
    public class NhiemVuService : INhiemVuService
    {
        private readonly string _dataFile = "data.json";

        public async Task<string> PhanCong(PhanCongRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.TenNhiemVu) || !req.NgayBatDau.HasValue || !req.HanChot.HasValue)
            {
                return "Bạn cần nhập Tên nhiệm vụ, ngày bắt đầu và hạn chót.";
            }

            if (!File.Exists(_dataFile)) return "Database chưa cấu hình.";

            var jsonData = await File.ReadAllTextAsync(_dataFile);
            var db = JsonSerializer.Deserialize<DatabaseData>(jsonData) ?? new DatabaseData();

            var nhanVien = db.NhanViens.FirstOrDefault(n => n.MaNV == req.MaNV);
            if (nhanVien == null) return "Nhân viên không tồn tại.";

            if (nhanVien.TrangThai == "Nghỉ phép")
            {
                return "Nhân viên đang Nghỉ phép, không thể phân công.";
            }

            var newNhiemVu = new NhiemVu
            {
                TenNhiemVu = req.TenNhiemVu,
                MoTa = req.MoTa,
                NgayBatDau = req.NgayBatDau,
                HanChot = req.HanChot
            };

            var newPhanCong = new PhanCong
            {
                MaNV = req.MaNV,
                NhiemVuId = newNhiemVu.Id
            };

            db.NhiemVus.Add(newNhiemVu);
            db.PhanCongs.Add(newPhanCong);

            var options = new JsonSerializerOptions { WriteIndented = true };
            await File.WriteAllTextAsync(_dataFile, JsonSerializer.Serialize(db, options));

            await DongBoLichGoogleCalendar();

            return "Phân công thành công và đã đồng bộ Google Calendar.";
        }

        private async Task DongBoLichGoogleCalendar()
        {
            // Mock API.
            await Task.Delay(500); 
            Console.WriteLine("Đã đồng bộ lên Google Calendar.");
        }
    }
}
