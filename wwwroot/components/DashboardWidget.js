// === DashboardWidget.js – Hiển thị thống kê tổng quan và biểu đồ ===
import { apiFetch, showToast } from '../app.js';

const DashboardWidget = {
    render: async (container) => {
        // Bước 1: Hiển thị skeleton loading trong khi chờ dữ liệu từ API
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="widget-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-28"></div>
                <div class="widget-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-28"></div>
                <div class="widget-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-28"></div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-80"></div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-80"></div>
            </div>
        `;

        // Bước 2: Gọi API lấy thống kê thật từ data.json qua Backend
        let stats = { tongNhanVien: 0, khaDung: 0, nghiPhep: 0, tongNhiemVu: 0, tongPhanCong: 0 };
        try {
            const res = await apiFetch('/api/task/stats');
            if (res.ok) {
                stats = await res.json();
            }
        } catch (err) {
            showToast('Không thể tải dữ liệu thống kê.', 'error');
        }

        // Bước 3: Render giao diện Dashboard với dữ liệu thực
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="widget-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium mb-1">Tổng Nhân Viên</p>
                        <h3 class="text-3xl font-bold text-gray-800">${stats.tongNhanVien}</h3>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <i class="fa-solid fa-users text-xl"></i>
                    </div>
                </div>
                <div class="widget-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium mb-1">Nhiệm Vụ Đã Tạo</p>
                        <h3 class="text-3xl font-bold text-gray-800">${stats.tongNhiemVu}</h3>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <i class="fa-solid fa-list-check text-xl"></i>
                    </div>
                </div>
                <div class="widget-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 font-medium mb-1">Lượt Phân Công</p>
                        <h3 class="text-3xl font-bold text-gray-800">${stats.tongPhanCong}</h3>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <i class="fa-solid fa-clipboard-check text-xl"></i>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Biểu đồ tỷ lệ trạng thái nhân viên -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Tỷ Lệ Trạng Thái Nhân Viên</h3>
                    <div class="h-64 flex justify-center items-center">
                        <canvas id="statusChart"></canvas>
                    </div>
                    <div class="flex justify-center gap-6 mt-4 text-sm text-gray-600">
                        <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Khả dụng: ${stats.khaDung}</span>
                        <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Nghỉ phép: ${stats.nghiPhep}</span>
                    </div>
                </div>
                
                <!-- Thông tin hệ thống -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Thông Tin Hệ Thống</h3>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-800">Phân quyền RBAC</p>
                                <p class="text-xs text-gray-500">JWT Authentication đang hoạt động</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 p-3 bg-green-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <i class="fa-solid fa-database"></i>
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-800">Mock Database</p>
                                <p class="text-xs text-gray-500">data.json – System.Text.Json</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 p-3 bg-purple-50 rounded-xl">
                            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <i class="fa-brands fa-google"></i>
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-800">Tích hợp bên thứ 3</p>
                                <p class="text-xs text-gray-500">Google Calendar API & Gmail API (Mock)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bước 4: Vẽ biểu đồ Doughnut bằng Chart.js
        const ctx = document.getElementById('statusChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Khả dụng', 'Nghỉ phép'],
                    datasets: [{
                        data: [stats.khaDung, stats.nghiPhep],
                        backgroundColor: ['#3b82f6', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    cutout: '70%'
                }
            });
        }
    }
};

export default DashboardWidget;
