using System.Text.Json;
using HRManagement.Models;

namespace HRManagement.Services
{
    public class NhiemVuService : INhiemVuService
    {
        private readonly string _dataFile = "data.json";

        public async Task<string> PhanCong(PhanCongRequest req)
        {
            Console.WriteLine($"[PhanCong] Bắt đầu phân công: MaNV={req.MaNV}, TenNhiemVu={req.TenNhiemVu}");
            
            if (string.IsNullOrWhiteSpace(req.TenNhiemVu) || !req.NgayBatDau.HasValue || !req.HanChot.HasValue)
            {
                Console.WriteLine("[PhanCong] ✗ Validation failed: thiếu dữ liệu");
                return "Bạn cần nhập Tên nhiệm vụ, ngày bắt đầu và hạn chót.";
            }

            if (!File.Exists(_dataFile))
            {
                Console.WriteLine($"[PhanCong] ✗ File không tìm thấy: {_dataFile}");
                return "Database chưa cấu hình.";
            }

            var jsonData = await File.ReadAllTextAsync(_dataFile);
            var db = JsonSerializer.Deserialize<DatabaseData>(jsonData) ?? new DatabaseData();

            var nhanVien = db.NhanViens.FirstOrDefault(n => n.MaNV == req.MaNV);
            if (nhanVien == null)
            {
                Console.WriteLine($"[PhanCong] ✗ Nhân viên không tìm thấy: {req.MaNV}");
                return "Nhân viên không tồn tại.";
            }

            if (nhanVien.TrangThai == "Nghỉ phép")
            {
                Console.WriteLine($"[PhanCong] ✗ Nhân viên đang Nghỉ phép: {req.MaNV}");
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

            Console.WriteLine($"[PhanCong] ✓ Thêm nhiệm vụ: {newNhiemVu.Id}, phân công: {newPhanCong.Id}");

            var options = new JsonSerializerOptions { WriteIndented = true };
            await File.WriteAllTextAsync(_dataFile, JsonSerializer.Serialize(db, options));

            Console.WriteLine($"[PhanCong] ✓ Lưu vào data.json thành công");

            await DongBoLichGoogleCalendar();

            Console.WriteLine($"[PhanCong] ✓ Phân công thành công!");
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
