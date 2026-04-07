// === TaskAssignment.js – Form phân công nhiệm vụ cho nhân viên ===
import { showToast, apiFetch } from '../app.js';

const TaskAssignment = {
    render: async (container) => {
        // Bước 1: Render giao diện form phân công
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                <h3 class="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
                    <i class="fa-solid fa-clipboard-list mr-2 text-blue-500"></i>Tạo Mới Nhiệm Vụ
                </h3>
                <form id="taskForm" class="space-y-6">
                    
                    <!-- Bước 2: Vùng chọn nhân viên với Tìm kiếm & Lọc trạng thái -->
                    <div class="space-y-4">
                        <label class="block text-sm font-medium text-gray-700">Chọn Nhân Viên</label>
                        <div class="flex gap-4">
                            <!-- Ô tìm kiếm nhân viên -->
                            <div class="relative flex-1" id="searchContainer">
                                <i class="fa-solid fa-search absolute left-3 top-3.5 text-gray-400"></i>
                                <input type="text" id="devSearch" class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Tìm kiếm theo Tên hoặc Mã NV...">
                                <!-- Dropdown danh sách nhân viên -->
                                <div id="empDropdown" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl hidden dropdown-options"></div>
                            </div>
                            
                            <!-- Bộ lọc trạng thái -->
                            <select id="statusFilter" class="w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer">
                                <option value="all">Tất cả trạng thái</option>
                                <option value="Khả dụng">Khả dụng</option>
                                <option value="Nghỉ phép">Nghỉ phép</option>
                            </select>
                        </div>
                        <input type="hidden" id="selectedMaNV">
                        <!-- Hiển thị nhân viên đã chọn -->
                        <div id="selectedEmpDisplay" class="hidden items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 fade-in">
                             <span><i class="fa-solid fa-user-check mr-1"></i> Đã chọn: <strong id="selectedEmpName"></strong></span>
                             <button type="button" id="clearSelectionBtn" class="text-blue-500 hover:text-red-500 px-2 cursor-pointer outline-none transition-colors"><i class="fa-solid fa-times"></i></button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tên Nhiệm Vụ <span class="text-red-500">*</span></label>
                        <input type="text" id="taskName" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Nhập tên nhiệm vụ...">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
                        <textarea id="taskDesc" rows="3" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" placeholder="Chi tiết công việc..."></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày Bắt Đầu <span class="text-red-500">*</span></label>
                            <input type="date" id="startDate" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hạn Chót <span class="text-red-500">*</span></label>
                            <input type="date" id="endDate" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        </div>
                    </div>

                    <div class="pt-4 border-t border-gray-100 flex justify-end">
                        <button type="submit" id="submitTaskBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg transition duration-200 shadow-sm flex items-center gap-2">
                            <i class="fa-solid fa-paper-plane"></i> Lưu Phân Công
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Bước 3: Lấy danh sách nhân viên thật từ API
        let employees = [];
        try {
            const res = await apiFetch('/api/task/employees');
            if (res.ok) {
                employees = await res.json();
            }
        } catch (err) {
            showToast('Không thể tải danh sách nhân viên.', 'error');
        }

        const searchInput = document.getElementById('devSearch');
        const searchContainer = document.getElementById('searchContainer');
        const statusFilter = document.getElementById('statusFilter');
        const dropdown = document.getElementById('empDropdown');
        const selectedMaNV = document.getElementById('selectedMaNV');
        const selectedEmpDisplay = document.getElementById('selectedEmpDisplay');
        const selectedEmpName = document.getElementById('selectedEmpName');
        const clearSelectionBtn = document.getElementById('clearSelectionBtn');
        const taskForm = document.getElementById('taskForm');
        const submitBtn = document.getElementById('submitTaskBtn');

        // Bước 4: Hàm render dropdown – lọc theo keyword và trạng thái
        const renderDropdown = () => {
            const keyword = searchInput.value.toLowerCase();
            const status = statusFilter.value;
             
            const filtered = employees.filter(emp => {
                const matchKeyword = emp.hoTen.toLowerCase().includes(keyword) || emp.maNV.toLowerCase().includes(keyword);
                const matchStatus = status === 'all' || emp.trangThai === status;
                return matchKeyword && matchStatus;
            });

            dropdown.innerHTML = '';
            if (filtered.length === 0) {
                dropdown.innerHTML = '<div class="p-3 text-sm text-gray-500 text-center">Không tìm thấy nhân viên.</div>';
            } else {
                filtered.forEach(emp => {
                    const item = document.createElement('div');
                    const bgStatus = emp.trangThai === 'Khả dụng' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                    item.className = 'p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-100 last:border-0 transition-colors';
                    item.innerHTML = `
                        <div>
                            <p class="font-medium text-sm text-gray-800">${emp.hoTen}</p>
                            <p class="text-xs text-gray-500">${emp.maNV}</p>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full font-medium ${bgStatus}">${emp.trangThai}</span>
                    `;
                    // Bước 5: Khi click chọn nhân viên từ dropdown
                    item.addEventListener('click', () => {
                        selectedMaNV.value = emp.maNV;
                        selectedEmpName.textContent = `${emp.hoTen} (${emp.maNV})`;
                        selectedEmpDisplay.classList.replace('hidden', 'flex');
                        searchContainer.classList.add('hidden');
                        dropdown.classList.add('hidden');
                    });
                    dropdown.appendChild(item);
                });
            }
        };

        searchInput.addEventListener('focus', () => {
            dropdown.classList.remove('hidden');
            renderDropdown();
        });
        
        searchInput.addEventListener('input', renderDropdown);
        statusFilter.addEventListener('change', () => {
            dropdown.classList.remove('hidden');
            renderDropdown();
        });

        // Bước 6: Xóa lựa chọn nhân viên để chọn lại
        clearSelectionBtn.addEventListener('click', () => {
            selectedMaNV.value = '';
            selectedEmpDisplay.classList.replace('flex', 'hidden');
            searchContainer.classList.remove('hidden');
            searchInput.value = '';
            searchInput.focus();
        });

        // Đóng dropdown khi click bên ngoài
        document.addEventListener('click', (e) => {
            if (searchInput && dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Bước 7: Xử lý submit form – gọi API phân công có Loading 2 giây
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!selectedMaNV.value) {
                showToast('Vui lòng chọn nhân viên muốn giao công việc!', 'error');
                return;
            }

            const reqData = {
                maNV: selectedMaNV.value,
                tenNhiemVu: document.getElementById('taskName').value,
                moTa: document.getElementById('taskDesc').value,
                ngayBatDau: document.getElementById('startDate').value,
                hanChot: document.getElementById('endDate').value
            };

            // Chuyển nút sang trạng thái Loading (UX Requirement: 2 giây)
            const btnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loader-spinner w-5 h-5"></span> Đang xử lý...';
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');

            try {
                // Bước 8: Giả lập độ trễ 2 giây rồi gọi API
                await new Promise(r => setTimeout(r, 2000));

                const res = await apiFetch('/api/task/assign', {
                    method: 'POST',
                    body: JSON.stringify(reqData)
                });
                
                let data;
                try {
                    data = await res.json();
                } catch {
                    data = { message: res.status === 403 ? 'Bạn không có quyền phân công.' : 'Lỗi không xác định.' };
                }
                
                if (res.ok) {
                    // Bước 9: Phân công thành công – reset form
                    showToast(data.message || 'Phân công thành công!', 'success');
                    taskForm.reset();
                    clearSelectionBtn.click();
                } else {
                    // Bước 10: Hệ thống phát hiện lỗi (nhân viên nghỉ phép, thiếu dữ liệu, v.v.)
                    showToast(data.message || 'Lỗi khi phân công.', 'error');
                }
            } catch (err) {
                showToast('Không thể kết nối đến hệ thống máy chủ.', 'error');
            } finally {
                submitBtn.innerHTML = btnText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
        });
    }
};

export default TaskAssignment;
