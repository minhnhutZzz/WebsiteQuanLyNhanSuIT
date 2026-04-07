using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using HRManagement.Models;
using Microsoft.IdentityModel.Tokens;

namespace HRManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly string _dataFile = "data.json";

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public LoginResponse Login(string email, string password)
        {
            if (!File.Exists(_dataFile))
                return new LoginResponse { Message = "Lỗi hệ thống: Không tìm thấy Database." };

            var jsonData = File.ReadAllText(_dataFile);
            var db = JsonSerializer.Deserialize<DatabaseData>(jsonData);

            if (db == null || db.NhanViens == null)
                return new LoginResponse { Message = "Lỗi đọc dữ liệu." };

            var user = db.NhanViens.FirstOrDefault(u => u.Email == email && u.Password == password);
            if (user == null)
                return new LoginResponse { Message = "Sai email hoặc mật khẩu." };

            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                Token = token,
                User = user,
                Message = "Đăng nhập thành công"
            };
        }

        private string GenerateJwtToken(NhanVien user)
        {
            var key = Encoding.ASCII.GetBytes("Super_Secret_Key_For_Demo_Purpose_123!");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("MaNV", user.MaNV),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenString = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
            return tokenString;
        }
    }
}
