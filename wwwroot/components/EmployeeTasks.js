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
        
        // Since there is no API to fetch tasks specific to the assigned employee yet, we mock fetching from a hypothetical endpoint or just show empty 
        // For demonstration purposes, we will display a mock empty message until a real API is connected
        setTimeout(() => {
            const body = document.getElementById('task-list-body');
            if (body) {
                // In a real application, you would do a fetch here.
                // e.g. const res = await fetch('/api/Task/my-tasks', { headers: { Authorization: ...} })
                body.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-surface-500 italic">Chưa có công việc nào được phân công.</td></tr>`;
            }
        }, 500);
    }
}
