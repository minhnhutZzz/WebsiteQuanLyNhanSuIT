using System.Text.Json;
using HRManagement.Models;

namespace HRManagement.Services
{
    public class LuongService : ILuongService
    {
        private readonly string _dataFile = "data.json";

        public BangLuong LapBangLuong(LapBangLuongRequest request)
        {
            var db = LoadData();

            // Simple calculation
            decimal thucNhanTruocThu = (request.LuongCoBan * (decimal)(request.SoNgayCong / 26.0f)) + request.ThuongKPI - request.KhauTru;
            
            // Simple tax calculation (e.g. 10% for amount > 11,000,000)
            decimal thueTNCN = (request.LuongCoBan > 11000000) ? (request.LuongCoBan - 11000000) * 0.1m : 0m;
            decimal thucLanh = thucNhanTruocThu - thueTNCN;

            var bangLuong = new BangLuong
            {
                MaNV = request.MaNV,
                Thang = request.Thang,
                Nam = request.Nam,
                SoNgayCong = request.SoNgayCong,
                LuongCoBan = request.LuongCoBan,
                ThuongKPI = request.ThuongKPI,
                KhauTru = request.KhauTru,
                ThueTNCN = thueTNCN,
                ThucLanh = thucLanh,
                TrangThai = "ChuaThanhToan"
            };

            db.BangLuongs.Add(bangLuong);
            SaveData(db);

            return bangLuong;
        }

        public bool ChiTraLuong(string maBangLuong)
        {
            var db = LoadData();
            var bangLuong = db.BangLuongs.FirstOrDefault(b => b.MaBangLuong == maBangLuong);
            if (bangLuong != null && bangLuong.TrangThai == "ChuaThanhToan")
            {
                bangLuong.TrangThai = "DaThanhToan";
                SaveData(db);
                return true;
            }
            return false;
        }

        public List<BangLuong> TraCuuLuong(string maNv)
        {
            var db = LoadData();
            return db.BangLuongs.Where(b => b.MaNV == maNv).ToList();
        }

        private DatabaseData LoadData()
        {
            if (!File.Exists(_dataFile))
            {
                return new DatabaseData();
            }
            var jsonData = File.ReadAllText(_dataFile);
            return JsonSerializer.Deserialize<DatabaseData>(jsonData) ?? new DatabaseData();
        }

        private void SaveData(DatabaseData db)
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonData = JsonSerializer.Serialize(db, options);
            File.WriteAllText(_dataFile, jsonData);
        }
    }
}
