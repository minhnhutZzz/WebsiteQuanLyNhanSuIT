import { apiFetch, showToast } from '../app.js';

const SalaryManagement = {
    async render(container) {
        const role = window.appState.user?.role;
        const maNV = window.appState.user?.maNV;
        const isKeToan = role === 'KeToan';

        container.innerHTML = `
            <div class="fade-in">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 class="text-xl font-bold text-surface-900">
                            <i class="fa-solid fa-money-bill-wave text-primary-500 mr-2"></i>
                            Quản lý Lương
                        </h2>
                        <p class="text-sm text-surface-500 mt-1">
                            ${isKeToan ? 'Lập bảng lương, chi trả và tra cứu lương nhân viên' : 'Xem bảng lương cá nhân'}
                        </p>
                    </div>
                    ${isKeToan ? `
                        <button id="btn-toggle-form" class="btn-primary">
                            <i class="fa-solid fa-plus text-xs"></i> Lập bảng lương
                        </button>
                    ` : ''}
                </div>

                <!-- Form lập bảng lương (chỉ hiện cho KeToan/QuanLy) -->
                ${isKeToan ? `
                <div id="salary-form-wrapper" class="card mb-6 hidden salary-form-slide">
                    <div class="flex items-center justify-between mb-5">
                        <h3 class="text-base font-semibold text-surface-800">
                            <i class="fa-solid fa-file-invoice-dollar text-primary-400 mr-2"></i>
                            Lập bảng lương mới
                        </h3>
                        <button id="btn-close-form" class="text-surface-400 hover:text-surface-600 transition-colors">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    <form id="salary-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Mã Nhân viên</label>
                            <input type="text" id="frm-maNV" class="input-field" placeholder="VD: NV002" required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Tháng</label>
                            <select id="frm-thang" class="input-field" required>
                                ${Array.from({length: 12}, (_, i) => `<option value="${i+1}" ${(new Date().getMonth() + 1) === i+1 ? 'selected' : ''}>Tháng ${i+1}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Năm</label>
                            <input type="number" id="frm-nam" class="input-field" value="${new Date().getFullYear()}" required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Số ngày công</label>
                            <input type="number" id="frm-soNgayCong" class="input-field" placeholder="VD: 22" step="0.5" min="0" max="31" required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Lương cơ bản (VNĐ)</label>
                            <input type="number" id="frm-luongCoBan" class="input-field" placeholder="VD: 15000000" min="0" required>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Thưởng KPI (VNĐ)</label>
                            <input type="number" id="frm-thuongKPI" class="input-field" placeholder="VD: 2000000" min="0" value="0">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Khấu trừ (VNĐ)</label>
                            <input type="number" id="frm-khauTru" class="input-field" placeholder="VD: 500000" min="0" value="0">
                        </div>
                        <div class="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                            <button type="button" id="btn-reset-form" class="btn-secondary">
                                <i class="fa-solid fa-rotate-left text-xs"></i> Đặt lại
                            </button>
                            <button type="submit" id="btn-submit-salary" class="btn-primary">
                                <i class="fa-solid fa-calculator text-xs"></i> Tính & Lưu
                            </button>
                        </div>
                    </form>
                </div>
                ` : ''}

                <!-- Bộ lọc & Tìm kiếm -->
                <div class="card mb-4">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        ${isKeToan ? `
                        <div class="flex-1 relative">
                            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
                            <input type="text" id="search-maNV" class="input-field pl-9" placeholder="Nhập mã NV để tra cứu...">
                        </div>
                        ` : `
                        <div class="flex-1">
                            <span class="text-sm text-surface-600 font-medium">
                                <i class="fa-solid fa-user text-primary-400 mr-1"></i>
                                Bảng lương của: <strong>${window.appState.user?.hoTen || maNV}</strong>
                            </span>
                        </div>
                        `}
                        <div class="flex items-center gap-2">
                            <select id="filter-status" class="input-field text-sm w-auto">
                                <option value="">Tất cả trạng thái</option>
                                <option value="ChuaThanhToan">Chưa thanh toán</option>
                                <option value="DaThanhToan">Đã thanh toán</option>
                            </select>
                            <button id="btn-search" class="btn-primary text-sm">
                                <i class="fa-solid fa-search text-xs"></i> Tra cứu
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Bảng lương -->
                <div class="card overflow-x-auto">
                    <div id="salary-table-wrapper">
                        <div class="text-center py-12 text-surface-400">
                            <i class="fa-solid fa-file-invoice text-3xl mb-3 block"></i>
                            <p class="text-sm">${isKeToan ? 'Nhập mã nhân viên và nhấn Tra cứu để xem bảng lương' : 'Đang tải dữ liệu...'}</p>
                        </div>
                    </div>
                </div>

                <!-- Thống kê tổng quan (chỉ hiện cho KeToan/QuanLy) -->
                <div id="salary-stats" class="hidden grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div class="card text-center">
                        <div class="text-2xl font-bold text-primary-500" id="stat-total">0</div>
                        <div class="text-xs text-surface-500 mt-1 uppercase tracking-wide">Tổng bảng lương</div>
                    </div>
                    <div class="card text-center">
                        <div class="text-2xl font-bold text-green-600" id="stat-paid">0</div>
                        <div class="text-xs text-surface-500 mt-1 uppercase tracking-wide">Đã thanh toán</div>
                    </div>
                    <div class="card text-center">
                        <div class="text-2xl font-bold text-amber-500" id="stat-pending">0</div>
                        <div class="text-xs text-surface-500 mt-1 uppercase tracking-wide">Chưa thanh toán</div>
                    </div>
                </div>
            </div>
        `;

        // Bind events
        this._bindEvents(isKeToan, maNV);

        // Auto-load cho NhanVien
        if (!isKeToan) {
            this._loadSalary(maNV);
        }
    },

    _bindEvents(isKeToan, maNV) {
        // Toggle form
        if (isKeToan) {
            const toggleBtn = document.getElementById('btn-toggle-form');
            const formWrapper = document.getElementById('salary-form-wrapper');
            const closeBtn = document.getElementById('btn-close-form');

            toggleBtn?.addEventListener('click', () => {
                formWrapper.classList.toggle('hidden');
                if (!formWrapper.classList.contains('hidden')) {
                    formWrapper.classList.add('salary-form-slide-in');
                }
            });

            closeBtn?.addEventListener('click', () => {
                formWrapper.classList.add('hidden');
            });

            // Reset form
            document.getElementById('btn-reset-form')?.addEventListener('click', () => {
                document.getElementById('salary-form').reset();
                document.getElementById('frm-nam').value = new Date().getFullYear();
            });

            // Submit form
            document.getElementById('salary-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this._submitSalary();
            });
        }

        // Search / Tra cứu
        document.getElementById('btn-search')?.addEventListener('click', () => {
            if (isKeToan) {
                const searchMaNV = document.getElementById('search-maNV')?.value.trim();
                if (!searchMaNV) {
                    showToast('Vui lòng nhập mã nhân viên', 'error');
                    return;
                }
                this._loadSalary(searchMaNV);
            } else {
                this._loadSalary(maNV);
            }
        });

        // Enter key search
        document.getElementById('search-maNV')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('btn-search')?.click();
            }
        });

        // Filter by status
        document.getElementById('filter-status')?.addEventListener('change', () => {
            // Re-render table with current data
            if (this._currentData) {
                this._renderTable(this._currentData, isKeToan);
            }
        });
    },

    async _submitSalary() {
        const btn = document.getElementById('btn-submit-salary');
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Đang tính...';
        btn.disabled = true;

        try {
            const payload = {
                maNV: document.getElementById('frm-maNV').value.trim(),
                thang: parseInt(document.getElementById('frm-thang').value),
                nam: parseInt(document.getElementById('frm-nam').value),
                soNgayCong: parseFloat(document.getElementById('frm-soNgayCong').value),
                luongCoBan: parseFloat(document.getElementById('frm-luongCoBan').value),
                thuongKPI: parseFloat(document.getElementById('frm-thuongKPI').value) || 0,
                khauTru: parseFloat(document.getElementById('frm-khauTru').value) || 0
            };

            const res = await apiFetch('/api/luong/lap-bang', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                showToast(data.message || 'Lập bảng lương thành công!');
                // Reset form
                document.getElementById('salary-form').reset();
                document.getElementById('frm-nam').value = new Date().getFullYear();
                // Auto load kết quả
                document.getElementById('search-maNV').value = payload.maNV;
                this._loadSalary(payload.maNV);
            } else {
                showToast(data.message || 'Lỗi khi lập bảng lương', 'error');
            }
        } catch (err) {
            showToast('Lỗi kết nối máy chủ', 'error');
        } finally {
            btn.innerHTML = origHTML;
            btn.disabled = false;
        }
    },

    async _loadSalary(maNV) {
        const wrapper = document.getElementById('salary-table-wrapper');
        wrapper.innerHTML = `
            <div class="text-center py-8">
                <span class="spinner text-primary-500" style="width:1.5rem;height:1.5rem;border-width:3px;"></span>
                <p class="text-sm text-surface-400 mt-3">Đang tải dữ liệu lương...</p>
            </div>
        `;

        try {
            const res = await apiFetch(`/api/luong/tra-cuu/${maNV}`);
            
            if (res.status === 403) {
                wrapper.innerHTML = `
                    <div class="text-center py-12 text-red-400">
                        <i class="fa-solid fa-lock text-3xl mb-3 block"></i>
                        <p class="text-sm font-medium">Bạn không có quyền xem bảng lương này</p>
                    </div>
                `;
                return;
            }

            const data = await res.json();
            const records = data.data || [];
            this._currentData = records;

            const isKeToan = window.appState.user?.role === 'KeToan';
            this._renderTable(records, isKeToan);
            this._updateStats(records);
        } catch (err) {
            wrapper.innerHTML = `
                <div class="text-center py-12 text-red-400">
                    <i class="fa-solid fa-triangle-exclamation text-3xl mb-3 block"></i>
                    <p class="text-sm font-medium">Lỗi khi tải dữ liệu</p>
                </div>
            `;
        }
    },

    _renderTable(records, isKeToan) {
        const wrapper = document.getElementById('salary-table-wrapper');
        const filterStatus = document.getElementById('filter-status')?.value;

        let filtered = records;
        if (filterStatus) {
            filtered = records.filter(r => r.trangThai === filterStatus);
        }

        if (filtered.length === 0) {
            wrapper.innerHTML = `
                <div class="text-center py-12 text-surface-400">
                    <i class="fa-solid fa-folder-open text-3xl mb-3 block"></i>
                    <p class="text-sm">${records.length === 0 ? 'Chưa có bảng lương nào' : 'Không có bảng lương phù hợp bộ lọc'}</p>
                </div>
            `;
            return;
        }

        const formatCurrency = (val) => {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
        };

        wrapper.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Mã NV</th>
                        <th>Kỳ lương</th>
                        <th class="text-right">Ngày công</th>
                        <th class="text-right">Lương CB</th>
                        <th class="text-right">Thưởng KPI</th>
                        <th class="text-right">Khấu trừ</th>
                        <th class="text-right">Thuế TNCN</th>
                        <th class="text-right">Thực lãnh</th>
                        <th>Trạng thái</th>
                        ${isKeToan ? '<th class="text-center">Thao tác</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${filtered.map(r => `
                        <tr class="salary-row">
                            <td class="font-medium text-surface-800">${r.maNV}</td>
                            <td>T${r.thang}/${r.nam}</td>
                            <td class="text-right">${r.soNgayCong}</td>
                            <td class="text-right">${formatCurrency(r.luongCoBan)}</td>
                            <td class="text-right salary-bonus">${r.thuongKPI > 0 ? '+' : ''}${formatCurrency(r.thuongKPI)}</td>
                            <td class="text-right salary-deduct">${r.khauTru > 0 ? '-' : ''}${formatCurrency(r.khauTru)}</td>
                            <td class="text-right salary-deduct">${r.thueTNCN > 0 ? '-' : ''}${formatCurrency(r.thueTNCN)}</td>
                            <td class="text-right font-bold ${r.thucLanh >= 0 ? 'text-primary-600' : 'text-red-600'}">${formatCurrency(r.thucLanh)}</td>
                            <td>
                                <span class="tag ${r.trangThai === 'DaThanhToan' ? 'tag-green' : 'tag-pending'}">
                                    <i class="fa-solid ${r.trangThai === 'DaThanhToan' ? 'fa-check-circle' : 'fa-clock'} mr-1 text-[10px]"></i>
                                    ${r.trangThai === 'DaThanhToan' ? 'Đã TT' : 'Chưa TT'}
                                </span>
                            </td>
                            ${isKeToan ? `
                            <td class="text-center">
                                ${r.trangThai === 'ChuaThanhToan' ? `
                                    <button class="btn-pay-salary btn-secondary text-xs" data-id="${r.maBangLuong}">
                                        <i class="fa-solid fa-credit-card text-xs"></i> Chi trả
                                    </button>
                                ` : `
                                    <span class="text-xs text-surface-400"><i class="fa-solid fa-check"></i> Hoàn tất</span>
                                `}
                            </td>
                            ` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Bind chi trả buttons
        wrapper.querySelectorAll('.btn-pay-salary').forEach(btn => {
            btn.addEventListener('click', async () => {
                const maBangLuong = btn.dataset.id;
                await this._paySalary(maBangLuong, btn);
            });
        });
    },

    async _paySalary(maBangLuong, btn) {
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;

        try {
            const res = await apiFetch(`/api/luong/chi-tra/${maBangLuong}`, { method: 'PUT' });
            const data = await res.json();

            if (res.ok) {
                showToast(data.message || 'Chi trả lương thành công!');
                // Reload current search
                const maNV = document.getElementById('search-maNV')?.value.trim() || window.appState.user?.maNV;
                if (maNV) this._loadSalary(maNV);
            } else {
                showToast(data.message || 'Lỗi khi chi trả', 'error');
                btn.innerHTML = origHTML;
                btn.disabled = false;
            }
        } catch (err) {
            showToast('Lỗi kết nối máy chủ', 'error');
            btn.innerHTML = origHTML;
            btn.disabled = false;
        }
    },

    _updateStats(records) {
        const statsEl = document.getElementById('salary-stats');
        if (!statsEl) return;

        if (records.length > 0) {
            statsEl.classList.remove('hidden');
            statsEl.classList.add('grid');
            document.getElementById('stat-total').textContent = records.length;
            document.getElementById('stat-paid').textContent = records.filter(r => r.trangThai === 'DaThanhToan').length;
            document.getElementById('stat-pending').textContent = records.filter(r => r.trangThai === 'ChuaThanhToan').length;
        } else {
            statsEl.classList.add('hidden');
        }
    },

    _currentData: null
};

export default SalaryManagement;
