// EmployeeSalaryView Component - Xem Lương Cá Nhân (cho Nhân Viên)
import { apiFetch } from '../app.js';

export default {
    async render(container) {
        container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-surface-900 mb-2">Lương Của Tôi</h1>
                <p class="text-lg text-surface-600">Xem chi tiết lương và phiếu lương tháng này</p>
            </div>

            <div id="salary-content" class="bg-surface-50">
                <div class="text-center py-12">
                    <div class="inline-block">
                        <i class="fa-solid fa-spinner text-primary-500 text-4xl animate-spin"></i>
                    </div>
                    <p class="text-surface-600 mt-4">Đang tải dữ liệu lương...</p>
                </div>
            </div>
        `;

        try {
            console.log('[EmployeeSalaryView] Tải lương của nhân viên...');
            
            // Get current employee's MaNV from appState
            const maNv = window.appState.user?.MaNV || window.appState.user?.maNV;
            console.log('[EmployeeSalaryView] MaNV:', maNv);

            if (!maNv) {
                document.getElementById('salary-content').innerHTML = `
                    <div class="bg-white rounded-xl p-8 text-center">
                        <i class="fa-solid fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                        <p class="text-red-600 font-semibold">Không tìm thấy mã nhân viên</p>
                    </div>
                `;
                return;
            }

            // Load payroll data
            const response = await apiFetch('/api/hr/payroll');
            console.log('[EmployeeSalaryView] API response status:', response.status);

            if (!response.ok) {
                throw new Error('Failed to load payroll data');
            }

            const data = await response.json();
            const allPayroll = data.payroll || [];
            
            // Filter to current employee only
            const myPayroll = allPayroll.filter(p => p.MaNV === maNv);
            console.log('[EmployeeSalaryView] ✓ Found', myPayroll.length, 'salary records for', maNv);

            if (myPayroll.length === 0) {
                document.getElementById('salary-content').innerHTML = `
                    <div class="bg-white rounded-xl p-8 text-center">
                        <i class="fa-solid fa-inbox text-gray-300 text-4xl mb-4"></i>
                        <p class="text-surface-500 font-semibold">Chưa có lương được cấp</p>
                    </div>
                `;
                return;
            }

            // Sort by month (newest first)
            const sorted = myPayroll.sort((a, b) => {
                const aDate = new Date(a.NgayXuat);
                const bDate = new Date(b.NgayXuat);
                return bDate - aDate;
            });

            // Get latest salary
            const latestSalary = sorted[0];

            const formatCurrency = (value) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
            };

            // Render salary information
            let html = `
                <!-- Current Month Summary -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Income -->
                        <div class="bg-green-50 rounded-xl p-6">
                            <p class="text-sm text-green-600 font-semibold mb-2">THU NHẬP THÁNG ${latestSalary.Thang}</p>
                            <p class="text-3xl font-bold text-green-700">${formatCurrency(latestSalary.TongThuNhap)}</p>
                            <p class="text-xs text-green-600 mt-3">
                                <i class="fa-solid fa-check-circle"></i> Lương cơ bản: ${formatCurrency(latestSalary.LuongCoBan)}
                            </p>
                        </div>

                        <!-- Deduction -->
                        <div class="bg-red-50 rounded-xl p-6">
                            <p class="text-sm text-red-600 font-semibold mb-2">KHOẢN TRỪ</p>
                            <p class="text-3xl font-bold text-red-700">${formatCurrency(latestSalary.TongTruNhap)}</p>
                            <p class="text-xs text-red-600 mt-3">
                                <i class="fa-solid fa-receipt"></i> Bảo hiểm + Thuế
                            </p>
                        </div>

                        <!-- Net Income -->
                        <div class="bg-blue-50 rounded-xl p-6">
                            <p class="text-sm text-blue-600 font-semibold mb-2">LƯƠNG THỰC LĨNH</p>
                            <p class="text-3xl font-bold text-blue-700">${formatCurrency(latestSalary.ThuongThuc)}</p>
                            <p class="text-xs text-blue-600 mt-3">
                                <i class="fa-solid fa-hand-holding-usd"></i> Vào tài khoản
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Details -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                    <h2 class="text-2xl font-bold text-surface-900 mb-6">Chi Tiết Lương Tháng ${latestSalary.Thang}</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- Income Details -->
                        <div>
                            <h3 class="font-bold text-surface-900 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-arrow-trend-up text-green-600"></i> Chi Tiết Thu Nhập
                            </h3>
                            <div class="space-y-3">
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Lương Cơ Bản</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.LuongCoBan)}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Phụ Cấp</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.PhuCap)}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Thưởng</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.Thuong)}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Tiềm Năng</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.TiemNang)}</span>
                                </div>
                                <div class="flex justify-between bg-green-50 p-2 rounded mt-3">
                                    <span class="font-bold text-green-700">Tổng Thu Nhập</span>
                                    <span class="font-bold text-green-700">${formatCurrency(latestSalary.TongThuNhap)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Deduction Details -->
                        <div>
                            <h3 class="font-bold text-surface-900 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-arrow-trend-down text-red-600"></i> Chi Tiết Trừ
                            </h3>
                            <div class="space-y-3">
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Bảo Hiểm</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.BaoHiem)}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Thuế Thu Nhập</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.ThueThuNhap)}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-100 pb-2">
                                    <span class="text-surface-600">Các Khoản Trừ Khác</span>
                                    <span class="font-semibold text-surface-900">${formatCurrency(latestSalary.CacKhoanTru)}</span>
                                </div>
                                <div class="flex justify-between bg-red-50 p-2 rounded mt-3">
                                    <span class="font-bold text-red-700">Tổng Trừ</span>
                                    <span class="font-bold text-red-700">${formatCurrency(latestSalary.TongTruNhap)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Status & Dates -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                    <h3 class="font-bold text-surface-900 mb-4">Thông Tin Thanh Toán</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Trạng Thái</p>
                            <span class="inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                latestSalary.TrangThai === 'Da thanh toan'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }">${latestSalary.TrangThai === 'Da thanh toan' ? '✓ Đã Thanh Toán' : '⏳ Chờ Thanh Toán'}</span>
                        </div>
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Ngày Xuất Phiếu</p>
                            <p class="font-semibold text-surface-900">${new Date(latestSalary.NgayXuat).toLocaleDateString('vi-VN')}</p>
                        </div>
                        ${latestSalary.NgayThanhToan ? `
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Ngày Thanh Toán</p>
                            <p class="font-semibold text-surface-900">${new Date(latestSalary.NgayThanhToan).toLocaleDateString('vi-VN')}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Salary History -->
                ${sorted.length > 1 ? `
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 class="font-bold text-surface-900 mb-4">Lịch Sử Lương</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="text-left px-4 py-3 text-surface-600 font-semibold">Tháng</th>
                                    <th class="text-right px-4 py-3 text-surface-600 font-semibold">Thu Nhập</th>
                                    <th class="text-right px-4 py-3 text-surface-600 font-semibold">Trừ</th>
                                    <th class="text-right px-4 py-3 text-surface-600 font-semibold">Thực Lĩnh</th>
                                    <th class="text-center px-4 py-3 text-surface-600 font-semibold">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sorted.slice(1, 13).map(salary => `
                                <tr class="border-b border-gray-100 hover:bg-surface-50">
                                    <td class="px-4 py-3">${salary.Thang}</td>
                                    <td class="text-right px-4 py-3 font-semibold text-green-600">${formatCurrency(salary.TongThuNhap)}</td>
                                    <td class="text-right px-4 py-3 font-semibold text-red-600">${formatCurrency(salary.TongTruNhap)}</td>
                                    <td class="text-right px-4 py-3 font-bold text-blue-600">${formatCurrency(salary.ThuongThuc)}</td>
                                    <td class="text-center px-4 py-3">
                                        <span class="text-xs font-semibold ${
                                            salary.TrangThai === 'Da thanh toan'
                                                ? 'text-green-600'
                                                : 'text-yellow-600'
                                        }">
                                            ${salary.TrangThai === 'Da thanh toan' ? '✓' : '⏳'}
                                        </span>
                                    </td>
                                </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}
            `;

            document.getElementById('salary-content').innerHTML = html;

        } catch (error) {
            console.error('[EmployeeSalaryView] ✗ Exception:', error);
            document.getElementById('salary-content').innerHTML = `
                <div class="bg-white rounded-xl p-8 text-center">
                    <i class="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
                    <p class="text-red-600 font-semibold">Lỗi tải dữ liệu</p>
                    <p class="text-surface-500 text-sm mt-2">${error.message}</p>
                </div>
            `;
        }
    }
};
