using HRManagement.Models;

namespace HRManagement.Services
{
    public interface INhiemVuService
    {
        Task<string> PhanCong(PhanCongRequest req);
    }
}
