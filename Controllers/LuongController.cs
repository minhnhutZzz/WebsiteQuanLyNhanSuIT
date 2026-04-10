using HRManagement.Models;
using HRManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LuongController : ControllerBase
    {
        private readonly ILuongService _luongService;

        public LuongController(ILuongService luongService)
        {
            _luongService = luongService;
        }

        [HttpPost("lap-bang")]
        [Authorize(Roles = "KeToan")]
        public IActionResult LapBangLuong([FromBody] LapBangLuongRequest request)
        {
            try
            {
                var result = _luongService.LapBangLuong(request);
                return Ok(new { Message = "Lập bảng lương thành công", Data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("chi-tra/{maBangLuong}")]
        [Authorize(Roles = "KeToan")]
        public IActionResult ChiTraLuong(string maBangLuong)
        {
            var success = _luongService.ChiTraLuong(maBangLuong);
            if (success)
            {
                return Ok(new { Message = "Chi trả lương thành công." });
            }
            return BadRequest(new { Message = "Mã bảng lương không hợp lệ hoặc đã được thanh toán." });
        }

        [HttpGet("tra-cuu/{maNv}")]
        [Authorize]
        public IActionResult TraCuuLuong(string maNv)
        {
            var userMaNv = User.FindFirst("MaNV")?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Kiểm tra phân quyền: Chỉ Kế toán xem tất cả, nhân viên chỉ xem của mình
            if (userRole != "KeToan" && userMaNv != maNv)
            {
                return Forbid();
            }

            var bangLuongs = _luongService.TraCuuLuong(maNv);
            return Ok(new { Data = bangLuongs });
        }
    }
}
