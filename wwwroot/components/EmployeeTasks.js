export default {
    async render(container) {
        container.innerHTML = `
            <div class="mb-6 flex justify-between items-end">
                <div>
                    <h2 class="text-xl font-bold text-surface-900 tracking-tight">Công việc của tôi</h2>
                    <p class="text-sm text-surface-500 mt-1">Danh sách các nhiệm vụ được phân công cho bạn</p>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold">
                        <tr>
                            <th class="px-6 py-4">Tên nhiệm vụ</th>
                            <th class="px-6 py-4">Mô tả</th>
                            <th class="px-6 py-4">Bắt đầu</th>
                            <th class="px-6 py-4">Hạn chót</th>
                            <th class="px-6 py-4">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-200 text-surface-800" id="task-list-body">
                        <tr><td colspan="5" class="px-6 py-4 text-center text-surface-500">Đang tải dữ liệu...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        
        // Load tasks from API
        try {
            console.log('[EmployeeTasks] Đang tải công việc...');
            
            const { apiFetch } = await import('../app.js');
            const res = await apiFetch('/api/task/my-tasks');
            console.log('[EmployeeTasks] API response status:', res.status);
            
            const body = document.getElementById('task-list-body');
            if (!body) return;
            
            if (res.ok) {
                const tasks = await res.json();
                console.log('[EmployeeTasks] ✓ Loaded', tasks.length, 'tasks');
                
                if (tasks.length === 0) {
                    body.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-surface-500 italic">Chưa có công việc nào được phân công.</td></tr>`;
                    return;
                }
                
                body.innerHTML = tasks.map(task => `
                    <tr class="hover:bg-surface-50 transition">
                        <td class="px-6 py-4 font-medium text-surface-900">${task.TenNhiemVu || '-'}</td>
                        <td class="px-6 py-4 text-surface-600">${task.MoTa || '-'}</td>
                        <td class="px-6 py-4">${task.NgayBatDau ? new Date(task.NgayBatDau).toLocaleDateString('vi-VN') : '-'}</td>
                        <td class="px-6 py-4">${task.HanChot ? new Date(task.HanChot).toLocaleDateString('vi-VN') : '-'}</td>
                        <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${task.TrangThai === 'Hoàn thành' ? 'bg-green-100 text-green-700' : task.TrangThai === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}">
                                ${task.TrangThai || 'Mới'}
                            </span>
                        </td>
                    </tr>
                `).join('');
            } else {
                console.error('[EmployeeTasks] ✗ API error:', res.status);
                body.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-600">Lỗi: ${res.status}</td></tr>`;
            }
        } catch (error) {
            console.error('[EmployeeTasks] ✗ Exception:', error);
            const body = document.getElementById('task-list-body');
            if (body) {
                body.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-600">Lỗi tải dữ liệu</td></tr>`;
            }
        }
    }
}
