import { apiFetch, showToast } from '../app.js';

export default {
    async render(container) {
        const maNv = window.appState.user?.MaNV || window.appState.user?.maNV;
        const hoTen = window.appState.user?.HoTen || window.appState.user?.hoTen;

        container.innerHTML = `
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-surface-900 mb-2">Chấm Công Hôm Nay</h1>
                <p class="text-lg text-surface-600">Ghi nhận giờ vào và ra làm việc</p>
            </div>

            <!-- Today's Attendance -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <p class="text-sm text-surface-600 mb-1">Nhân Viên</p>
                        <p class="text-2xl font-bold text-surface-900">${hoTen}</p>
                        <p class="text-sm text-primary-500 font-semibold mt-1">Mã: ${maNv}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-surface-600 mb-1">Hôm Nay</p>
                        <p class="text-2xl font-bold text-surface-900" id="today-date">${new Date().toLocaleDateString('vi-VN')}</p>
                        <p class="text-sm text-surface-500 mt-1" id="current-time">${new Date().toLocaleTimeString('vi-VN')}</p>
                    </div>
                </div>

                <div id="attendance-summary" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-blue-600 font-semibold mb-1">Vào Ca</p>
                        <p class="text-2xl font-bold text-blue-700" id="check-in-time">--:--:--</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <p class="text-sm text-red-600 font-semibold mb-1">Ra Ca</p>
                        <p class="text-2xl font-bold text-red-700" id="check-out-time">--:--:--</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <p class="text-sm text-green-600 font-semibold mb-1">Giờ Làm</p>
                        <p class="text-2xl font-bold text-green-700" id="hours-worked">--:--</p>
                    </div>
                </div>

                <div class="flex gap-4 justify-center">
                    <button id="checkin-btn" class="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fa-solid fa-sign-in-alt"></i> Vào Ca
                    </button>
                    <button id="checkout-btn" disabled class="px-8 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition flex items-center gap-2 shadow-lg disabled:cursor-not-allowed">
                        <i class="fa-solid fa-sign-out-alt"></i> Ra Ca
                    </button>
                </div>
            </div>

            <!-- Status Info -->
            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                <i class="fa-solid fa-info-circle text-blue-600 mr-3"></i>
                <span class="text-blue-700"><strong>Hướng dẫn:</strong> Nhấn "Vào Ca" khi vào công ty, nhấn "Ra Ca" khi rời công ty để ghi nhận giờ làm</span>
            </div>

            <!-- Attendance History -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 class="text-2xl font-bold text-surface-900 mb-4">Lịch Sử Chấm Công (7 Ngày Gần Đây)</h2>
                <div id="history-content" class="text-center py-8">
                    <i class="fa-solid fa-spinner text-primary-500 text-3xl animate-spin"></i>
                    <p class="text-surface-600 mt-3">Đang tải...</p>
                </div>
            </div>
        `;

        // Update time every second
        setInterval(() => {
            const timeEl = document.getElementById('current-time');
            if (timeEl) {
                timeEl.innerText = new Date().toLocaleTimeString('vi-VN');
            }
        }, 1000);

        // Load today's attendance
        await loadTodayAttendance();

        // Load history
        await loadAttendanceHistory();

        // Button handlers
        document.getElementById('checkin-btn').addEventListener('click', handleCheckIn);
        document.getElementById('checkout-btn').addEventListener('click', handleCheckOut);
    }
};

async function loadTodayAttendance() {
    try {
        const response = await apiFetch('/api/task/attendance-history');
        if (!response.ok) throw new Error('Failed to load data');

        const history = await response.json();
        const maNv = window.appState.user?.MaNV || window.appState.user?.maNV;
        const today = new Date().toISOString().split('T')[0];

        const checkInEl = document.getElementById('check-in-time');
        const checkOutEl = document.getElementById('check-out-time');
        const hoursEl = document.getElementById('hours-worked');
        const checkinBtn = document.getElementById('checkin-btn');
        const checkoutBtn = document.getElementById('checkout-btn');

        // Find today's record
        const todayRecord = history.find(r => r.date === today);

        if (todayRecord) {
            console.log('[EmployeeAttendance] ✓ Found today record:', todayRecord);
            checkInEl.innerText = todayRecord.checkIn;
            checkOutEl.innerText = todayRecord.checkOut;
            hoursEl.innerText = todayRecord.hours;

            // If both times exist, disable both buttons
            if (todayRecord.checkIn !== '--:--:--' && todayRecord.checkOut !== '--:--:--') {
                checkinBtn.disabled = true;
                checkoutBtn.disabled = true;
            }
            // If only check-in exists, enable check-out
            else if (todayRecord.checkIn !== '--:--:--') {
                checkinBtn.disabled = true;
                checkoutBtn.disabled = false;
            }
        } else {
            console.log('[EmployeeAttendance] No record for today yet');
            checkInEl.innerText = '--:--:--';
            checkOutEl.innerText = '--:--:--';
            hoursEl.innerText = '--:--';
            checkinBtn.disabled = false;
            checkoutBtn.disabled = true;
        }
    } catch (error) {
        console.error('[EmployeeAttendance] Error loading today:', error);
        // Default state on error
        document.getElementById('checkin-btn').disabled = false;
        document.getElementById('checkout-btn').disabled = true;
    }
}

async function handleCheckIn() {
    const btn = document.getElementById('checkin-btn');
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã chấm vào';

        const response = await apiFetch('/api/task/checkin', { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            showToast('✓ Chấm vào thành công!', 'success');
            // Update UI
            document.getElementById('check-in-time').innerText = new Date().toLocaleTimeString('vi-VN');
            document.getElementById('checkout-btn').disabled = false;
        } else {
            showToast(data.message || 'Lỗi chấm vào', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Vào Ca';
        }
    } catch (error) {
        console.error('[EmployeeAttendance] Check-in error:', error);
        showToast('Lỗi kết nối', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Vào Ca';
    }
}

async function handleCheckOut() {
    const btn = document.getElementById('checkout-btn');
    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã chấm ra';

        const response = await apiFetch('/api/task/checkout', { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            showToast('✓ Chấm ra thành công!', 'success');
            // Update UI
            document.getElementById('check-out-time').innerText = new Date().toLocaleTimeString('vi-VN');
            document.getElementById('checkin-btn').disabled = true;
            document.getElementById('checkin-btn').innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Vào Ca';
        } else {
            showToast(data.message || 'Lỗi chấm ra', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> Ra Ca';
        }
    } catch (error) {
        console.error('[EmployeeAttendance] Check-out error:', error);
        showToast('Lỗi kết nối', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> Ra Ca';
    }
}

async function loadAttendanceHistory() {
    try {
        const historyEl = document.getElementById('history-content');
        const maNv = window.appState.user?.MaNV || window.appState.user?.maNV;

        console.log('[EmployeeAttendance] Tải lịch sử chấm công...');

        // Call real API to get history
        const response = await apiFetch('/api/task/attendance-history');
        console.log('[EmployeeAttendance] API response status:', response.status);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const history = await response.json();
        console.log('[EmployeeAttendance] ✓ Loaded', history.length, 'records');

        if (history.length === 0) {
            historyEl.innerHTML = `
                <div class="text-center py-8">
                    <i class="fa-solid fa-inbox text-gray-300 text-3xl mb-3"></i>
                    <p class="text-surface-500">Chưa có lịch sử chấm công</p>
                </div>
            `;
            return;
        }

        historyEl.innerHTML = `
            <table class="w-full text-sm">
                <thead class="border-b border-gray-200 bg-surface-50">
                    <tr>
                        <th class="text-left px-4 py-3 text-surface-600 font-semibold">Ngày</th>
                        <th class="text-center px-4 py-3 text-surface-600 font-semibold">Vào</th>
                        <th class="text-center px-4 py-3 text-surface-600 font-semibold">Ra</th>
                        <th class="text-right px-4 py-3 text-surface-600 font-semibold">Giờ Làm</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(record => `
                    <tr class="border-b border-gray-100 hover:bg-surface-50">
                        <td class="px-4 py-3 font-medium text-surface-900">${new Date(record.date).toLocaleDateString('vi-VN')}</td>
                        <td class="text-center px-4 py-3 text-blue-600 font-semibold">${record.checkIn}</td>
                        <td class="text-center px-4 py-3 text-red-600 font-semibold">${record.checkOut}</td>
                        <td class="text-right px-4 py-3 text-green-600 font-bold">${record.hours}h</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('[EmployeeAttendance] History error:', error);
        const historyEl = document.getElementById('history-content');
        if (historyEl) {
            historyEl.innerHTML = `
                <div class="text-center py-8">
                    <i class="fa-solid fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
                    <p class="text-red-600">Lỗi tải lịch sử: ${error.message}</p>
                </div>
            `;
        }
    }
}
