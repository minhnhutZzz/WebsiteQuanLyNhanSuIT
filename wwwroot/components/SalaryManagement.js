// SalaryManagement Component - Quản lý Lương (cho Kế Toán)
import { apiFetch, showToast } from '../app.js';

export default class SalaryManagement {
    static payrollData = [];
    static nhanVienData = [];
    static currentMonth = '04/2026';
    static currentFilter = 'all';
    static selectedPayroll = null;
    
    static async loadData() {
        try {
            console.log('[SalaryManagement.loadData] Bắt đầu tải dữ liệu lương...');
            
            // Load from window.appData if available
            if (window.appData?.BangLuongs && window.appData.BangLuongs.length > 0) {
                this.payrollData = window.appData.BangLuongs;
                this.nhanVienData = window.appData.NhanViens;
                console.log('[SalaryManagement.loadData] ✓ Loaded from appData:', this.payrollData.length, 'records');
                return;
            }
            
            console.log('[SalaryManagement.loadData] appData không có, call API...');
            
            // Try to load from API
            const response = await apiFetch('/api/hr/payroll');
            console.log('[SalaryManagement.loadData] API response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                this.payrollData = data.payroll || [];
                this.nhanVienData = data.employees || [];
                window.appData = data;
                console.log('[SalaryManagement.loadData] ✓ Loaded from API:', this.payrollData.length, 'payroll records');
            } else {
                const errorText = await response.text();
                console.error('[SalaryManagement.loadData] ✗ API error (status ' + response.status + '):', errorText);
            }
        } catch (e) {
            console.error('[SalaryManagement.loadData] ✗ Exception:', e.message);
            console.error(e.stack);
        }
    }
    
    static calculateStats(month = null, filter = 'all') {
        let filteredData = this.payrollData;
        if (month) {
            filteredData = filteredData.filter(p => p.Thang === month);
        }
        if (filter !== 'all') {
            filteredData = filteredData.filter(p => {
                const status = p.TrangThai.toLowerCase().replace(/\s+/g, '');
                const filterNorm = filter.toLowerCase().replace(/\s+/g, '');
                return status === filterNorm;
            });
        }
        
        const stats = {
            totalIncome: filteredData.reduce((sum, p) => sum + (p.TongThuNhap || 0), 0),
            totalDeduction: filteredData.reduce((sum, p) => sum + (p.TongTruNhap || 0), 0),
            totalPaid: filteredData.reduce((sum, p) => sum + (p.ThuongThuc || 0), 0),
            employeeCount: filteredData.length,
            paidCount: filteredData.filter(p => p.TrangThai === 'Da thanh toan').length,
            pendingCount: filteredData.filter(p => p.TrangThai === 'Cho thanh toan').length,
            filteredData
        };
        return stats;
    }
    
    static formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }
    
    static showDetailModal(payrollId) {
        const payroll = this.payrollData.find(p => p.id === payrollId);
        if (!payroll) {
            showToast('Không tìm thấy bản ghi lương', 'error');
            return;
        }
        
        this.selectedPayroll = payroll;
        this.renderDetailModal();
    }
    
    static renderDetailModal() {
        const modal = document.getElementById('modal-root');
        const payroll = this.selectedPayroll;
        
        const modalContent = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-in">
                <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6">
                    <h2 class="text-2xl font-bold text-white">Chi Tiết Lương - ${payroll.HoTen}</h2>
                    <p class="text-primary-100 text-sm mt-1">Mã NV: ${payroll.MaNV} | Tháng: ${payroll.Thang}</p>
                </div>
                
                <div class="p-8 max-h-96 overflow-y-auto">
                    <!-- Income Section -->
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-arrow-up text-green-600"></i> Thu Nhập
                        </h3>
                        <div class="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                            <div>
                                <p class="text-sm text-surface-600">Lương Cơ Bản</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.LuongCoBan)}</p>
                            </div>
                            <div>
                                <p class="text-sm text-surface-600">Phụ Cấp</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.PhuCap)}</p>
                            </div>
                            <div>
                                <p class="text-sm text-surface-600">Thưởng</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.Thuong)}</p>
                            </div>
                            <div>
                                <p class="text-sm text-surface-600">Tiềm Năng</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.TiemNang)}</p>
                            </div>
                            <div class="col-span-2 border-t border-green-200 pt-3 mt-2">
                                <p class="text-sm text-surface-600">Tổng Thu Nhập</p>
                                <p class="text-2xl font-bold text-green-700">${this.formatCurrency(payroll.TongThuNhap)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Deduction Section -->
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-arrow-down text-red-600"></i> Trừ
                        </h3>
                        <div class="grid grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg">
                            <div>
                                <p class="text-sm text-surface-600">Bảo Hiểm</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.BaoHiem)}</p>
                            </div>
                            <div>
                                <p class="text-sm text-surface-600">Thuế Thu Nhập</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.ThueThuNhap)}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-sm text-surface-600">Các Khoản Trừ Khác</p>
                                <p class="text-lg font-bold text-surface-900">${this.formatCurrency(payroll.CacKhoanTru)}</p>
                            </div>
                            <div class="col-span-2 border-t border-red-200 pt-3 mt-2">
                                <p class="text-sm text-surface-600">Tổng Trừ</p>
                                <p class="text-2xl font-bold text-red-700">${this.formatCurrency(payroll.TongTruNhap)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Net Income -->
                    <div class="bg-blue-50 p-4 rounded-lg mb-6">
                        <p class="text-sm text-surface-600">Lương Thực Lĩnh</p>
                        <p class="text-3xl font-bold text-blue-700">${this.formatCurrency(payroll.ThuongThuc)}</p>
                    </div>
                    
                    <!-- Status & Timeline -->
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Trạng Thái</p>
                            <span class="inline-block px-3 py-2 rounded-full text-sm font-semibold ${
                                payroll.TrangThai === 'Da thanh toan' 
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }">${payroll.TrangThai}</span>
                        </div>
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Ngày Xuất</p>
                            <p class="font-semibold text-surface-900">${new Date(payroll.NgayXuat).toLocaleDateString('vi-VN')}</p>
                        </div>
                        ${payroll.NgayThanhToan ? `
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Ngày Thanh Toán</p>
                            <p class="font-semibold text-surface-900">${new Date(payroll.NgayThanhToan).toLocaleDateString('vi-VN')}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="bg-surface-50 px-8 py-4 flex gap-3 justify-end">
                    <button class="btn-secondary" onclick="document.getElementById('modal-root').classList.add('hidden')">Đóng</button>
                    <button class="btn-primary flex items-center gap-2" onclick="SalaryManagement.exportPayslip('${payroll.id}')">
                        <i class="fa-solid fa-download"></i> Tải Phiếu Lương
                    </button>
                </div>
            </div>
        `;
        modal.innerHTML = modalContent;
        modal.classList.remove('hidden');
    }
    
    static exportPayslip(payrollId) {
        const payroll = this.payrollData.find(p => p.id === payrollId);
        if (!payroll) return;
        
        let content = `
PHIẾU LƯƠNG THÁNG ${payroll.Thang}
=====================================

Nhân Viên: ${payroll.HoTen}
Mã NV: ${payroll.MaNV}
Ngày Xuất: ${new Date(payroll.NgayXuat).toLocaleDateString('vi-VN')}

THU NHẬP:
---------
Lương Cơ Bản:     ${this.formatCurrency(payroll.LuongCoBan)}
Phụ Cấp:          ${this.formatCurrency(payroll.PhuCap)}
Thưởng:           ${this.formatCurrency(payroll.Thuong)}
Tiềm Năng:        ${this.formatCurrency(payroll.TiemNang)}
TỔNG THU NHẬP:    ${this.formatCurrency(payroll.TongThuNhap)}

TRỪ:
----
Bảo Hiểm:         ${this.formatCurrency(payroll.BaoHiem)}
Thuế Thu Nhập:    ${this.formatCurrency(payroll.ThueThuNhap)}
Các Khoản Trừ:    ${this.formatCurrency(payroll.CacKhoanTru)}
TỔNG TRỪ:         ${this.formatCurrency(payroll.TongTruNhap)}

LƯƠNG THỰC LĨNH:  ${this.formatCurrency(payroll.ThuongThuc)}

Trạng Thái: ${payroll.TrangThai}
${payroll.NgayThanhToan ? `Ngày Thanh Toán: ${new Date(payroll.NgayThanhToan).toLocaleDateString('vi-VN')}` : 'Chưa Thanh Toán'}
        `;
        
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', `Phieu_Luong_${payroll.MaNV}_${payroll.Thang.replace('/', '_')}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast('Tải xuống phiếu lương thành công', 'success');
    }
    
    static async render(container) {
        await this.loadData();
        
        const stats = this.calculateStats(this.currentMonth, this.currentFilter);
        const months = [...new Set(this.payrollData.map(p => p.Thang))].sort().reverse();
        
        let tableRows = '';
        if (stats.filteredData.length > 0) {
            tableRows = stats.filteredData.map((payroll) => `
                <tr class="border-b border-gray-100 hover:bg-surface-50 transition">
                    <td class="px-6 py-4 text-surface-900 font-medium">${payroll.MaNV}</td>
                    <td class="px-6 py-4 text-surface-900 font-medium">${payroll.HoTen}</td>
                    <td class="px-6 py-4 text-right text-surface-900 font-semibold text-green-600">${this.formatCurrency(payroll.TongThuNhap)}</td>
                    <td class="px-6 py-4 text-right text-surface-900 font-semibold text-red-600">${this.formatCurrency(payroll.TongTruNhap)}</td>
                    <td class="px-6 py-4 text-right text-surface-900 font-bold text-blue-600">${this.formatCurrency(payroll.ThuongThuc)}</td>
                    <td class="px-6 py-4 text-center">
                        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            payroll.TrangThai === 'Da thanh toan' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                        }">${payroll.TrangThai}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="SalaryManagement.showDetailModal('${payroll.id}')" class="text-primary-500 hover:text-primary-700 font-semibold text-sm">Chi Tiết</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tableRows = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-surface-500">
                        <i class="fa-solid fa-inbox text-3xl mb-2 block opacity-30"></i>
                        Không có dữ liệu lương cho khoảng này
                    </td>
                </tr>
            `;
        }
        
        container.innerHTML = `
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-surface-900 mb-2">Quản Lý Lương & Bảng Lương</h1>
                <p class="text-lg text-surface-600">Quản lý toàn bộ hóa đơn lương, thanh toán và báo cáo tài chính</p>
            </div>

            <!-- Quick Actions -->
            <div class="mb-6 flex gap-3">
                <button onclick="window.navigate('payroll-processing')" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition flex items-center gap-2 shadow-lg">
                    <i class="fa-solid fa-credit-card"></i> Xử Lý Thanh Toán Lương
                </button>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-surface-600 mb-2">Tháng</label>
                        <select id="month-select" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            ${months.map(m => `<option value="${m}" ${m === this.currentMonth ? 'selected' : ''}>${m}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-surface-600 mb-2">Trạng Thái</label>
                        <select id="status-select" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                            <option value="all">Tất Cả</option>
                            <option value="Da thanh toan">Đã Thanh Toán</option>
                            <option value="Cho thanh toan">Chờ Thanh Toán</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button id="export-btn" class="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-download"></i> Xuất báo cáo
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-surface-600 font-medium">Tổng Thu Nhập</p>
                        <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <i class="fa-solid fa-arrow-up text-green-600 text-lg"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900">${this.formatCurrency(stats.totalIncome)}</h3>
                    <p class="text-xs text-surface-500 mt-2">${stats.employeeCount} nhân viên</p>
                </div>

                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-surface-600 font-medium">Tổng Trừ</p>
                        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <i class="fa-solid fa-arrow-down text-red-600 text-lg"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900">${this.formatCurrency(stats.totalDeduction)}</h3>
                    <p class="text-xs text-surface-500 mt-2">Bảo hiểm, thuế, v.v.</p>
                </div>

                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-surface-600 font-medium">Thanh Toán Được</p>
                        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i class="fa-solid fa-wallet text-blue-600 text-lg"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900">${this.formatCurrency(stats.totalPaid)}</h3>
                    <p class="text-xs text-surface-500 mt-2">Lương thực lĩnh</p>
                </div>

                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-surface-600 font-medium">Trạng Thái Thanh Toán</p>
                        <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <i class="fa-solid fa-hourglass-end text-yellow-600 text-lg"></i>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold text-surface-900">${stats.paidCount} / ${stats.employeeCount}</h3>
                    <p class="text-xs text-surface-500 mt-2">${stats.pendingCount} đang chờ</p>
                </div>
            </div>

            <!-- Payroll Table -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-6 border-b border-gray-100">
                    <h2 class="text-xl font-bold text-surface-900">Bảng chi tiết lương tháng ${this.currentMonth}</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-surface-50 border-b border-gray-100">
                            <tr>
                                <th class="px-6 py-4 text-left font-semibold text-surface-700">Mã NV</th>
                                <th class="px-6 py-4 text-left font-semibold text-surface-700">Nhân Viên</th>
                                <th class="px-6 py-4 text-right font-semibold text-surface-700">Thu Nhập</th>
                                <th class="px-6 py-4 text-right font-semibold text-surface-700">Trừ</th>
                                <th class="px-6 py-4 text-right font-semibold text-surface-700">Thực Lĩnh</th>
                                <th class="px-6 py-4 text-center font-semibold text-surface-700">Trạng Thái</th>
                                <th class="px-6 py-4 text-center font-semibold text-surface-700">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Attach event listeners
        setTimeout(() => {
            const monthSelect = document.getElementById('month-select');
            const statusSelect = document.getElementById('status-select');
            const exportBtn = document.getElementById('export-btn');
            
            if (monthSelect) {
                monthSelect.addEventListener('change', (e) => {
                    this.currentMonth = e.target.value;
                    this.render(container);
                });
            }
            
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.currentFilter = e.target.value;
                    this.render(container);
                });
            }
            
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportReport();
                });
            }
        }, 0);
    }
    
    static exportReport() {
        const stats = this.calculateStats(this.currentMonth, this.currentFilter);
        let content = `BÁO CÁO BẢNG LƯƠNG ${this.currentMonth}
=====================================
Trạng Thái: ${this.currentFilter === 'all' ? 'Tất Cả' : this.currentFilter}
Ngày Xuất: ${new Date().toLocaleDateString('vi-VN')}

THỐNG KÊ TỔNG HỢP:
------------------
Số Nhân Viên: ${stats.employeeCount}
Tổng Thu Nhập: ${this.formatCurrency(stats.totalIncome)}
Tổng Trừ: ${this.formatCurrency(stats.totalDeduction)}
Tổng Thanh Toán: ${this.formatCurrency(stats.totalPaid)}
Đã Thanh Toán: ${stats.paidCount}
Chờ Thanh Toán: ${stats.pendingCount}

CHI TIẾT:
---------
${stats.filteredData.map(p => `${p.MaNV} | ${p.HoTen} | ${this.formatCurrency(p.ThuongThuc)} | ${p.TrangThai}`).join('\n')}
        `;
        
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', `BaoCao_BangLuong_${this.currentMonth.replace('/', '_')}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast('Xuất báo cáo thành công', 'success');
    }
}
