using HRManagement.Models;

namespace HRManagement.Services
{
    public interface ILuongService
    {
        BangLuong LapBangLuong(LapBangLuongRequest request);
        bool ChiTraLuong(string maBangLuong);
        List<BangLuong> TraCuuLuong(string maNv);
    }
}
