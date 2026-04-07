// === UnifiedTaskForm.js – Phân công nhiệm vụ + Đính kèm tài liệu (<<extend>>) ===
import { showToast, apiFetch } from '../app.js';

const UnifiedTaskForm = {
    render: async (container) => {
        // Bước 1: Lấy danh sách nhân viên từ API
        let employees = [];
        try {
            const res = await apiFetch('/api/task/employees');
            if (res.ok) employees = await res.json();
        } catch { showToast('Không thể tải danh sách nhân viên', 'error'); }

        // Bước 2: Render Unified Form
        container.innerHTML = `
            <div class="card max-w-2xl">
                <h2 class="text-base font-bold text-surface-900 mb-1">Phân công nhiệm vụ</h2>
                <p class="text-sm text-surface-500 mb-6">Tạo nhiệm vụ mới và giao cho nhân viên. Có thể đính kèm tài liệu tùy chọn.</p>

                <form id="unified-form" class="space-y-5">
                    <!-- Chọn nhân viên -->
                    <div>
                        <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Nhân viên <span class="text-red-500">*</span></label>
                        <div class="relative">
                            <select id="uf-employee" required class="input-field cursor-pointer">
                                <option value="">-- Chọn nhân viên --</option>
                                ${employees.map(emp => {
                                    const suffix = emp.trangThai === 'Nghỉ phép' ? ' ⛔ Nghỉ phép' : '';
                                    return `<option value="${emp.maNV}" data-status="${emp.trangThai}">${emp.hoTen} (${emp.maNV})${suffix}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        <p id="uf-emp-warning" class="hidden text-xs text-red-600 mt-1.5 font-medium">
                            <i class="fa-solid fa-triangle-exclamation"></i> Nhân viên này đang Nghỉ phép – không thể phân công.
                        </p>
                    </div>

                    <!-- Tên nhiệm vụ -->
                    <div>
                        <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Tên nhiệm vụ <span class="text-red-500">*</span></label>
                        <input type="text" id="uf-task-name" required class="input-field" placeholder="Ví dụ: Tối ưu hóa trang Dashboard">
                    </div>

                    <!-- Mô tả -->
                    <div>
                        <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Mô tả</label>
                        <textarea id="uf-desc" rows="3" class="input-field" placeholder="Chi tiết yêu cầu công việc..."></textarea>
                    </div>

                    <!-- Mức độ ưu tiên -->
                    <div>
                        <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Mức độ ưu tiên</label>
                        <div class="flex gap-2" id="priority-group">
                            <button type="button" data-val="Thấp"   class="priority-btn btn-secondary !text-xs flex-1">Thấp</button>
                            <button type="button" data-val="Trung bình" class="priority-btn btn-secondary !text-xs flex-1 active-priority">Trung bình</button>
                            <button type="button" data-val="Cao"    class="priority-btn btn-secondary !text-xs flex-1">Cao</button>
                        </div>
                        <input type="hidden" id="uf-priority" value="Trung bình">
                    </div>

                    <!-- Ngày -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Ngày bắt đầu <span class="text-red-500">*</span></label>
                            <input type="date" id="uf-start" required class="input-field">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Hạn chót <span class="text-red-500">*</span></label>
                            <input type="date" id="uf-end" required class="input-field">
                        </div>
                    </div>

                    <!-- Divider: <<extend>> Đính kèm tài liệu -->
                    <div class="border-t border-surface-200 pt-5">
                        <label class="checkbox-label">
                            <input type="checkbox" id="uf-attach-toggle">
                            <span>Đính kèm tài liệu nghiệp vụ</span>
                            <span class="text-xs text-surface-400 font-normal">(Tùy chọn)</span>
                        </label>
                    </div>

                    <!-- Phần mở rộng: Form tài liệu -->
                    <div id="doc-section" class="hidden space-y-5 pl-5 border-l-2 border-primary-200 fade-in">
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Tệp đính kèm</label>
                            <input type="file" id="uf-file" class="input-field !p-1.5 text-sm" accept=".pdf,.doc,.docx,.xlsx,.ppt,.pptx,.zip">
                            <p class="text-xs text-surface-400 mt-1"><i class="fa-solid fa-circle-info"></i> Tối đa 25MB – PDF, DOC, XLSX, PPT, ZIP</p>
                            <p id="uf-file-error" class="hidden text-xs text-red-600 mt-1 font-medium">
                                <i class="fa-solid fa-triangle-exclamation"></i> File vượt quá 25MB!
                            </p>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Tiêu đề email</label>
                            <input type="text" id="uf-email-title" class="input-field" placeholder="Tài liệu nghiệp vụ dự án XYZ">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wide">Nội dung email</label>
                            <textarea id="uf-email-body" rows="4" class="input-field" placeholder="Kính gửi anh/chị, đính kèm tài liệu liên quan đến..."></textarea>
                        </div>
                    </div>

                    <!-- Submit -->
                    <div class="pt-3 flex justify-end">
                        <button type="submit" id="uf-submit" class="btn-primary">
                            <i class="fa-solid fa-paper-plane text-xs"></i> Lưu phân công
                        </button>
                    </div>
                </form>
            </div>
        `;

        // === DOM ===
        const form = document.getElementById('unified-form');
        const empSelect = document.getElementById('uf-employee');
        const empWarning = document.getElementById('uf-emp-warning');
        const attachToggle = document.getElementById('uf-attach-toggle');
        const docSection = document.getElementById('doc-section');
        const fileInput = document.getElementById('uf-file');
        const fileError = document.getElementById('uf-file-error');
        const priorityGroup = document.getElementById('priority-group');
        const priorityInput = document.getElementById('uf-priority');
        const submitBtn = document.getElementById('uf-submit');
        const modalRoot = document.getElementById('modal-root');

        // Bước 3: Kiểm tra nhân viên Nghỉ phép khi chọn
        empSelect.addEventListener('change', () => {
            const opt = empSelect.selectedOptions[0];
            if (opt && opt.dataset.status === 'Nghỉ phép') {
                empWarning.classList.remove('hidden');
            } else {
                empWarning.classList.add('hidden');
            }
        });

        // Bước 4: Toggle đính kèm tài liệu
        attachToggle.addEventListener('change', () => {
            docSection.classList.toggle('hidden', !attachToggle.checked);
        });

        // Bước 5: Kiểm tra file < 25MB
        fileInput.addEventListener('change', () => {
            if (fileInput.files[0] && fileInput.files[0].size > 25 * 1024 * 1024) {
                fileError.classList.remove('hidden');
                fileInput.value = '';
            } else {
                fileError.classList.add('hidden');
            }
        });

        // Bước 6: Chọn mức độ ưu tiên
        priorityGroup.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                priorityGroup.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active-priority'));
                btn.classList.add('active-priority');
                priorityInput.value = btn.dataset.val;
            });
        });

        // Bước 7: Submit form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validation: nhân viên Nghỉ phép
            const selectedOpt = empSelect.selectedOptions[0];
            if (selectedOpt && selectedOpt.dataset.status === 'Nghỉ phép') {
                showToast('Nhân viên đang Nghỉ phép – không thể phân công!', 'error');
                return;
            }

            const hasAttachment = attachToggle.checked;

            // Nếu có đính kèm tài liệu → hiển thị Modal xem trước
            if (hasAttachment) {
                const emailTitle = document.getElementById('uf-email-title').value || '(Chưa nhập)';
                const emailBody = document.getElementById('uf-email-body').value || '(Chưa nhập)';
                const fileName = fileInput.files[0] ? fileInput.files[0].name : '(Chưa chọn file)';
                const empName = selectedOpt.textContent;

                showPreviewModal(emailTitle, emailBody, fileName, empName, () => {
                    executeSubmit(hasAttachment);
                });
            } else {
                // Không có tài liệu → submit trực tiếp
                executeSubmit(false);
            }
        });

        // === Hàm thực thi submit ===
        async function executeSubmit(withDoc) {
            const btnOrig = submitBtn.innerHTML;
            const loadingText = withDoc
                ? '<span class="spinner"></span> Đồng bộ Calendar & Gmail...'
                : '<span class="spinner"></span> Đồng bộ Google Calendar...';
            submitBtn.innerHTML = loadingText;
            submitBtn.disabled = true;

            try {
                // Bước 8: Giả lập 2 giây loading
                await new Promise(r => setTimeout(r, 2000));

                const reqData = {
                    maNV: empSelect.value,
                    tenNhiemVu: document.getElementById('uf-task-name').value,
                    moTa: document.getElementById('uf-desc').value,
                    ngayBatDau: document.getElementById('uf-start').value,
                    hanChot: document.getElementById('uf-end').value
                };

                const res = await apiFetch('/api/task/assign', {
                    method: 'POST',
                    body: JSON.stringify(reqData)
                });

                let data;
                try { data = await res.json(); }
                catch { data = { message: res.status === 403 ? 'Bạn không có quyền.' : 'Lỗi hệ thống.' }; }

                if (res.ok) {
                    const msg = withDoc
                        ? 'Phân công thành công! Tài liệu đã gửi qua Gmail API.'
                        : data.message || 'Phân công thành công!';
                    showToast(msg);
                    form.reset();
                    docSection.classList.add('hidden');
                    empWarning.classList.add('hidden');
                    priorityGroup.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active-priority'));
                    priorityGroup.querySelector('[data-val="Trung bình"]').classList.add('active-priority');
                    priorityInput.value = 'Trung bình';
                } else {
                    showToast(data.message || 'Lỗi khi phân công.', 'error');
                }
            } catch { showToast('Không thể kết nối máy chủ.', 'error'); }
            finally { submitBtn.innerHTML = btnOrig; submitBtn.disabled = false; }
        }

        // === Modal xem trước email ===
        function showPreviewModal(title, body, file, empName, onConfirm) {
            const formatted = body.replace(/\n/g, '<br>');
            modalRoot.innerHTML = `
                <div class="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl fade-in mx-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-base font-bold text-surface-900">Xem trước Email</h3>
                        <button id="modal-close" class="text-surface-400 hover:text-surface-600 transition-colors cursor-pointer">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="bg-surface-50 border border-surface-200 rounded-lg p-4 space-y-3 text-sm mb-6">
                        <div class="flex gap-2">
                            <span class="text-surface-500 font-medium w-16 shrink-0">Gửi tới:</span>
                            <span class="text-surface-800">${empName}</span>
                        </div>
                        <div class="flex gap-2 border-t border-surface-200 pt-2">
                            <span class="text-surface-500 font-medium w-16 shrink-0">Tiêu đề:</span>
                            <span class="text-surface-800 font-medium">${title}</span>
                        </div>
                        <div class="border-t border-surface-200 pt-2">
                            <span class="text-surface-500 font-medium block mb-1">Nội dung:</span>
                            <div class="text-surface-700 leading-relaxed">${formatted}</div>
                        </div>
                        <div class="flex gap-2 border-t border-surface-200 pt-2">
                            <span class="text-surface-500 font-medium w-16 shrink-0">Tệp:</span>
                            <span class="text-primary-600 font-medium"><i class="fa-solid fa-paperclip text-xs"></i> ${file}</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button id="modal-cancel" class="btn-secondary">Chỉnh sửa</button>
                        <button id="modal-confirm" class="btn-primary">
                            <i class="fa-solid fa-check text-xs"></i> Xác nhận gửi
                        </button>
                    </div>
                </div>
            `;
            modalRoot.classList.remove('hidden');
            modalRoot.classList.add('flex');

            const close = () => { modalRoot.classList.add('hidden'); modalRoot.classList.remove('flex'); };
            document.getElementById('modal-close').addEventListener('click', close);
            document.getElementById('modal-cancel').addEventListener('click', close);
            document.getElementById('modal-confirm').addEventListener('click', () => { close(); onConfirm(); });
        }
    }
};

// CSS cho active priority button (inject once)
if (!document.getElementById('priority-style')) {
    const style = document.createElement('style');
    style.id = 'priority-style';
    style.textContent = `.active-priority { background: #4c6ef5 !important; color: #fff !important; border-color: #4c6ef5 !important; }`;
    document.head.appendChild(style);
}

export default UnifiedTaskForm;
