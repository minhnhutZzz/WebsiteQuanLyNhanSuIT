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
                var checkedIn = db.ChamCong == null ? false : 
                    db.ChamCong.Any(c => 
                        c.ContainsKey("MaNV") && c["MaNV"]?.ToString() == maNv &&
                        DateTime.Parse(c["NgayChap"]?.ToString() ?? "").Date == today &&
                        c.ContainsKey("TioVao") && c["TioVao"] != null
                    );

                if (checkedIn)
                {
                    return BadRequest(new { message = "Bạn đã chấm vào hôm nay rồi!" });
                }

                var record = new Dictionary<string, object>
                {
                    { "Id", Guid.NewGuid().ToString() },
                    { "MaNV", maNv },
                    { "NgayChap", today.ToString("yyyy-MM-dd") },
                    { "TioVao", DateTime.Now },
                    { "TioRa", null }
                };

                if (db.ChamCong == null)
                    db.ChamCong = new List<Dictionary<string, object>>();

                db.ChamCong.Add(record);

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
                var record = db.ChamCong == null ? null :
                    db.ChamCong.FirstOrDefault(c =>
                        c.ContainsKey("MaNV") && c["MaNV"]?.ToString() == maNv &&
                        DateTime.Parse(c["NgayChap"]?.ToString() ?? "").Date == today
                    );

                if (record == null)
                {
                    Console.WriteLine($"[CheckOut] ✗ Không tìm thấy chấm vào hôm nay");
                    return BadRequest(new { message = "Bạn chưa chấm vào hôm nay!" });
                }

                if (record.ContainsKey("TioRa") && record["TioRa"] != null)
                {
                    Console.WriteLine($"[CheckOut] ✗ Đã chấm ra rồi");
                    return BadRequest(new { message = "Bạn đã chấm ra rồi!" });
                }

                // Calculate hours worked
                var checkInTime = DateTime.Parse(record["TioVao"]?.ToString() ?? "");
                var checkOutTime = DateTime.Now;
                var hoursWorked = (checkOutTime - checkInTime).TotalHours;

                record["TioRa"] = checkOutTime;
                record["GioLam"] = Math.Round(hoursWorked, 2);

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

        // Get attendance history for current employee
        [HttpGet("attendance-history")]
        [Authorize]
        public IActionResult GetAttendanceHistory()
        {
            try
            {
                Console.WriteLine("[GetAttendanceHistory] Lấy lịch sử chấm công...");

                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[GetAttendanceHistory] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                var dataFile = "data.json";

                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[GetAttendanceHistory] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null)
                {
                    Console.WriteLine("[GetAttendanceHistory] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Get all records for this employee
                var myRecords = db.ChamCong == null ? new() :
                    db.ChamCong
                        .Where(c => c.ContainsKey("MaNV") && c["MaNV"]?.ToString() == maNv)
                        .OrderByDescending(c => c["NgayChap"])
                        .ToList();

                Console.WriteLine($"[GetAttendanceHistory] ✓ Tìm thấy {myRecords.Count} records cho {maNv}");

                var result = myRecords.Select(record => new
                {
                    date = record["NgayChap"]?.ToString() ?? "",
                    checkIn = record.ContainsKey("TioVao") && record["TioVao"] != null 
                        ? DateTime.Parse(record["TioVao"].ToString()).ToLocalTime().ToString("HH:mm:ss")
                        : "--:--:--",
                    checkOut = record.ContainsKey("TioRa") && record["TioRa"] != null
                        ? DateTime.Parse(record["TioRa"].ToString()).ToLocalTime().ToString("HH:mm:ss")
                        : "--:--:--",
                    hours = record.ContainsKey("GioLam") ? record["GioLam"]?.ToString() : "--"
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetAttendanceHistory] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // API lấy danh sách nhân viên đang làm việc (vào rồi chưa ra)
        [HttpGet("currently-working")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult GetCurrentlyWorking()
        {
            try
            {
                Console.WriteLine("[GetCurrentlyWorking] Lấy danh sách nhân viên đang làm...");

                var dataFile = "data.json";
                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[GetCurrentlyWorking] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null || db.NhanViens == null || db.ChamCong == null)
                {
                    Console.WriteLine("[GetCurrentlyWorking] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                var today = DateTime.Now.ToString("yyyy-MM-dd");
                Console.WriteLine($"[GetCurrentlyWorking] Kiểm tra date: {today}");

                // Lấy tất cả nhân viên vào làm hôm nay (TioVao có giá trị) nhưng chưa ra (TioRa null)
                var currentlyWorking = new List<object>();
                
                foreach (var chamCongRecord in db.ChamCong)
                {
                    if (!chamCongRecord.ContainsKey("MaNV") || !chamCongRecord.ContainsKey("NgayChap"))
                        continue;

                    var ngayChap = chamCongRecord["NgayChap"]?.ToString();
                    var maNv = chamCongRecord["MaNV"]?.ToString();
                    var tioVao = chamCongRecord.ContainsKey("TioVao") ? chamCongRecord["TioVao"]?.ToString() : null;
                    var tioRa = chamCongRecord.ContainsKey("TioRa") ? chamCongRecord["TioRa"]?.ToString() : null;

                    // Điều kiện: hôm nay, có vào nhưng chưa ra
                    if (ngayChap == today && !string.IsNullOrEmpty(tioVao) && string.IsNullOrEmpty(tioRa))
                    {
                        var nhanVien = db.NhanViens.FirstOrDefault(nv => nv.MaNV == maNv);
                        if (nhanVien != null)
                        {
                            var checkInTime = DateTime.Parse(tioVao).ToLocalTime();
                            var timeWorked = Math.Round((DateTime.Now - checkInTime).TotalHours, 2);

                            currentlyWorking.Add(new
                            {
                                maNV = nhanVien.MaNV,
                                hoTen = nhanVien.HoTen,
                                checkInTime = checkInTime.ToString("HH:mm:ss"),
                                timeWorked = timeWorked,
                                email = nhanVien.Email
                            });
                            Console.WriteLine($"[GetCurrentlyWorking] ✓ {nhanVien.HoTen} đang làm (vào lúc {checkInTime:HH:mm:ss})");
                        }
                    }
                }

                Console.WriteLine($"[GetCurrentlyWorking] ✓ Tìm thấy {currentlyWorking.Count} nhân viên đang làm");
                return Ok(currentlyWorking);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetCurrentlyWorking] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // API xin nghỉ
        [HttpPost("request-leave")]
        [Authorize]
        public IActionResult RequestLeave([FromBody] LeaveRequestDto req)
        {
            try
            {
                Console.WriteLine("[RequestLeave] Nhân viên xin nghỉ...");

                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[RequestLeave] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                var dataFile = "data.json";

                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[RequestLeave] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null || db.NhanViens == null)
                {
                    Console.WriteLine("[RequestLeave] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Tìm nhân viên
                var nhanVien = db.NhanViens.FirstOrDefault(nv => nv.MaNV == maNv);
                if (nhanVien == null)
                {
                    Console.WriteLine($"[RequestLeave] ✗ Nhân viên {maNv} không tìm thấy");
                    return BadRequest(new { message = "Nhân viên không tìm thấy." });
                }

                // Kiểm tra dịnh dạng ngày
                if (!DateTime.TryParse(req.NgayBatDau, out var startDate) || 
                    !DateTime.TryParse(req.NgayKetThuc, out var endDate))
                {
                    Console.WriteLine($"[RequestLeave] ✗ Định dạng ngày không hợp lệ");
                    return BadRequest(new { message = "Định dạng ngày không hợp lệ." });
                }

                if (startDate > endDate)
                {
                    Console.WriteLine($"[RequestLeave] ✗ Ngày bắt đầu > ngày kết thúc");
                    return BadRequest(new { message = "Ngày bắt đầu phải <= ngày kết thúc." });
                }

                // Tính số ngày
                var soNgay = (int)(endDate - startDate).TotalDays + 1;

                // Tạo record xin nghỉ
                var leaveRecord = new Dictionary<string, object>
                {
                    { "Id", Guid.NewGuid().ToString() },
                    { "MaNV", maNv },
                    { "HoTen", nhanVien.HoTen },
                    { "LyDo", req.LyDo },
                    { "NgayBatDau", req.NgayBatDau },
                    { "NgayKetThuc", req.NgayKetThuc },
                    { "SoNgay", soNgay },
                    { "TrangThai", "Dang cho duyet" },
                    { "NgayGui", DateTime.Now.ToUniversalTime().ToString("O") },
                    { "GhiChu", "" }
                };

                if (db.XinNghi == null) db.XinNghi = new();
                db.XinNghi.Add(leaveRecord);

                var options = new JsonSerializerOptions { WriteIndented = true };
                var updatedJson = JsonSerializer.Serialize(db, options);
                System.IO.File.WriteAllText(dataFile, updatedJson);

                Console.WriteLine($"[RequestLeave] ✓ Xin nghỉ thành công! ID: {leaveRecord["Id"]}");
                return Ok(new { message = "Xin nghỉ thành công!", id = leaveRecord["Id"] });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RequestLeave] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // API lấy lịch sử đơn xin nghỉ của nhân viên hiện tại
        [HttpGet("my-leave-requests")]
        [Authorize]
        public IActionResult GetMyLeaveRequests()
        {
            try
            {
                Console.WriteLine("[GetMyLeaveRequests] Nhân viên lấy lịch sử đơn xin nghỉ...");

                var maNvClaim = User.FindFirst("MaNV");
                if (maNvClaim == null)
                {
                    Console.WriteLine("[GetMyLeaveRequests] ✗ Không tìm thấy claim MaNV");
                    return Unauthorized(new { message = "Token không hợp lệ." });
                }

                var maNv = maNvClaim.Value;
                var dataFile = "data.json";
                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[GetMyLeaveRequests] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null || db.XinNghi == null)
                {
                    Console.WriteLine("[GetMyLeaveRequests] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Lọc chỉ lấy đơn của nhân viên hiện tại
                var myRequests = db.XinNghi
                    .Where(x => x.ContainsKey("MaNV") && x["MaNV"]?.ToString() == maNv)
                    .OrderByDescending(x => {
                        var dateStr = x["NgayGui"]?.ToString();
                        return DateTime.TryParse(dateStr, out var dt) ? dt : DateTime.MinValue;
                    })
                    .Select(x => new
                    {
                        id = x["Id"]?.ToString(),
                        maNV = x["MaNV"]?.ToString(),
                        hoTen = x["HoTen"]?.ToString(),
                        lyDo = x["LyDo"]?.ToString(),
                        ngayBatDau = x["NgayBatDau"]?.ToString(),
                        ngayKetThuc = x["NgayKetThuc"]?.ToString(),
                        soNgay = x["SoNgay"],
                        trangThai = x["TrangThai"]?.ToString(),
                        ngayGui = x["NgayGui"]?.ToString(),
                        ghiChu = x["GhiChu"]?.ToString()
                    })
                    .ToList();

                Console.WriteLine($"[GetMyLeaveRequests] ✓ Tìm thấy {myRequests.Count} đơn xin nghỉ cho {maNv}");
                return Ok(myRequests);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetMyLeaveRequests] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // API lấy danh sách đơn xin nghỉ (QuanLy dùng)
        [HttpGet("leave-requests")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult GetLeaveRequests([FromQuery] string? status = null)
        {
            try
            {
                Console.WriteLine("[GetLeaveRequests] QuanLy lấy danh sách đơn xin nghỉ...");

                var dataFile = "data.json";
                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[GetLeaveRequests] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null || db.XinNghi == null)
                {
                    Console.WriteLine("[GetLeaveRequests] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Lọc theo trạng thái nếu có
                var leaveRequests = db.XinNghi;
                if (!string.IsNullOrEmpty(status))
                {
                    leaveRequests = leaveRequests
                        .Where(x => x.ContainsKey("TrangThai") && x["TrangThai"]?.ToString() == status)
                        .ToList();
                }

                var result = leaveRequests
                    .OrderByDescending(x => {
                        var dateStr = x["NgayGui"]?.ToString();
                        return DateTime.TryParse(dateStr, out var dt) ? dt : DateTime.MinValue;
                    })
                    .Select(x => new
                    {
                        id = x["Id"]?.ToString(),
                        maNV = x["MaNV"]?.ToString(),
                        hoTen = x["HoTen"]?.ToString(),
                        lyDo = x["LyDo"]?.ToString(),
                        ngayBatDau = x["NgayBatDau"]?.ToString(),
                        ngayKetThuc = x["NgayKetThuc"]?.ToString(),
                        soNgay = x["SoNgay"],
                        trangThai = x["TrangThai"]?.ToString(),
                        ngayGui = x["NgayGui"]?.ToString(),
                        ghiChu = x["GhiChu"]?.ToString()
                    })
                    .ToList();

                Console.WriteLine($"[GetLeaveRequests] ✓ Tìm thấy {result.Count} đơn xin nghỉ");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetLeaveRequests] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // API duyệt/từ chối đơn xin nghỉ
        [HttpPost("approve-leave")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult ApproveLeave([FromBody] ApproveLeaveDto req)
        {
            try
            {
                Console.WriteLine($"[ApproveLeave] Duyệt đơn xin nghỉ ID: {req.Id}");

                var dataFile = "data.json";
                if (!System.IO.File.Exists(dataFile))
                {
                    Console.WriteLine("[ApproveLeave] ✗ File data.json không tìm thấy");
                    return NotFound(new { message = "Database chưa cấu hình." });
                }

                var jsonData = System.IO.File.ReadAllText(dataFile);
                var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

                if (db == null || db.XinNghi == null)
                {
                    Console.WriteLine("[ApproveLeave] ✗ Lỗi đọc dữ liệu");
                    return StatusCode(500, new { message = "Lỗi đọc dữ liệu." });
                }

                // Tìm đơn xin nghỉ
                var leaveRequest = db.XinNghi.FirstOrDefault(x => x["Id"]?.ToString() == req.Id);
                if (leaveRequest == null)
                {
                    Console.WriteLine($"[ApproveLeave] ✗ Đơn xin nghỉ ID {req.Id} không tìm thấy");
                    return BadRequest(new { message = "Đơn xin nghỉ không tìm thấy." });
                }

                // Cập nhật trạng thái
                leaveRequest["TrangThai"] = req.Approved ? "Da duyet" : "Tu choi";
                leaveRequest["GhiChu"] = req.GhiChu ?? "";

                var options = new JsonSerializerOptions { WriteIndented = true };
                var updatedJson = JsonSerializer.Serialize(db, options);
                System.IO.File.WriteAllText(dataFile, updatedJson);

                var status = req.Approved ? "Duyệt" : "Từ chối";
                Console.WriteLine($"[ApproveLeave] ✓ {status} thành công!");
                return Ok(new { message = $"{status} đơn xin nghỉ thành công!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ApproveLeave] ✗ Exception: {ex.Message}");
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }

    public class LeaveRequestDto
    {
        public string LyDo { get; set; }
        public string NgayBatDau { get; set; }
        public string NgayKetThuc { get; set; }
    }

    public class ApproveLeaveDto
    {
        public string Id { get; set; }
        public bool Approved { get; set; }
        public string GhiChu { get; set; }
    }
}
