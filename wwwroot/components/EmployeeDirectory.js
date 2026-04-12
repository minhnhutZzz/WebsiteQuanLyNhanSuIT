// === EmployeeDirectory.js – Danh sách nhân viên với tìm kiếm & lọc ===
import { apiFetch, showToast } from '../app.js';

const EmployeeDirectory = {
    render: async (container) => {
        // Bước 1: Hiển thị skeleton loading
        container.innerHTML = `
            <div class="card">
                <div class="flex items-center justify-between mb-6">
                    <div class="h-6 w-40 bg-surface-200 rounded animate-pulse"></div>
                    <div class="h-9 w-64 bg-surface-200 rounded animate-pulse"></div>
                </div>
                <div class="space-y-3">
                    <div class="h-10 bg-surface-100 rounded animate-pulse"></div>
                    <div class="h-10 bg-surface-100 rounded animate-pulse"></div>
                    <div class="h-10 bg-surface-100 rounded animate-pulse"></div>
                </div>
            </div>
        `;

        // Bước 2: Gọi API lấy danh sách nhân viên thật
        let employees = [];
        try {
            const res = await apiFetch('/api/task/employees');
            if (res.ok) employees = await res.json();
        } catch { showToast('Không thể tải danh sách nhân viên', 'error'); }

        // Bước 3: Gọi API lấy thống kê
        let stats = { tongNhanVien: 0, khaDung: 0, nghiPhep: 0 };
        try {
            const res = await apiFetch('/api/task/stats');
            if (res.ok) stats = await res.json();
        } catch {}

        // Bước 4: Render giao diện chính
        container.innerHTML = `
            <!-- Thẻ thống kê nhỏ trên đầu -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="card flex items-center gap-3 !p-4">
                    <div class="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-500 text-sm">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <p class="text-xs text-surface-500 font-medium">Tổng</p>
                        <p class="text-lg font-bold text-surface-900">${stats.tongNhanVien}</p>
                    </div>
                </div>
                <div class="card flex items-center gap-3 !p-4">
                    <div class="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-sm">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <p class="text-xs text-surface-500 font-medium">Khả dụng</p>
                        <p class="text-lg font-bold text-green-700">${stats.khaDung}</p>
                    </div>
                </div>
                <div class="card flex items-center gap-3 !p-4">
                    <div class="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-500 text-sm">
                        <i class="fa-solid fa-plane-departure"></i>
                    </div>
                    <div>
                        <p class="text-xs text-surface-500 font-medium">Nghỉ phép</p>
                        <p class="text-lg font-bold text-red-600">${stats.nghiPhep}</p>
                    </div>
                </div>
            </div>

            <!-- Bảng danh sách -->
            <div class="card">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                    <h2 class="text-base font-bold text-surface-900">Danh sách nhân viên</h2>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <div class="relative flex-1 sm:flex-none">
                            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-xs"></i>
                            <input type="text" id="emp-search" class="input-field !pl-8 !py-2 text-sm w-full sm:w-56" placeholder="Tìm theo tên...">
                        </div>
                        <select id="emp-filter" class="input-field !py-2 text-sm w-36 cursor-pointer">
                            <option value="all">Tất cả</option>
                            <option value="Khả dụng">Khả dụng</option>
                            <option value="Nghỉ phép">Nghỉ phép</option>
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody id="emp-tbody"></tbody>
                    </table>
                </div>
                <p id="emp-empty" class="hidden text-sm text-surface-400 text-center py-8">Không tìm thấy nhân viên nào.</p>
            </div>
        `;

        // Bước 5: Hàm render bảng nhân viên theo bộ lọc
        const tbody = document.getElementById('emp-tbody');
        const emptyMsg = document.getElementById('emp-empty');
        const searchInput = document.getElementById('emp-search');
        const filterSelect = document.getElementById('emp-filter');

        const renderTable = () => {
            const keyword = searchInput.value.toLowerCase();
            const status = filterSelect.value;
            const filtered = employees.filter(emp => {
                const matchName = (emp.HoTen || emp.hoTen || '').toLowerCase().includes(keyword) || (emp.MaNV || emp.maNV || '').toLowerCase().includes(keyword);
                const matchStatus = status === 'all' || (emp.TrangThai || emp.trangThai) === status;
                return matchName && matchStatus;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = '';
                emptyMsg.classList.remove('hidden');
            } else {
                emptyMsg.classList.add('hidden');
                tbody.innerHTML = filtered.map(emp => {
                    return `<tr>
                        <td class="font-mono text-xs font-semibold text-surface-500">${emp.MaNV || emp.maNV || ''}</td>
                        <td class="font-medium text-surface-800">${emp.HoTen || emp.hoTen || ''}</td>
                        <td class="text-surface-500">${emp.Email || emp.email || ''}</td>
                    </tr>`;
                }).join('');
            }
        };

        searchInput.addEventListener('input', renderTable);
        filterSelect.addEventListener('change', renderTable);
        renderTable();
    }
};

export default EmployeeDirectory;
