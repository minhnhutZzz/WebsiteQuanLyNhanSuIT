using HRManagement.Models;
using HRManagement.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace HRManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            var res = _authService.Login(req.Email, req.Password);
            if (string.IsNullOrEmpty(res.Token))
                return Unauthorized(new { message = res.Message });
            return Ok(res);
        }

        [HttpPost("update-profile")]
        [Authorize]
        public IActionResult UpdateProfile([FromBody] UpdateProfileRequest req)
        {
            try
            {
                Console.WriteLine("[UpdateProfile] Cập nhật thông tin...");

                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[UpdateProfile] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                var dataFile = "data.json";

                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[UpdateProfile] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                // Kiểm tra dữ liệu
                if (string.IsNullOrWhiteSpace(req.HoTen) || string.IsNullOrWhiteSpace(req.Email))
                {
                    Console.WriteLine("[UpdateProfile] ✗ Thiếu thông tin");
                    return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null || db.NhanViens == null)
                {
                    Console.WriteLine("[UpdateProfile] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Tìm nhân viên
                var nhanVien = db.NhanViens.FirstOrDefault(nv => nv.MaNV == maNv);
                if (nhanVien == null)
                {
                    Console.WriteLine($"[UpdateProfile] ✗ Nhân viên {maNv} không tìm thấy");
                    return BadRequest(new { message = "Nhân viên không tìm thấy." });
                }

                // Cập nhật thông tin
                nhanVien.HoTen = req.HoTen;
                nhanVien.Email = req.Email;

                Console.WriteLine($"[UpdateProfile] ✓ Cập nhật: HoTen='{req.HoTen}', Email='{req.Email}'");

                // Lưu vào file
                var options = new JsonSerializerOptions { WriteIndented = true };
                var updatedJson = JsonSerializer.Serialize(db, options);
                System.IO.File.WriteAllText(dataFile, updatedJson);

                Console.WriteLine($"[UpdateProfile] ✓ Lưu thành công!");
                return Ok(new { message = "Cập nhật thông tin thành công!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UpdateProfile] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }

    public class UpdateProfileRequest
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
    }
}
