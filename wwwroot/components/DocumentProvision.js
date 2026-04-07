// === DocumentProvision.js – Form cung cấp tài liệu nghiệp vụ qua Email ===
import { showToast } from '../app.js';

const DocumentProvision = {
    render: (container) => {
        // Bước 1: Render giao diện form cung cấp tài liệu
        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                <h3 class="text-lg font-bold text-gray-800 mb-6 border-b pb-4">
                    <i class="fa-solid fa-envelope-open-text mr-2 text-blue-500"></i>Cung Cấp Tài Liệu Qua Email
                </h3>
                <form id="docForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Người Nhận <span class="text-red-500">*</span></label>
                        <input type="email" id="docEmail" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" placeholder="Ví dụ: partner@gmail.com">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu Đề Email <span class="text-red-500">*</span></label>
                        <input type="text" id="docTitle" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" placeholder="Tài liệu dự án...">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nội Dung Email <span class="text-red-500">*</span></label>
                        <textarea id="docContent" required rows="6" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" placeholder="Kính gửi anh/chị, đây là tài liệu liên quan đến..."></textarea>
                    </div>

                    <div class="pt-4 border-t border-gray-100 flex justify-end">
                        <button type="button" id="previewBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg transition duration-200 shadow-sm flex items-center gap-2">
                            <i class="fa-regular fa-eye"></i> Xem Trước & Gửi
                        </button>
                    </div>
                </form>
            </div>
        `;

        const previewBtn = document.getElementById('previewBtn');
        const modalRoot = document.getElementById('modal-root');
        const docForm = document.getElementById('docForm');

        // Bước 2: Khi ấn Xem trước – hiển thị Modal xác nhận nội dung email
        previewBtn.addEventListener('click', () => {
            const email = document.getElementById('docEmail').value;
            const title = document.getElementById('docTitle').value;
            const content = document.getElementById('docContent').value;

            // Validation: kiểm tra dữ liệu bắt buộc
            if (!email || !title || !content) {
                showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
                return;
            }

            // Bước 3: Render Modal xác nhận với nội dung email preview
            const formattedContent = content.replace(/\n/g, '<br/>');
            modalRoot.innerHTML = `
                <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative fade-in mx-4">
                    <button type="button" id="closeModalCross" class="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                    <div class="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <i class="fa-solid fa-envelope-open-text"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-800">Xác Nhận Gửi Email</h3>
                            <p class="text-xs text-gray-500">Kiểm tra nội dung bên dưới trước khi gửi</p>
                        </div>
                    </div>
                    
                    <!-- Preview nội dung email -->
                    <div class="space-y-3 mb-6 bg-gray-50 border border-gray-200 p-5 rounded-xl">
                        <div class="flex items-center gap-2 text-sm border-b border-gray-200 pb-3">
                            <span class="font-semibold text-gray-500 w-16">Đến:</span>
                            <span class="text-blue-600 font-medium">${email}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm border-b border-gray-200 pb-3">
                            <span class="font-semibold text-gray-500 w-16">Tiêu đề:</span>
                            <span class="text-gray-800 font-medium">${title}</span>
                        </div>
                        <div class="text-sm text-gray-700 pt-2 leading-relaxed">
                            <span class="font-semibold text-gray-500 block mb-2">Nội dung:</span>
                            <div class="bg-white p-3 rounded-lg border border-gray-100">${formattedContent}</div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 font-medium">
                        <button type="button" id="cancelModalBtn" class="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors border border-gray-200">Chỉnh sửa lại</button>
                        <button type="button" id="confirmSendBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-md">
                            <i class="fa-regular fa-paper-plane"></i> <span>Xác Nhận Gửi</span>
                        </button>
                    </div>
                </div>
            `;
            
            modalRoot.classList.remove('hidden');
            modalRoot.classList.add('flex');

            const closeModal = () => {
                modalRoot.classList.add('hidden');
                modalRoot.classList.remove('flex');
            };

            document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
            document.getElementById('closeModalCross').addEventListener('click', closeModal);

            const confirmSendBtn = document.getElementById('confirmSendBtn');
            const cancelModalBtn = document.getElementById('cancelModalBtn');

            // Bước 4: Khi ấn Xác nhận gửi – giả lập Loading 2 giây rồi mock API
            confirmSendBtn.addEventListener('click', async () => {
                const btnContent = confirmSendBtn.innerHTML;
                confirmSendBtn.innerHTML = '<span class="loader-spinner w-4 h-4"></span> <span>Đang gửi qua Gmail API...</span>';
                confirmSendBtn.disabled = true;
                confirmSendBtn.classList.add('btn-loading');
                cancelModalBtn.disabled = true;

                try {
                    // Bước 5: Giả lập gọi SendGmailAPI() – delay 2 giây
                    await new Promise(r => setTimeout(r, 2000));
                    
                    // Mock API thành công – hiển thị Toast
                    showToast('Đã gửi tài liệu thành công qua Google Mail API!', 'success');
                    docForm.reset();
                    closeModal();
                } catch (err) {
                    // Bước 6: Nếu mock trả về lỗi – thực hiện Rollback
                    showToast('Lỗi Network/Timeout. Hệ thống đã tiến hành Rollback!', 'error');
                } finally {
                    confirmSendBtn.innerHTML = btnContent;
                    confirmSendBtn.disabled = false;
                    confirmSendBtn.classList.remove('btn-loading');
                    cancelModalBtn.disabled = false;
                }
            });
        });
    }
};

export default DocumentProvision;
