import { apiFetch } from '../app.js';

export const CurrentlyWorkingStatus = {
    async render(container) {
        container.innerHTML = `
            <div class="p-6 bg-white rounded-lg shadow">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Nhân viên đang làm việc</h2>
                    <button 
                        onclick="location.reload()"
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Làm mới
                    </button>
                </div>
                <div id="workingList" class="space-y-4 max-h-96 overflow-y-auto"></div>
                <div id="noData" class="text-gray-500 text-center py-4">
                    Đang tải dữ liệu...
                </div>
            </div>
        `;

        await this.loadCurrentlyWorking();
    },

    async loadCurrentlyWorking() {
        try {
            const response = await apiFetch('/api/task/currently-working');
            
            if (!response.ok) {
                document.getElementById('noData').innerHTML = 'Lỗi tải dữ liệu';
                return;
            }

            const workingList = await response.json();
            const container = document.getElementById('workingList');
            const noData = document.getElementById('noData');

            if (workingList.length === 0) {
                container.innerHTML = '';
                noData.innerHTML = 'Tất cả nhân viên đã kết thúc ca làm việc';
                return;
            }

            noData.innerHTML = '';
            container.innerHTML = workingList.map((worker, index) => `
                <div class="flex items-center justify-between p-4 bg-green-50 border-l-4 border-green-500 rounded">
                    <div class="flex-1">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                                ${index + 1}
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800">${worker.hoTen}</p>
                                <p class="text-sm text-gray-600">${worker.maNV} • ${worker.email}</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-green-600">
                            Vào lúc: ${worker.checkInTime}
                        </div>
                        <div class="text-sm text-gray-600 mt-1">
                            Làm được: ${worker.timeWorked}h
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Lỗi:', error);
            document.getElementById('noData').innerHTML = `Lỗi: ${error.message}`;
        }
    }
};
