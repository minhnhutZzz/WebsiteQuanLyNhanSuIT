import { apiFetch, showToast } from '../app.js';

export const LeaveRequest = {
    async render(container) {
        const maNv = window.appState.user?.MaNV || window.appState.user?.maNV;
        const hoTen = window.appState.user?.HoTen || window.appState.user?.hoTen;

        container.innerHTML = `
            <div class="max-w-4xl">
                <h1 class="text-4xl font-bold text-surface-900 mb-2">Xin Nghỉ</h1>
                <p class="text-lg text-surface-600 mb-8">Gửi đơn xin nghỉ đến quản lý</p>

                <!-- Form xin nghỉ -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div class="mb-6">
                        <label class="block text-sm font-semibold text-surface-700 mb-2">Lý do xin nghỉ <span class="text-red-500">*</span></label>
                        <textarea id="lyDo" class="input-field h-24 resize-none" placeholder="Nhập lý do xin nghỉ..." required></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-semibold text-surface-700 mb-2">Ngày bắt đầu <span class="text-red-500">*</span></label>
                            <input type="date" id="ngayBatDau" class="input-field" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-surface-700 mb-2">Ngày kết thúc <span class="text-red-500">*</span></label>
                            <input type="date" id="ngayKetThuc" class="input-field" required>
                        </div>
                    </div>

                    <div class="bg-blue-50 p-4 rounded-lg mb-6">
                        <p class="text-sm text-blue-700">
                            <i class="fa-solid fa-info-circle mr-2"></i>
                            <strong>Số ngày:</strong> <span id="soNgay">0</span> ngày
                        </p>
                    </div>

                    <div class="flex gap-3">
                        <button id="submitBtn" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition">
                            <i class="fa-solid fa-paper-plane mr-2"></i> Gửi Đơn
                        </button>
                        <button onclick="document.getElementById('lyDo').value=''; document.getElementById('ngayBatDau').value=''; document.getElementById('ngayKetThuc').value=''; document.getElementById('soNgay').textContent='0';" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition">
                            <i class="fa-solid fa-redo mr-2"></i> Xóa
                        </button>
                    </div>
                </div>

                <!-- Lịch sử đơn xin nghỉ -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 class="text-2xl font-bold text-surface-900 mb-4">Lịch Sử Đơn Xin Nghỉ</h2>
                    <div id="historyContent" class="text-center py-8">
                        <i class="fa-solid fa-spinner text-primary-500 text-3xl animate-spin"></i>
                        <p class="text-surface-600 mt-3">Đang tải...</p>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('ngayBatDau').addEventListener('change', updateSoNgay);
        document.getElementById('ngayKetThuc').addEventListener('change', updateSoNgay);
        document.getElementById('submitBtn').addEventListener('click', submitLeaveRequest);

        // Load history
        await loadLeaveHistory();
    }
};

function updateSoNgay() {
    const startInput = document.getElementById('ngayBatDau').value;
    const endInput = document.getElementById('ngayKetThuc').value;

    if (startInput && endInput) {
        const startDate = new Date(startInput);
        const endDate = new Date(endInput);
        const soNgay = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('soNgay').textContent = soNgay > 0 ? soNgay : 0;
    } else {
        document.getElementById('soNgay').textContent = 0;
    }
}

async function submitLeaveRequest() {
    const lyDo = document.getElementById('lyDo').value.trim();
    const ngayBatDau = document.getElementById('ngayBatDau').value;
    const ngayKetThuc = document.getElementById('ngayKetThuc').value;

    if (!lyDo || !ngayBatDau || !ngayKetThuc) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Đang gửi...';

    try {
        const response = await apiFetch('/api/task/request-leave', {
            method: 'POST',
            body: JSON.stringify({
                lyDo,
                ngayBatDau,
                ngayKetThuc
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('✓ Gửi đơn xin nghỉ thành công!', 'success');
            // Clear form
            document.getElementById('lyDo').value = '';
            document.getElementById('ngayBatDau').value = '';
            document.getElementById('ngayKetThuc').value = '';
            document.getElementById('soNgay').textContent = '0';
            // Reload history
            await loadLeaveHistory();
        } else {
            showToast(data.message || 'Lỗi gửi đơn', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi kết nối', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i> Gửi Đơn';
    }
}

async function loadLeaveHistory() {
    try {
        const maNv = window.appState.user?.MaNV || window.appState.user?.maNV;
        const response = await apiFetch('/api/task/my-leave-requests');

        if (!response.ok) {
            throw new Error('Failed to load data');
        }

        const requests = await response.json();
        const historyContent = document.getElementById('historyContent');

        if (requests.length === 0) {
            historyContent.innerHTML = `
                <div class="text-center py-8">
                    <i class="fa-solid fa-inbox text-gray-300 text-3xl mb-3"></i>
                    <p class="text-surface-500">Chưa có đơn xin nghỉ nào</p>
                </div>
            `;
            return;
        }

        historyContent.innerHTML = `
            <table class="w-full text-sm">
                <thead class="border-b border-gray-200 bg-surface-50">
                    <tr>
                        <th class="text-left px-4 py-3 text-surface-600 font-semibold">Ngày Gửi</th>
                        <th class="text-left px-4 py-3 text-surface-600 font-semibold">Lý Do</th>
                        <th class="text-center px-4 py-3 text-surface-600 font-semibold">Từ - Đến</th>
                        <th class="text-center px-4 py-3 text-surface-600 font-semibold">Số Ngày</th>
                        <th class="text-center px-4 py-3 text-surface-600 font-semibold">Trạng Thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(req => {
                        const statusClass = req.trangThai === 'Da duyet' ? 'bg-green-50 text-green-700' : 
                                          req.trangThai === 'Tu choi' ? 'bg-red-50 text-red-700' : 
                                          'bg-yellow-50 text-yellow-700';
                        const startDate = new Date(req.ngayBatDau).toLocaleDateString('vi-VN');
                        const endDate = new Date(req.ngayKetThuc).toLocaleDateString('vi-VN');
                        const requestDate = new Date(req.ngayGui).toLocaleDateString('vi-VN');
                        return `
                        <tr class="border-b border-gray-100 hover:bg-surface-50">
                            <td class="px-4 py-3 text-surface-700">${requestDate}</td>
                            <td class="px-4 py-3 text-surface-700">${req.lyDo}</td>
                            <td class="text-center px-4 py-3 text-surface-700">${startDate} - ${endDate}</td>
                            <td class="text-center px-4 py-3 font-bold text-blue-600">${req.soNgay}</td>
                            <td class="text-center px-4 py-3">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
                                    ${req.trangThai === 'Da duyet' ? 'Đã Duyệt' : 
                                      req.trangThai === 'Tu choi' ? 'Từ Chối' : 'Đang Chờ'}
                                </span>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading history:', error);
        document.getElementById('historyContent').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fa-solid fa-exclamation-circle text-2xl mb-2"></i>
                <p>Lỗi tải dữ liệu</p>
            </div>
        `;
    }
}
