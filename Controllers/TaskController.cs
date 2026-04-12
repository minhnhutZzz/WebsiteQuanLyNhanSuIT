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
            try
            {
                Console.WriteLine($"[AssignTask] Request từ QuanLy: MaNV={req.MaNV}, TenNhiemVu={req.TenNhiemVu}");
                
                var resultMsg = await _nhiemVuService.PhanCong(req);
                Console.WriteLine($"[AssignTask] Result: {resultMsg}");

                if (resultMsg.Contains("thành công"))
                {
                    Console.WriteLine($"[AssignTask] ✓ Phân công thành công!");
                    return Ok(new { message = resultMsg });
                }
                    
                Console.WriteLine($"[AssignTask] ✗ Phân công thất bại: {resultMsg}");
                return BadRequest(new { message = resultMsg });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AssignTask] ✗ Exception: {ex.Message}");
                Console.WriteLine($"[AssignTask] Stack: {ex.StackTrace}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // Bước 2: API lấy danh sách nhân viên để Frontend hiển thị dropdown
        [HttpGet("employees")]
        public IActionResult GetEmployees()
        {
            try
            {
                Console.WriteLine("[GetEmployees] Lấy danh sách nhân viên...");
                
                var dataFile = "data.json";
                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine($"[GetEmployees] ✗ File không tìm thấy: {dataFile}");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null)
                {
                    Console.WriteLine("[GetEmployees] ✗ Lỗi đọc JSON");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Trả về danh sách nhân viên (không bao gồm password)
                var employees = db.NhanViens
                    .Where(nv => nv.Role == "NhanVien")
                    .Select(nv => new { nv.MaNV, nv.HoTen, nv.TrangThai, nv.Email })
                    .ToList();

                Console.WriteLine($"[GetEmployees] ✓ Trả về {employees.Count} nhân viên");
                return Ok(employees);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetEmployees] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // Bước 3: API lấy thống kê tổng quan cho Dashboard
        [HttpGet("my-tasks")]
        [Authorize]
        public IActionResult GetMyTasks()
        {
            try
            {
                Console.WriteLine("[GetMyTasks] Lấy công việc của nhân viên...");
                
                // Get current user's MaNV from JWT claims
                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[GetMyTasks] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                Console.WriteLine($"[GetMyTasks] MaNV: {maNv}");

                var dataFile = "data.json";
                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[GetMyTasks] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null)
                {
                    Console.WriteLine("[GetMyTasks] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Get all assignments for this employee
                var myAssignments = db.PhanCongs
                    .Where(pc => pc.MaNV == maNv)
                    .ToList();

                Console.WriteLine($"[GetMyTasks] ✓ Tìm thấy {myAssignments.Count} phân công");

                // Map to response with task details
                var myTasks = myAssignments.Select(assignment => {
                    var task = db.NhiemVus.FirstOrDefault(nv => nv.Id == assignment.NhiemVuId);
                    return new
                    {
                        assignment.Id,
                        MaNV = assignment.MaNV,
                        task?.TenNhiemVu,
                        task?.MoTa,
                        task?.NgayBatDau,
                        task?.HanChot,
                        TrangThai = assignment.TrangThai
                    };
                }).ToList();

                Console.WriteLine($"[GetMyTasks] ✓ Trả về {myTasks.Count} tasks");
                return Ok(myTasks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetMyTasks] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

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

        // Chấm công - Vào ca
        [HttpPost("checkin")]
        [Authorize]
        public async Task<IActionResult> CheckIn()
        {
            try
            {
                Console.WriteLine("[CheckIn] Nhân viên chấm công vào...");

                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[CheckIn] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                var dataFile = "data.json";

                if (!System.IO.File.Exists(dataFile))
                    return NotFound(new { message = "Database chưa cấu hình." });

                var jsonData = await System.IO.File.ReadAllTextAsync(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null)
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });

                // Check if already checked in today
                var today = DateTime.Now.Date;
                var checkedIn = db.ChámCông == null ? false : 
                    db.ChámCông.Any(c => 
                        c.ContainsKey("MaNV") && c["MaNV"]?.ToString() == maNv &&
                        DateTime.Parse(c["NgàyChấm"]?.ToString() ?? "").Date == today &&
                        c.ContainsKey("TiếVào") && c["TiếVào"] != null
                    );

                if (checkedIn)
                {
                    return BadRequest(new { message = "Bạn đã chấm vào hôm nay rồi!" });
                }

                var record = new Dictionary<string, object>
                {
                    { "Id", Guid.NewGuid().ToString() },
                    { "MaNV", maNv },
                    { "NgàyChấm", today.ToString("yyyy-MM-dd") },
                    { "TiếVào", DateTime.Now },
                    { "TiếRa", null }
                };

                if (db.ChámCông == null)
                    db.ChámCông = new List<Dictionary<string, object>>();

                db.ChámCông.Add(record);

                var options = new JsonSerializerOptions { WriteIndented = true };
                await System.IO.File.WriteAllTextAsync(dataFile, JsonSerializer.Serialize(db, options));

                Console.WriteLine($"[CheckIn] ✓ {maNv} chấm vào lúc {DateTime.Now:HH:mm:ss}");

                return Ok(new { message = "Chấm vào thành công!", time = DateTime.Now });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CheckIn] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // Chấm công - Ra ca
        [HttpPost("checkout")]
        [Authorize]
        public async Task<IActionResult> CheckOut()
        {
            try
            {
                Console.WriteLine("[CheckOut] Nhân viên chấm công ra...");

                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[CheckOut] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                var dataFile = "data.json";

                if (!System.IO.File.Exists(dataFile))
                    return NotFound(new { message = "Database chưa cấu hình." });

                var jsonData = await System.IO.File.ReadAllTextAsync(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null)
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });

                // Find today's check-in record
                var today = DateTime.Now.Date;
                var record = db.ChámCông == null ? null :
                    db.ChámCông.FirstOrDefault(c =>
                        c.ContainsKey("MaNV") && c["MaNV"]?.ToString() == maNv &&
                        DateTime.Parse(c["NgàyChấm"]?.ToString() ?? "").Date == today
                    );

                if (record == null)
                {
                    Console.WriteLine($"[CheckOut] ✗ Không tìm thấy chấm vào hôm nay");
                    return BadRequest(new { message = "Bạn chưa chấm vào hôm nay!" });
                }

                if (record.ContainsKey("TiếRa") && record["TiếRa"] != null)
                {
                    Console.WriteLine($"[CheckOut] ✗ Đã chấm ra rồi");
                    return BadRequest(new { message = "Bạn đã chấm ra rồi!" });
                }

                // Calculate hours worked
                var checkInTime = DateTime.Parse(record["TiếVào"]?.ToString() ?? "");
                var checkOutTime = DateTime.Now;
                var hoursWorked = (checkOutTime - checkInTime).TotalHours;

                record["TiếRa"] = checkOutTime;
                record["GiờLàm"] = Math.Round(hoursWorked, 2);

                var options = new JsonSerializerOptions { WriteIndented = true };
                await System.IO.File.WriteAllTextAsync(dataFile, JsonSerializer.Serialize(db, options));

                Console.WriteLine($"[CheckOut] ✓ {maNv} chấm ra lúc {checkOutTime:HH:mm:ss} - Giờ làm: {hoursWorked:F2}h");

                return Ok(new { 
                    message = "Chấm ra thành công!", 
                    time = checkOutTime,
                    hoursWorked = Math.Round(hoursWorked, 2)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CheckOut] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}
