// PayrollProcessing Component - Xử lý Thanh Toán Lương
import { apiFetch, showToast } from '../app.js';

export default class PayrollProcessing {
    static payrollData = [];
    static selectedPayrolls = [];
    static currentStep = 'selection'; // selection -> review -> approval -> processing -> confirm
    static selectedMonth = '04/2026';
    static processingState = {
        totalAmount: 0,
        employeeCount: 0,
        transactionId: '',
        startTime: null,
        endTime: null
    };
    
    static async loadData() {
        try {
            console.log('PayrollProcessing: Loading data...');
            // Try to load from window.appData first
            if (window.appData?.BangLuongs && window.appData.BangLuongs.length > 0) {
                this.payrollData = window.appData.BangLuongs.filter(p => p.TrangThai === 'Cho thanh toan');
                console.log('PayrollProcessing: Loaded from appData -', this.payrollData.length, 'pending records');
                return;
            }
            
            // Try to load from API
            console.log('PayrollProcessing: Trying to load from API...');
            const response = await apiFetch('/api/hr/payroll');
            if (response.ok) {
                const data = await response.json();
                console.log('PayrollProcessing: API response -', data);
                window.appData = data;
                this.payrollData = (data.payroll || []).filter(p => p.TrangThai === 'Cho thanh toan');
                console.log('PayrollProcessing: Loaded from API -', this.payrollData.length, 'pending records');
                return;
            } else {
                console.error('PayrollProcessing: API error -', response.status);
                throw new Error('API returned ' + response.status);
            }
        } catch (e) {
            console.error('PayrollProcessing: Error loading data -', e);
            // If no pending payroll found, show all payroll
            if (window.appData?.BangLuongs) {
                this.payrollData = window.appData.BangLuongs.filter(p => p.TrangThai === 'Cho thanh toan');
                if (this.payrollData.length === 0) {
                    this.payrollData = window.appData.BangLuongs;
                }
            }
        }
    }
    
    static formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }
    
    static togglePayrollSelection(payrollId) {
        const index = this.selectedPayrolls.findIndex(p => p.id === payrollId);
        const payroll = this.payrollData.find(p => p.id === payrollId);
        
        if (index > -1) {
            this.selectedPayrolls.splice(index, 1);
        } else {
            this.selectedPayrolls.push(payroll);
        }
        
        this.renderSelectionStep();
    }
    
    static selectAll() {
        const filteredPayrolls = this.getFilteredPayrolls();
        this.selectedPayrolls = [...filteredPayrolls];
        this.renderSelectionStep();
    }
    
    static deselectAll() {
        this.selectedPayrolls = [];
        this.renderSelectionStep();
    }
    
    static getFilteredPayrolls() {
        return this.payrollData.filter(p => p.Thang === this.selectedMonth);
    }
    
    static calculateTotals() {
        return {
            totalAmount: this.selectedPayrolls.reduce((sum, p) => sum + (p.ThuongThuc || 0), 0),
            employeeCount: this.selectedPayrolls.length,
            totalDeductions: this.selectedPayrolls.reduce((sum, p) => sum + (p.TongTruNhap || 0), 0),
        };
    }
    
    static goToReview() {
        if (this.selectedPayrolls.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 bản ghi lương', 'error');
            return;
        }
        this.currentStep = 'review';
        this.renderReviewStep();
    }
    
    static goToApproval() {
        this.currentStep = 'approval';
        this.renderApprovalStep();
    }
    
    static goToProcessing() {
        this.currentStep = 'processing';
        this.renderProcessingStep();
    }
    
    static goBack() {
        if (this.currentStep === 'approval') {
            this.currentStep = 'review';
            this.renderReviewStep();
        } else if (this.currentStep === 'processing') {
            this.currentStep = 'approval';
            this.renderApprovalStep();
        } else if (this.currentStep === 'confirm') {
            this.selectedPayrolls = [];
            this.selectedMonth = '04/2026';
            this.currentStep = 'selection';
            this.renderSelectionStep();
        }
    }
    
    static async processPayment() {
        this.processingState.transactionId = 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
        this.processingState.startTime = new Date();
        this.processingState.totalAmount = this.calculateTotals().totalAmount;
        this.processingState.employeeCount = this.selectedPayrolls.length;
        
        // Simulate multi-step payment processing
        const steps = [
            { name: 'Xác thực dữ liệu', duration: 1000 },
            { name: 'Kiểm tra tài khoản ngân hàng', duration: 1500 },
            { name: 'Kiểm tra biểu tượng thanh toán', duration: 1200 },
            { name: 'Xử lý giao dịch', duration: 2500 },
            { name: 'Cập nhật bảng lương', duration: 1800 },
            { name: 'Gửi thông báo', duration: 1000 },
        ];
        
        let currentStep = 0;
        const processStep = async () => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                await new Promise(resolve => setTimeout(resolve, step.duration));
                currentStep++;
                
                // Update UI
                const progressBar = document.getElementById('processing-progress');
                const progressText = document.getElementById('progress-percent');
                const stepsList = document.getElementById('steps-list');
                
                const percentage = Math.round((currentStep / steps.length) * 100);
                if (progressBar) {
                    progressBar.style.width = percentage + '%';
                }
                if (progressText) {
                    progressText.textContent = percentage + '%';
                }
                if (stepsList) {
                    const items = stepsList.querySelectorAll('.step-item');
                    items.forEach((item, idx) => {
                        item.classList.remove('completed', 'active');
                        const iconDiv = item.querySelector('div:first-child');
                        const fa = iconDiv?.querySelector('i');
                        
                        if (idx < currentStep) {
                            item.classList.add('completed');
                            item.style.backgroundColor = '#d3f9d8';
                            if (iconDiv) {
                                iconDiv.style.backgroundColor = '#2b8a3e';
                                iconDiv.style.color = 'white';
                            }
                            if (fa) {
                                fa.className = 'fa-solid fa-check text-xs';
                                fa.style.color = 'white';
                            }
                        } else if (idx === currentStep) {
                            item.classList.add('active');
                            item.style.backgroundColor = '#e7f5ff';
                            item.style.boxShadow = '0 0 0 2px #4c6ef5';
                            if (iconDiv) {
                                iconDiv.style.backgroundColor = '#4c6ef5';
                                iconDiv.style.color = 'white';
                            }
                            if (fa) {
                                fa.className = 'fa-solid fa-spinner fa-spin text-xs';
                                fa.style.color = 'white';
                            }
                        } else {
                            item.style.backgroundColor = '';
                            item.style.boxShadow = '';
                            if (iconDiv) {
                                iconDiv.style.backgroundColor = '';
                                iconDiv.style.color = '';
                            }
                            if (fa) {
                                fa.className = 'fa-solid fa-circle text-xs text-gray-600';
                                fa.style.color = '';
                            }
                        }
                    });
                }
                
                processStep();
            } else {
                this.processingState.endTime = new Date();
                this.currentStep = 'confirm';
                this.renderConfirmStep();
            }
        };
        
        processStep();
    }
    
    static async finishProcessing() {
        try {
            // Update payroll records status in memory
            this.selectedPayrolls.forEach(payroll => {
                payroll.TrangThai = 'Da thanh toan';
                payroll.NgayThanhToan = new Date().toISOString().split('T')[0];
            });
            
            // Persist to server/database using API
            const payrollIds = this.selectedPayrolls.map(p => p.id);
            const response = await apiFetch('/api/hr/payroll/confirm', {
                method: 'POST',
                body: JSON.stringify({ payrollIds, date: new Date().toISOString().split('T')[0] })
            });
            
            if (!response.ok) {
                console.error('Failed to update payroll status on server', response.status);
                // Still proceed with UI update even if API fails
            }
            
            showToast('Thanh toán lương thành công!', 'success');
            
            // Reset state
            this.selectedPayrolls = [];
            this.selectedMonth = '04/2026';
            this.currentStep = 'selection';
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.render(document.getElementById('page-content'));
        } catch (e) {
            console.error('Error in finishProcessing:', e);
            showToast('Lỗi khi hoàn tất thanh toán', 'error');
        }
    }
    
    static renderSelectionStep() {
        const container = document.getElementById('payroll-processing-container');
        if (!container) return;
        
        const filteredPayrolls = this.getFilteredPayrolls();
        const totals = this.calculateTotals();
        const months = [...new Set(this.payrollData.map(p => p.Thang))].sort().reverse();
        
        let payrollRows = '';
        if (filteredPayrolls.length > 0) {
            payrollRows = filteredPayrolls.map(payroll => {
                const isSelected = this.selectedPayrolls.find(p => p.id === payroll.id);
                return `
                    <tr class="border-b border-gray-100 hover:bg-surface-50 transition">
                        <td class="px-6 py-4 text-center">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} 
                                   onchange="PayrollProcessing.togglePayrollSelection('${payroll.id}')"
                                   class="w-4 h-4 cursor-pointer">
                        </td>
                        <td class="px-6 py-4 text-surface-900 font-medium">${payroll.MaNV}</td>
                        <td class="px-6 py-4 text-surface-900 font-medium">${payroll.HoTen}</td>
                        <td class="px-6 py-4 text-right text-surface-900 font-semibold">${this.formatCurrency(payroll.TongThuNhap)}</td>
                        <td class="px-6 py-4 text-right text-surface-900 font-semibold text-red-600">${this.formatCurrency(payroll.TongTruNhap)}</td>
                        <td class="px-6 py-4 text-right text-surface-900 font-bold text-blue-600">${this.formatCurrency(payroll.ThuongThuc)}</td>
                    </tr>
                `;
            }).join('');
        } else {
            payrollRows = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-surface-500">
                        <i class="fa-solid fa-inbox text-3xl mb-2 block opacity-30"></i>
                        Không có bản ghi lương chờ thanh toán
                    </td>
                </tr>
            `;
        }
        
        container.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-surface-900 mb-2">Xử Lý Thanh Toán Lương</h1>
                    <p class="text-lg text-surface-600">Quy trình thanh toán lương theo từng tháng</p>
                </div>
                
                <!-- Step Indicator -->
                <div class="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">1</div>
                            <div>
                                <p class="font-semibold text-surface-900">Chọn Lương</p>
                                <p class="text-sm text-surface-600">Hiện tại</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">2</div>
                            <div>
                                <p class="font-semibold text-surface-900">Xem Lại</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</div>
                            <div>
                                <p class="font-semibold text-surface-900">Duyệt</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">4</div>
                            <div>
                                <p class="font-semibold text-surface-900">Thanh Toán</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Filter -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <label class="block text-sm font-semibold text-surface-600 mb-2">Chọn Tháng</label>
                    <select id="month-filter" class="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                        ${months.map(m => `<option value="${m}" ${m === this.selectedMonth ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>
                
                <!-- Selection Summary -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p class="text-sm text-surface-600 mb-1">Sẵn Có</p>
                        <p class="text-3xl font-bold text-surface-900">${filteredPayrolls.length}</p>
                        <p class="text-xs text-surface-500 mt-2">bản ghi chờ thanh toán</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p class="text-sm text-surface-600 mb-1">Đã Chọn</p>
                        <p class="text-3xl font-bold text-primary-500">${this.selectedPayrolls.length}</p>
                        <p class="text-xs text-surface-500 mt-2">bản ghi được lựa chọn</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p class="text-sm text-surface-600 mb-1">Tổng Tiền</p>
                        <p class="text-2xl font-bold text-green-600">${this.formatCurrency(totals.totalAmount)}</p>
                        <p class="text-xs text-surface-500 mt-2">cần thanh toán</p>
                    </div>
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p class="text-sm text-surface-600 mb-1">Tổng Trừ</p>
                        <p class="text-2xl font-bold text-red-600">${this.formatCurrency(totals.totalDeductions)}</p>
                        <p class="text-xs text-surface-500 mt-2">bảo hiểm &amp; thuế</p>
                    </div>
                </div>
                
                <!-- Payroll Table -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div class="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 class="text-xl font-bold text-surface-900">Danh Sách Bản Ghi Lương (${this.selectedMonth})</h2>
                        <div class="flex gap-2">
                            <button onclick="PayrollProcessing.selectAll()" class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition">
                                <i class="fa-solid fa-check-double mr-2"></i>Chọn Tất Cả
                            </button>
                            <button onclick="PayrollProcessing.deselectAll()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition">
                                <i class="fa-solid fa-xmark mr-2"></i>Bỏ Chọn
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-surface-50 border-b border-gray-100">
                                <tr>
                                    <th class="px-6 py-4 text-center font-semibold text-surface-700">
                                        <input type="checkbox" class="w-4 h-4">
                                    </th>
                                    <th class="px-6 py-4 text-left font-semibold text-surface-700">Mã NV</th>
                                    <th class="px-6 py-4 text-left font-semibold text-surface-700">Nhân Viên</th>
                                    <th class="px-6 py-4 text-right font-semibold text-surface-700">Thu Nhập</th>
                                    <th class="px-6 py-4 text-right font-semibold text-surface-700">Trừ</th>
                                    <th class="px-6 py-4 text-right font-semibold text-surface-700">Thực Lĩnh</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payrollRows}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3 justify-end">
                    <button onclick="window.navigate('dashboard')" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                        <i class="fa-solid fa-times mr-2"></i>Hủy
                    </button>
                    <button onclick="PayrollProcessing.goToReview()" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition flex items-center gap-2">
                        Tiếp Tục
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Setup month filter
        setTimeout(() => {
            const monthFilter = document.getElementById('month-filter');
            if (monthFilter) {
                monthFilter.addEventListener('change', (e) => {
                    this.selectedMonth = e.target.value;
                    this.selectedPayrolls = [];
                    this.renderSelectionStep();
                });
            }
        }, 0);
    }
    
    static renderReviewStep() {
        const container = document.getElementById('payroll-processing-container');
        if (!container) return;
        
        const totals = this.calculateTotals();
        
        let payrollDetails = this.selectedPayrolls.map(payroll => `
            <div class="bg-surface-50 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-semibold text-surface-900">${payroll.HoTen}</p>
                        <p class="text-sm text-surface-600">Mã: ${payroll.MaNV} | Tháng: ${payroll.Thang}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-green-600">${this.formatCurrency(payroll.ThuongThuc)}</p>
                        <p class="text-xs text-surface-500">Lương thực lĩnh</p>
                    </div>
                </div>
                <div class="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-gray-200 pt-3">
                    <div>
                        <p class="text-surface-600">Thu Nhập</p>
                        <p class="font-semibold text-surface-900">${this.formatCurrency(payroll.TongThuNhap)}</p>
                    </div>
                    <div>
                        <p class="text-surface-600">Trừ</p>
                        <p class="font-semibold text-red-600">${this.formatCurrency(payroll.TongTruNhap)}</p>
                    </div>
                    <div>
                        <p class="text-surface-600">Ngày Xuất</p>
                        <p class="font-semibold text-surface-900">${new Date(payroll.NgayXuat).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-surface-900 mb-2">Xem Lại Thanh Toán Lương</h1>
                    <p class="text-lg text-surface-600">Kiểm tra chi tiết trước khi thực hiện thanh toán</p>
                </div>
                
                <!-- Step Indicator -->
                <div class="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 opacity-50">
                            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Chọn Lương</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">2</div>
                            <div>
                                <p class="font-semibold text-surface-900">Xem Lại</p>
                                <p class="text-sm text-primary-600">Hiện tại</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">3</div>
                            <div>
                                <p class="font-semibold text-surface-900">Duyệt</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">4</div>
                            <div>
                                <p class="font-semibold text-surface-900">Thanh Toán</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Summary Card -->
                <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-6 border border-blue-200">
                    <div class="grid grid-cols-4 gap-6">
                        <div>
                            <p class="text-sm text-blue-600 mb-1">Số Nhân Viên</p>
                            <p class="text-3xl font-bold text-blue-900">${totals.employeeCount}</p>
                        </div>
                        <div>
                            <p class="text-sm text-blue-600 mb-1">Tổng Thu Nhập</p>
                            <p class="text-lg font-bold text-blue-900">${this.formatCurrency(totals.totalAmount + totals.totalDeductions)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-blue-600 mb-1">Tổng Trừ</p>
                            <p class="text-lg font-bold text-red-600">${this.formatCurrency(totals.totalDeductions)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-blue-600 mb-1">Tổng Thanh Toán</p>
                            <p class="text-3xl font-bold text-green-600">${this.formatCurrency(totals.totalAmount)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Payroll Details -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 class="text-xl font-bold text-surface-900 mb-4">Chi Tiết Thanh Toán Cho ${this.selectedPayrolls.length} Nhân Viên</h3>
                    <div class="max-h-96 overflow-y-auto">
                        ${payrollDetails}
                    </div>
                </div>
                
                <!-- Important Notice -->
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
                    <p class="font-semibold text-yellow-900 mb-1">🔔 Lưu Ý Quan Trọng</p>
                    <ul class="text-sm text-yellow-800 list-disc list-inside space-y-1">
                        <li>Kiểm tra kỹ thông tin trước khi xác nhận</li>
                        <li>Thanh toán sẽ được gửi đến tài khoản ngân hàng của nhân viên</li>
                        <li>Quá trình thanh toán sẽ mất khoảng 2-5 phút</li>
                        <li>Không thể huỷ sau khi bắt đầu xử lý</li>
                    </ul>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3 justify-end">
                    <button onclick="PayrollProcessing.goBack()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                        <i class="fa-solid fa-arrow-left mr-2"></i>Quay Lại
                    </button>
                    <button onclick="PayrollProcessing.goToApproval()" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition flex items-center gap-2">
                        Xác Nhận
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    static renderApprovalStep() {
        const container = document.getElementById('payroll-processing-container');
        if (!container) return;
        
        const totals = this.calculateTotals();
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-surface-900 mb-2">Phê Duyệt Thanh Toán</h1>
                    <p class="text-lg text-surface-600">Kiểm tra lần cuối và phê duyệt thanh toán lương</p>
                </div>
                
                <!-- Step Indicator -->
                <div class="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 opacity-50">
                            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Chọn Lương</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3 opacity-50">
                            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Xem Lại</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">3</div>
                            <div>
                                <p class="font-semibold text-surface-900">Duyệt</p>
                                <p class="text-sm text-primary-600">Hiện tại</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">4</div>
                            <div>
                                <p class="font-semibold text-surface-900">Thanh Toán</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Info Box -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                    <div class="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Tổng Số Nhân Viên</p>
                            <p class="text-5xl font-bold text-primary-500">${totals.employeeCount}</p>
                        </div>
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Tổng Tiền Thanh Toán</p>
                            <p class="text-5xl font-bold text-green-600">${this.formatCurrency(totals.totalAmount)}</p>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-200 pt-6">
                        <h4 class="font-semibold text-surface-900 mb-4">Thông Tin Phê Duyệt</h4>
                        <div class="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <label class="block text-surface-600 mb-2">Người Phê Duyệt</label>
                                <p class="font-semibold text-surface-900">${window.appState?.user?.HoTen || 'Kế Toán Trưởng'}</p>
                            </div>
                            <div>
                                <label class="block text-surface-600 mb-2">Ngày Phê Duyệt</label>
                                <p class="font-semibold text-surface-900">${new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                                <label class="block text-surface-600 mb-2">Phương Thức Thanh Toán</label>
                                <p class="font-semibold text-surface-900">Chuyển khoản ngân hàng</p>
                            </div>
                            <div>
                                <label class="block text-surface-600 mb-2">Khoảng Thời Gian</label>
                                <p class="font-semibold text-surface-900">2-5 phút</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Checklist -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h4 class="font-semibold text-surface-900 mb-4">Danh Sách Kiểm Tra</h4>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="check1" class="w-5 h-5 text-green-600 cursor-pointer">
                            <label for="check1" class="cursor-pointer text-surface-700">Tôi đã xác nhận thông tin nhân viên là chính xác</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="check2" class="w-5 h-5 text-green-600 cursor-pointer">
                            <label for="check2" class="cursor-pointer text-surface-700">Tôi đã kiểm tra số tiền thanh toán</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="check3" class="w-5 h-5 text-green-600 cursor-pointer">
                            <label for="check3" class="cursor-pointer text-surface-700">Tôi xác nhận rằng tất cả các tài khoản ngân hàng là hợp lệ</label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="check4" class="w-5 h-5 text-green-600 cursor-pointer">
                            <label for="check4" class="cursor-pointer text-surface-700">Tôi hiểu rằng không thể huỷ sau khi bắt đầu xử lý</label>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3 justify-end">
                    <button onclick="PayrollProcessing.goBack()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                        <i class="fa-solid fa-arrow-left mr-2"></i>Quay Lại
                    </button>
                    <button onclick="PayrollProcessing.goToProcessing()" id="approve-btn" disabled class="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg transition cursor-not-allowed">
                        <i class="fa-solid fa-check mr-2"></i>Phê Duyệt & Thanh Toán
                    </button>
                </div>
            </div>
        `;
        
        // Setup checklist validation
        setTimeout(() => {
            const checks = [1, 2, 3, 4];
            const validateBtn = () => {
                const allChecked = checks.every(i => document.getElementById(`check${i}`)?.checked);
                const approveBtn = document.getElementById('approve-btn');
                if (approveBtn) {
                    approveBtn.disabled = !allChecked;
                    approveBtn.classList.toggle('bg-gray-400', !allChecked);
                    approveBtn.classList.toggle('cursor-not-allowed', !allChecked);
                    approveBtn.classList.toggle('bg-primary-500', allChecked);
                    approveBtn.classList.toggle('hover:bg-primary-600', allChecked);
                }
            };
            
            checks.forEach(i => {
                const check = document.getElementById(`check${i}`);
                if (check) check.addEventListener('change', validateBtn);
            });
        }, 0);
    }
    
    static renderProcessingStep() {
        const container = document.getElementById('payroll-processing-container');
        if (!container) return;
        
        const totals = this.calculateTotals();
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Step Indicator -->
                <div class="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 opacity-50">
                            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Chọn Lương</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3 opacity-50">
                            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Xem Lại</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3 opacity-50">
                            <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Duyệt</p>
                            </div>
                        </div>
                        <div class="text-gray-300">→</div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                                <i class="fa-solid fa-spinner fa-spin"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-surface-900">Xử Lý Thanh Toán</p>
                                <p class="text-sm text-primary-600">Đang xử lý...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Processing Card -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                    <div class="text-center mb-8">
                        <div class="inline-block mb-4">
                            <div class="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center">
                                <i class="fa-solid fa-money-bill-wave text-primary-500 text-5xl"></i>
                            </div>
                        </div>
                        <p class="text-sm text-surface-600 mb-2">Tổng Thanh Toán</p>
                        <p class="text-5xl font-bold text-green-600">${this.formatCurrency(totals.totalAmount)}</p>
                        <p class="text-lg text-surface-600 mt-2">cho ${totals.employeeCount} nhân viên</p>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-2">
                            <p class="font-semibold text-surface-900">Tiến Độ Xử Lý</p>
                            <p class="text-sm text-surface-600" id="progress-percent">0%</p>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div id="processing-progress" class="bg-gradient-to-r from-primary-500 to-green-500 h-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                    
                    <!-- Steps -->
                    <div id="steps-list" class="space-y-3">
                        <div class="step-item flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fa-solid fa-circle text-xs text-gray-600"></i>
                            </div>
                            <p class="text-surface-700">Xác thực dữ liệu</p>
                        </div>
                        <div class="step-item flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fa-solid fa-circle text-xs text-gray-600"></i>
                            </div>
                            <p class="text-surface-700">Kiểm tra tài khoản ngân hàng</p>
                        </div>
                        <div class="step-item flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fa-solid fa-circle text-xs text-gray-600"></i>
                            </div>
                            <p class="text-surface-700">Kiểm tra biểu tượng thanh toán</p>
                        </div>
                        <div class="step-item flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fa-solid fa-circle text-xs text-gray-600"></i>
                            </div>
                            <p class="text-surface-700">Xử lý giao dịch</p>
                        </div>
                        <div class="step-item flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fa-solid fa-circle text-xs text-gray-600"></i>
                            </div>
                            <p class="text-surface-700">Cập nhật bảng lương</p>
                        </div>
                        <div class="step-item flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <i class="fa-solid fa-circle text-xs text-gray-600"></i>
                            </div>
                            <p class="text-surface-700">Gửi thông báo</p>
                        </div>
                    </div>
                </div>
                
                <div class="text-center">
                    <p class="text-surface-600 animate-pulse">Vui lòng không đóng cửa sổ này...</p>
                </div>
            </div>
        `;
        
        // Start processing
        setTimeout(() => this.processPayment(), 300);
    }
    
    static renderConfirmStep() {
        const container = document.getElementById('payroll-processing-container');
        if (!container) return;
        
        const totals = this.calculateTotals();
        const duration = ((this.processingState.endTime - this.processingState.startTime) / 1000).toFixed(1);
        
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Success Animation -->
                <div class="text-center mb-12">
                    <div class="inline-block mb-6">
                        <div class="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                            <i class="fa-solid fa-check text-green-600 text-6xl"></i>
                        </div>
                    </div>
                    <h1 class="text-4xl font-bold text-green-600 mb-2">Thanh Toán Thành Công!</h1>
                    <p class="text-lg text-surface-600">Lương của ${totals.employeeCount} nhân viên đã được chuyển</p>
                </div>
                
                <!-- Transaction Details -->
                <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
                    <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Mã Giao Dịch</p>
                            <p class="text-2xl font-bold text-surface-900 font-mono">${this.processingState.transactionId}</p>
                        </div>
                        <div>
                            <p class="text-sm text-surface-600 mb-2">Thời Gian Xử Lý</p>
                            <p class="text-2xl font-bold text-surface-900">${duration}s</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-6 mb-8">
                        <div class="text-center p-4 bg-blue-50 rounded-lg">
                            <p class="text-sm text-blue-600 mb-2">Số Nhân Viên</p>
                            <p class="text-3xl font-bold text-blue-900">${totals.employeeCount}</p>
                        </div>
                        <div class="text-center p-4 bg-green-50 rounded-lg">
                            <p class="text-sm text-green-600 mb-2">Tổng Thanh Toán</p>
                            <p class="text-2xl font-bold text-green-900">${this.formatCurrency(totals.totalAmount)}</p>
                        </div>
                        <div class="text-center p-4 bg-purple-50 rounded-lg">
                            <p class="text-sm text-purple-600 mb-2">Thời Gian</p>
                            <p class="text-lg font-bold text-purple-900">${new Date().toLocaleTimeString('vi-VN')}</p>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p class="font-semibold text-blue-900 mb-2">✓ Quá trình thanh toán hoàn tất</p>
                        <ul class="text-sm text-blue-800 list-disc list-inside space-y-1">
                            <li>Tất cả giao dịch đã được xác nhận</li>
                            <li>Thông báo đã được gửi đến tất cả nhân viên</li>
                            <li>Bảng lương đã được cập nhật</li>
                            <li>Báo cáo chi tiết đã được lưu trữ</li>
                        </ul>
                    </div>
                </div>
                
                <!-- Summary List -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <h3 class="text-xl font-bold text-surface-900 mb-4">Thông Tin Nhân Viên Nhận Lương</h3>
                    <div class="space-y-3 max-h-64 overflow-y-auto">
                        ${this.selectedPayrolls.map((p, idx) => `
                            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">${idx + 1}</div>
                                    <div>
                                        <p class="font-semibold text-surface-900">${p.HoTen}</p>
                                        <p class="text-xs text-surface-600">Mã: ${p.MaNV}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-green-600">${this.formatCurrency(p.ThuongThuc)}</p>
                                    <p class="text-xs text-green-600"><i class="fa-solid fa-check"></i> Đã gửi</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3 justify-center">
                    <button onclick="PayrollProcessing.finishProcessing()" class="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition flex items-center gap-2">
                        <i class="fa-solid fa-home mr-2"></i>Quay Lại Trang Chủ
                    </button>
                    <button onclick="window.print()" class="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition flex items-center gap-2">
                        <i class="fa-solid fa-print mr-2"></i>In Báo Cáo
                    </button>
                </div>
            </div>
        `;
    }
    
    static async render(container) {
        await this.loadData();
        
        const processingContainer = document.createElement('div');
        processingContainer.id = 'payroll-processing-container';
        container.innerHTML = '';
        container.appendChild(processingContainer);
        
        // Make PayrollProcessing globally accessible
        window.PayrollProcessing = PayrollProcessing;
        
        this.renderSelectionStep();
    }
}