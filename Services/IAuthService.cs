using HRManagement.Models;

namespace HRManagement.Services
{
    public interface IAuthService
    {
        LoginResponse Login(string email, string password);
    }
}
