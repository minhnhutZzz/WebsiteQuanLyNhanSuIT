import { apiFetch, showToast } from '../app.js';

export const LeaveApproval = {
    async render(container) {
        container.innerHTML = `
            <div class="max-w-6xl">
                <h1 class="text-4xl font-bold text-surface-900 mb-2">Duyệt Đơn Xin Nghỉ</h1>
                <p class="text-lg text-surface-600 mb-8">Xem và duyệt các đơn xin nghỉ từ nhân viên</p>

                <!-- Filter buttons -->
                <div class="flex gap-2 mb-6">
                    <button onclick="window.switchLeaveFilter('all')" class="filter-btn px-4 py-2 rounded-lg font-semibold transition active" data-filter="all">
                        Tất Cả
                    </button>
                    <button onclick="window.switchLeaveFilter('pending')" class="filter-btn px-4 py-2 rounded-lg font-semibold transition" data-filter="pending">
                        Đang Chờ
                    </button>
                    <button onclick="window.switchLeaveFilter('approved')" class="filter-btn px-4 py-2 rounded-lg font-semibold transition" data-filter="approved">
                        Đã Duyệt
                    </button>
                    <button onclick="window.switchLeaveFilter('rejected')" class="filter-btn px-4 py-2 rounded-lg font-semibold transition" data-filter="rejected">
                        Từ Chối
                    </button>
                </div>

                <!-- Leave requests list -->
                <div id="leaveContent" class="text-center py-8">
                    <i class="fa-solid fa-spinner text-primary-500 text-3xl animate-spin"></i>
                    <p class="text-surface-600 mt-3">Đang tải...</p>
                </div>
            </div>

            <!-- Modal for approval -->
            <div id="approvalModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <h3 class="text-2xl font-bold text-surface-900 mb-4">Xác Nhận Duyệt</h3>
                    <div id="modalContent"></div>
                    <div class="flex gap-3 mt-6">
                        <button id="approveBtn" class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition">
                            <i class="fa-solid fa-check mr-2"></i> Duyệt
                        </button>
                        <button id="rejectBtn" class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition">
                            <i class="fa-solid fa-times mr-2"></i> Từ Chối
                        </button>
                        <button onclick="document.getElementById('approvalModal').classList.add('hidden')" class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        `;

        window.leaveRequestsData = [];
        window.currentLeaveFilter = 'all';
        window.switchLeaveFilter = switchLeaveFilter;
        window.openApprovalModal = openApprovalModal;

        // Load pending requests
        await loadPendingLeaveRequests();
    }
};

async function loadPendingLeaveRequests() {
    try {
        console.log('[LeaveApproval] Loading leave requests...');
        const response = await apiFetch('/api/task/leave-requests');

        console.log('[LeaveApproval] API Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.text();
            console.log('[LeaveApproval] API Error:', error);
            throw new Error(`API error: ${response.status} - ${error}`);
        }

        window.leaveRequestsData = await response.json();
        console.log('[LeaveApproval] ✓ Loaded', window.leaveRequestsData.length, 'requests');
        renderLeaveRequests('all');

    } catch (error) {
        console.error('[LeaveApproval] Error:', error);
        document.getElementById('leaveContent').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fa-solid fa-exclamation-circle text-2xl mb-2"></i>
                <p>Lỗi tải dữ liệu: ${error.message}</p>
            </div>
        `;
    }
}

function switchLeaveFilter(filter) {
    window.currentLeaveFilter = filter;
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active', 'bg-primary-500', 'text-white');
            btn.classList.remove('bg-gray-100', 'text-surface-700');
        } else {
            btn.classList.remove('active', 'bg-primary-500', 'text-white');
            btn.classList.add('bg-gray-100', 'text-surface-700');
        }
    });

    renderLeaveRequests(filter);
}

function renderLeaveRequests(filter) {
    let filtered = window.leaveRequestsData;

    if (filter === 'pending') {
        filtered = window.leaveRequestsData.filter(r => r.trangThai === 'Dang cho duyet');
    } else if (filter === 'approved') {
        filtered = window.leaveRequestsData.filter(r => r.trangThai === 'Da duyet');
    } else if (filter === 'rejected') {
        filtered = window.leaveRequestsData.filter(r => r.trangThai === 'Tu choi');
    }

    const leaveContent = document.getElementById('leaveContent');

    if (filtered.length === 0) {
        leaveContent.innerHTML = `
            <div class="text-center py-8">
                <i class="fa-solid fa-inbox text-gray-300 text-3xl mb-3"></i>
                <p class="text-surface-500">Không có đơn xin nghỉ</p>
            </div>
        `;
        return;
    }

    leaveContent.innerHTML = filtered.map(req => {
        const statusClass = req.trangThai === 'Da duyet' ? 'bg-green-50 text-green-700' : 
                          req.trangThai === 'Tu choi' ? 'bg-red-50 text-red-700' : 
                          'bg-yellow-50 text-yellow-700';
        const startDate = new Date(req.ngayBatDau).toLocaleDateString('vi-VN');
        const endDate = new Date(req.ngayKetThuc).toLocaleDateString('vi-VN');
        const requestDate = new Date(req.ngayGui).toLocaleDateString('vi-VN');

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-surface-900">${req.hoTen}</h3>
                        <p class="text-sm text-surface-600">${req.maNV}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
                        ${req.trangThai === 'Da duyet' ? 'Đã Duyệt' : 
                          req.trangThai === 'Tu choi' ? 'Từ Chối' : 'Đang Chờ'}
                    </span>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                    <p class="text-sm text-surface-700"><strong>Lý do:</strong> ${req.lyDo}</p>
                    <p class="text-sm text-surface-700 mt-2"><strong>Từ ngày:</strong> ${startDate}</p>
                    <p class="text-sm text-surface-700"><strong>Đến ngày:</strong> ${endDate}</p>
                    <p class="text-sm text-surface-700 mt-2"><strong>Số ngày:</strong> <span class="font-bold text-blue-600">${req.soNgay}</span> ngày</p>
                    <p class="text-sm text-surface-500 mt-2">Gửi lúc: ${requestDate}</p>
                    ${req.ghiChu ? `<p class="text-sm text-surface-700 mt-2"><strong>Ghi chú:</strong> ${req.ghiChu}</p>` : ''}
                </div>

                ${req.trangThai === 'Dang cho duyet' ? `
                    <div class="flex gap-2">
                        <button onclick="window.openApprovalModal('${req.id}', true, '${req.hoTen}')" class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition text-sm">
                            <i class="fa-solid fa-check mr-1"></i> Duyệt
                        </button>
                        <button onclick="window.openApprovalModal('${req.id}', false, '${req.hoTen}')" class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition text-sm">
                            <i class="fa-solid fa-times mr-1"></i> Từ Chối
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function openApprovalModal(id, isApprove, hoTen) {
    const modal = document.getElementById('approvalModal');
    const modalContent = document.getElementById('modalContent');
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    const title = isApprove ? 'Duyệt Đơn' : 'Từ Chối Đơn';
    const message = isApprove ? `Bạn chắc chắn duyệt đơn xin nghỉ của <strong>${hoTen}</strong>?` : 
                              `Bạn chắc chắn từ chối đơn xin nghỉ của <strong>${hoTen}</strong>?`;

    modalContent.innerHTML = `
        <p class="text-surface-700">${message}</p>
        <div class="mt-4">
            <label class="text-sm font-semibold text-surface-700 block mb-2">Ghi chú (tùy chọn)</label>
            <textarea id="ghiChu" class="input-field resize-none h-20" placeholder="Nhập ghi chú..."></textarea>
        </div>
    `;

    approveBtn.style.display = isApprove ? 'block' : 'none';
    rejectBtn.style.display = !isApprove ? 'block' : 'none';

    // Remove old event listeners
    const newApproveBtn = approveBtn.cloneNode(true);
    const newRejectBtn = rejectBtn.cloneNode(true);
    approveBtn.replaceWith(newApproveBtn);
    rejectBtn.replaceWith(newRejectBtn);

    if (isApprove) {
        newApproveBtn.addEventListener('click', async () => {
            const ghiChu = document.getElementById('ghiChu').value;
            await submitApproval(id, true, ghiChu);
        });
    } else {
        newRejectBtn.addEventListener('click', async () => {
            const ghiChu = document.getElementById('ghiChu').value;
            await submitApproval(id, false, ghiChu);
        });
    }

    modal.classList.remove('hidden');
}

async function submitApproval(id, approved, ghiChu) {
    try {
        const modal = document.getElementById('approvalModal');
        const btn = approved ? document.getElementById('approveBtn') : document.getElementById('rejectBtn');
        
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Đang xử lý...';

        const response = await apiFetch('/api/task/approve-leave', {
            method: 'POST',
            body: JSON.stringify({
                id,
                approved,
                ghiChu
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast(data.message, 'success');
            modal.classList.add('hidden');
            await loadPendingLeaveRequests();
        } else {
            showToast(data.message || 'Lỗi xử lý', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Lỗi kết nối', 'error');
    }
}
