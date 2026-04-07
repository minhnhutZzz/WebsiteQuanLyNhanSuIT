using HRManagement.Models;
using HRManagement.Services;
using Microsoft.AspNetCore.Mvc;

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
    }
}
