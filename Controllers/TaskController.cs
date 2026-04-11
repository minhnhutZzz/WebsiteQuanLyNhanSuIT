using HRManagement.Models;
using HRManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HRManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly INhiemVuService _nhiemVuService;

        public TaskController(INhiemVuService nhiemVuService)
        {
            _nhiemVuService = nhiemVuService;
        }

        // Bước 1: API phân công nhiệm vụ – chỉ QuanLy mới được gọi (RBAC)
        [HttpPost("assign")]
        [Authorize(Roles = "QuanLy")]
        public async Task<IActionResult> AssignTask([FromBody] PhanCongRequest req)
        {
            var resultMsg = await _nhiemVuService.PhanCong(req);

            if (resultMsg.Contains("thành công"))
                return Ok(new { message = resultMsg });
                
            return BadRequest(new { message = resultMsg });
        }

        // Bước 2: API lấy danh sách nhân viên để Frontend hiển thị dropdown
        [HttpGet("employees")]
        public IActionResult GetEmployees()
        {
            var dataFile = "data.json";
            if (!System.IO.File.Exists(dataFile))
                return NotFound(new { message = "Database chưa cấu hình." });

            var jsonData = System.IO.File.ReadAllText(dataFile);
            var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

            if (db == null)
                return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });

            // Trả về danh sách nhân viên (không bao gồm password)
            var employees = db.NhanViens
                .Where(nv => nv.Role == "NhanVien")
                .Select(nv => new { nv.MaNV, nv.HoTen, nv.TrangThai, nv.Email })
                .ToList();

            return Ok(employees);
        }

        // Bước 3: API lấy thống kê tổng quan cho Dashboard
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            var dataFile = "data.json";
            if (!System.IO.File.Exists(dataFile))
                return NotFound(new { message = "Database chưa cấu hình." });

            var jsonData = System.IO.File.ReadAllText(dataFile);
            var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

            if (db == null)
                return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });

            var tongNhanVien = db.NhanViens.Count;
            var khaDung = db.NhanViens.Count(nv => nv.TrangThai == "Khả dụng");
            var nghiPhep = db.NhanViens.Count(nv => nv.TrangThai == "Nghỉ phép");
            var tongNhiemVu = db.NhiemVus.Count;
            var tongPhanCong = db.PhanCongs.Count;

            return Ok(new
            {
                tongNhanVien,
                khaDung,
                nghiPhep,
                tongNhiemVu,
                tongPhanCong
            });
        }
    }
}
