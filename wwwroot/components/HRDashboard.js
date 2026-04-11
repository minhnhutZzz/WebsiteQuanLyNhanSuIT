export default class HRDashboard {
    static selectedFile = null;

    static render(container) {
        container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 p-8">
                <div class="max-w-7xl mx-auto">
                    <!-- Header -->
                    <div class="mb-8">
                        <h1 class="text-4xl font-bold text-surface-900 mb-2">HR Dashboard</h1>
                        <p class="text-lg text-surface-600">Quản lý phỏng vấn, truyền thông & tin nhắn</p>
                    </div>

                    <!-- Tabs -->
                    <div class="flex gap-2 mb-8 flex-wrap overflow-x-auto pb-2">
                        <button id="tab-interview" class="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition whitespace-nowrap">
                            <i class="fa-solid fa-calendar-check mr-2"></i>Phỏng Vấn
                        </button>
                        <button id="tab-interview-list" class="px-4 py-2 bg-surface-300 text-surface-900 rounded-lg font-semibold hover:bg-surface-400 transition whitespace-nowrap">
                            <i class="fa-solid fa-list mr-2"></i>Danh Sách
                        </button>
                        <button id="tab-facebook" class="px-4 py-2 bg-surface-300 text-surface-900 rounded-lg font-semibold hover:bg-surface-400 transition whitespace-nowrap">
                            <i class="fa-brands fa-facebook mr-2"></i>Đăng Bài
                        </button>
                        <button id="tab-manage-posts" class="px-4 py-2 bg-surface-300 text-surface-900 rounded-lg font-semibold hover:bg-surface-400 transition whitespace-nowrap">
                            <i class="fa-solid fa-list mr-2"></i>Quản Lý
                        </button>
                        <button id="tab-comments" class="px-4 py-2 bg-surface-300 text-surface-900 rounded-lg font-semibold hover:bg-surface-400 transition whitespace-nowrap">
                            <i class="fa-solid fa-comments mr-2"></i>Bình Luận
                        </button>
                        <button id="tab-messages" class="px-4 py-2 bg-surface-300 text-surface-900 rounded-lg font-semibold hover:bg-surface-400 transition whitespace-nowrap">
                            <i class="fa-solid fa-envelope mr-2"></i>Tin Nhắn
                        </button>
                        <button id="tab-auto-reply" class="px-4 py-2 bg-surface-300 text-surface-900 rounded-lg font-semibold hover:bg-surface-400 transition whitespace-nowrap">
                            <i class="fa-solid fa-robot mr-2"></i>Tự Động
                        </button>
                    </div>

                    <!-- Interview Section -->
                    <div id="interview-section" class="bg-white rounded-2xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-surface-900 mb-6">
                            <i class="fa-solid fa-calendar-check text-primary-500 mr-2"></i>Tạo Buổi Phỏng Vấn
                        </h2>

                        <form id="interview-form" class="space-y-6">
                            <div>
                                <label class="block text-sm font-semibold text-surface-900 mb-2">Tiêu Đề <span class="text-red-500">*</span></label>
                                <input type="text" id="interview-title" placeholder="VD: Phỏng vấn Developer Senior" 
                                    class="w-full px-4 py-3 border-2 border-surface-200 rounded-lg focus:border-primary-500 focus:outline-none" required>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-semibold text-surface-900 mb-2">Ngày <span class="text-red-500">*</span></label>
                                    <input type="date" id="interview-date" class="w-full px-4 py-3 border-2 border-surface-200 rounded-lg focus:border-primary-500 focus:outline-none" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold text-surface-900 mb-2">Giờ <span class="text-red-500">*</span></label>
                                    <input type="time" id="interview-time" class="w-full px-4 py-3 border-2 border-surface-200 rounded-lg focus:border-primary-500 focus:outline-none" required>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-surface-900 mb-2">Chọn Phòng <span class="text-red-500">*</span></label>
                                <div id="room-selector" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-surface-900 mb-2">Nhân Viên <span class="text-red-500">*</span></label>
                                <div id="participants-selector" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div>
                                <p id="participants-count" class="text-sm text-surface-600 mt-2">Chưa chọn</p>
                            </div>

                            <div class="flex gap-3 pt-4">
                                <button type="submit" class="flex-1 bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition">Tạo</button>
                                <button type="reset" class="flex-1 bg-surface-300 text-surface-900 py-3 rounded-lg font-semibold hover:bg-surface-400 transition">Xóa</button>
                            </div>
                        </form>
                        <div id="interview-success" class="hidden mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                            <i class="fa-solid fa-check-circle mr-2"></i><span></span>
                        </div>

                        <!-- Danh sách buổi phỏng vấn -->
                        <div class="mt-8 border-t-2 border-surface-200 pt-8">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-xl font-bold text-surface-900">Danh Sách Buổi Phỏng Vấn</h3>
                                <button id="refresh-interviews" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                                    <i class="fa-solid fa-sync mr-2"></i>Refresh
                                </button>
                            </div>
                            <div id="interviews-list" class="space-y-3"><div class="animate-pulse h-20 bg-surface-200 rounded-lg"></div></div>
                        </div>
                    </div>

                    <!-- Facebook Section -->
                    <div id="facebook-section" class="hidden bg-white rounded-2xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-surface-900 mb-6"><i class="fa-brands fa-facebook text-blue-600 mr-2"></i>Đăng Bài Facebook</h2>
                        <form id="facebook-form" class="space-y-6">
                            <div>
                                <label class="block text-sm font-semibold text-surface-900 mb-2">Nội Dung <span class="text-red-500">*</span></label>
                                <textarea id="facebook-content" placeholder="Nhập nội dung..." rows="6" class="w-full px-4 py-3 border-2 border-surface-200 rounded-lg focus:border-blue-600 focus:outline-none resize-none" required></textarea>
                                <p id="char-count" class="text-sm text-surface-600 mt-1">0 ký tự</p>
                            </div>

                            <div>
                                <label class="block text-sm font-semibold text-surface-900 mb-2"><i class="fa-solid fa-image mr-2"></i>Media (Tuỳ Chọn)</label>
                                <div class="border-2 border-dashed border-surface-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer" id="upload-area">
                                    <input type="file" id="facebook-media" accept="image/*,video/*" class="hidden">
                                    <i class="fa-solid fa-cloud-arrow-up text-3xl text-surface-400 mb-2 block"></i>
                                    <p class="text-surface-600 font-semibold">Kéo & thả hoặc <span class="text-blue-600 underline">chọn</span></p>
                                    <div id="file-chosen" class="hidden mt-3 text-green-600">
                                        <i class="fa-solid fa-check-circle mr-2"></i><span id="file-name"></span>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-surface-50 border-2 border-surface-200 rounded-lg p-4">
                                <p class="text-xs font-semibold text-surface-600 mb-2">Xem Trước</p>
                                <div id="facebook-preview" class="text-surface-900"></div>
                            </div>

                            <div class="flex gap-3 pt-4">
                                <button type="submit" class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Đăng</button>
                                <button type="reset" class="flex-1 bg-surface-300 text-surface-900 py-3 rounded-lg font-semibold">Xóa</button>
                            </div>
                        </form>
                        <div id="facebook-success" class="hidden mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                            <i class="fa-solid fa-check-circle mr-2"></i><span></span>
                        </div>
                    </div>

                    <!-- Interview List Section -->
                    <div id="interview-list-section" class="hidden">
                        <div class="flex justify-between items-center mb-8">
                            <h2 class="text-3xl font-bold text-surface-900"><i class="fa-solid fa-calendar-check text-primary-500 mr-3"></i>Danh Sách Buổi Phỏng Vấn</h2>
                            <button id="refresh-interviews-list" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                                <i class="fa-solid fa-sync mr-2"></i>Refresh
                            </button>
                        </div>
                        <div id="interviews-list-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div class="col-span-full text-center py-12"><i class="fa-solid fa-spinner text-4xl text-primary-500 fa-spin mb-4"></i><p class="text-surface-600">Đang tải...</p></div></div>
                    </div>

                    <!-- Manage Posts Section -->
                    <div id="manage-posts-section" class="hidden bg-white rounded-2xl shadow-lg p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-surface-900"><i class="fa-solid fa-list text-primary-500 mr-2"></i>Quản Lý Bài Đăng</h2>
                            <button id="refresh-posts" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                                <i class="fa-solid fa-sync mr-2"></i>Refresh
                            </button>
                        </div>
                        <div id="posts-list" class="space-y-4"><div class="animate-pulse h-20 bg-surface-200 rounded-lg"></div></div>
                    </div>

                    <!-- Comments Section -->
                    <div id="comments-section" class="hidden bg-white rounded-2xl shadow-lg p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-surface-900"><i class="fa-solid fa-comments text-primary-500 mr-2"></i>Bình Luận</h2>
                            <select id="post-selector" class="px-4 py-2 border-2 border-surface-200 rounded-lg focus:border-primary-500">
                                <option value="">-- Chọn bài đăng --</option>
                            </select>
                        </div>
                        <div id="comments-list" class="space-y-4"><p class="text-center text-surface-600 py-8">Chọn bài để xem bình luận</p></div>
                    </div>

                    <!-- Messages Section -->
                    <div id="messages-section" class="hidden bg-white rounded-2xl shadow-lg p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-surface-900"><i class="fa-solid fa-envelope text-primary-500 mr-2"></i>Tin Nhắn Đến</h2>
                            <button id="refresh-messages" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                                <i class="fa-solid fa-sync mr-2"></i>Refresh
                            </button>
                        </div>
                        <div id="messages-list" class="space-y-4"><div class="animate-pulse h-20 bg-surface-200 rounded-lg"></div></div>
                    </div>

                    <!-- Auto Reply Section -->
                    <div id="auto-reply-section" class="hidden bg-white rounded-2xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-surface-900 mb-6"><i class="fa-solid fa-robot text-primary-500 mr-2"></i>Trả Lời Tự Động</h2>
                        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                            <p class="text-sm text-blue-600"><i class="fa-solid fa-info-circle mr-2"></i>Tin nhắn sẽ được gửi tự động khi có người nhắn</p>
                        </div>
                        <form id="auto-reply-form" class="space-y-6">
                            <div>
                                <label class="block text-sm font-semibold text-surface-900 mb-2">Nội Dung Tin Nhắn <span class="text-red-500">*</span></label>
                                <textarea id="auto-reply-message" placeholder="VD: Xin cảm ơn, chúng tôi sẽ phản hồi sớm..." rows="5" class="w-full px-4 py-3 border-2 border-surface-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none" required></textarea>
                                <p id="auto-reply-char-count" class="text-sm text-surface-600 mt-1">0 ký tự</p>
                            </div>
                            <div class="flex gap-3 pt-4">
                                <button type="submit" class="flex-1 bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition">Lưu</button>
                                <button type="reset" class="flex-1 bg-surface-300 text-surface-900 py-3 rounded-lg font-semibold">Xóa</button>
                            </div>
                        </form>
                        <div id="auto-reply-success" class="hidden mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                            <i class="fa-solid fa-check-circle mr-2"></i><span></span>
                        </div>
                    </div>

                    <!-- Loading Overlay -->
                    <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 text-center">
                            <div class="inline-block mb-4">
                                <i class="fa-solid fa-spinner text-primary-500 text-3xl fa-spin"></i>
                            </div>
                            <p class="text-surface-900 font-semibold">Đang xử lý...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupListeners();
    }

    static setupListeners() {
        const tabs = ['tab-interview', 'tab-interview-list', 'tab-facebook', 'tab-manage-posts', 'tab-comments', 'tab-messages', 'tab-auto-reply'];
        const sections = ['interview-section', 'interview-list-section', 'facebook-section', 'manage-posts-section', 'comments-section', 'messages-section', 'auto-reply-section'];

        const switchTab = (tabId, sectionId) => {
            tabs.forEach((id, i) => {
                document.getElementById(id).classList.add('bg-surface-300', 'text-surface-900');
                document.getElementById(id).classList.remove('bg-primary-500', 'text-white');
                document.getElementById(sections[i]).classList.add('hidden');
            });
            document.getElementById(tabId).classList.remove('bg-surface-300', 'text-surface-900');
            document.getElementById(tabId).classList.add('bg-primary-500', 'text-white');
            document.getElementById(sectionId).classList.remove('hidden');
        };

        document.getElementById('tab-interview').addEventListener('click', () => { switchTab('tab-interview', 'interview-section'); this.loadInterviews(); });
        document.getElementById('tab-interview-list').addEventListener('click', () => { switchTab('tab-interview-list', 'interview-list-section'); this.loadInterviewsList(); });
        document.getElementById('tab-facebook').addEventListener('click', () => switchTab('tab-facebook', 'facebook-section'));
        document.getElementById('tab-manage-posts').addEventListener('click', () => { switchTab('tab-manage-posts', 'manage-posts-section'); this.loadPosts(); });
        document.getElementById('tab-comments').addEventListener('click', () => { switchTab('tab-comments', 'comments-section'); this.loadPosts(); });
        document.getElementById('tab-messages').addEventListener('click', () => { switchTab('tab-messages', 'messages-section'); this.loadMessages(); });
        document.getElementById('tab-auto-reply').addEventListener('click', () => { switchTab('tab-auto-reply', 'auto-reply-section'); this.loadAutoReplySettings(); });

        this.loadRooms();
        this.loadParticipants();

        document.getElementById('interview-form').addEventListener('submit', (e) => { e.preventDefault(); this.submitInterview(); });
        document.getElementById('facebook-form').addEventListener('submit', (e) => { e.preventDefault(); this.submitFacebook(); });
        document.getElementById('auto-reply-form').addEventListener('submit', (e) => { e.preventDefault(); this.saveAutoReplySettings(); });

        document.getElementById('facebook-content').addEventListener('input', (e) => {
            document.getElementById('char-count').textContent = `${e.target.value.length} ký tự`;
            document.getElementById('facebook-preview').textContent = e.target.value;
        });

        document.getElementById('auto-reply-message').addEventListener('input', (e) => {
            document.getElementById('auto-reply-char-count').textContent = `${e.target.value.length} ký tự`;
        });

        ['upload-area', 'facebook-media'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'upload-area') el.addEventListener('click', () => document.getElementById('facebook-media').click());
            el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('border-blue-500', 'bg-blue-50'); });
            el.addEventListener('dragleave', () => el.classList.remove('border-blue-500', 'bg-blue-50'));
            el.addEventListener('drop', (e) => { e.preventDefault(); el.classList.remove('border-blue-500', 'bg-blue-50'); if (e.dataTransfer.files.length) this.setFile(e.dataTransfer.files[0]); });
            el.addEventListener('change', (e) => { if (e.target.files.length) this.setFile(e.target.files[0]); });
        });

        document.getElementById('refresh-posts').addEventListener('click', () => this.loadPosts());
        document.getElementById('refresh-messages').addEventListener('click', () => this.loadMessages());
        document.getElementById('refresh-interviews').addEventListener('click', () => this.loadInterviews());
        document.getElementById('refresh-interviews-list').addEventListener('click', () => this.loadInterviewsList());
        document.getElementById('post-selector').addEventListener('change', (e) => e.target.value ? this.loadComments(e.target.value) : (document.getElementById('comments-list').innerHTML = '<p class="text-center text-surface-600 py-8">Chọn bài để xem bình luận</p>'));
    }

    static setFile(file) {
        this.selectedFile = file;
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-chosen').classList.remove('hidden');
    }

    static async loadRooms() {
        try {
            const response = await fetch('/api/hr/rooms');
            const rooms = await response.json();
            const selector = document.getElementById('room-selector');
            selector.innerHTML = rooms.map(r => `
                <label class="border-2 border-surface-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition">
                    <input type="radio" name="room" value="${r.id}" data-room="${r.name}" class="mr-2">
                    <span class="font-semibold text-surface-900">${r.name}</span><br><span class="text-xs text-surface-500">${r.capacity} người</span>
                </label>
            `).join('');
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async loadParticipants() {
        try {
            const response = await fetch('/api/hr/employees');
            const employees = await response.json();
            const selector = document.getElementById('participants-selector');
            selector.innerHTML = employees.map(e => `
                <label class="border-2 border-surface-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition">
                    <input type="checkbox" name="participants" value="${e.id}" class="mr-2">
                    <span class="font-semibold text-surface-900">${e.name}</span>
                </label>
            `).join('');

            selector.querySelectorAll('input[type="checkbox"]').forEach(el => {
                el.addEventListener('change', () => {
                    const count = selector.querySelectorAll('input:checked').length;
                    document.getElementById('participants-count').textContent = count === 0 ? 'Chưa chọn' : `Đã chọn ${count}`;
                    el.parentElement.classList.toggle('border-primary-500');
                    el.parentElement.classList.toggle('bg-primary-50');
                });
            });
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async submitInterview() {
        const title = document.getElementById('interview-title').value;
        const date = document.getElementById('interview-date').value;
        const time = document.getElementById('interview-time').value;
        const room = document.querySelector('input[name="room"]:checked');
        const participants = Array.from(document.querySelectorAll('input[name="participants"]:checked')).map(i => i.value);
        const editId = document.getElementById('interview-form').dataset.editId;

        if (!room || participants.length === 0) {
            alert('Vui lòng chọn phòng và ít nhất 1 nhân viên');
            return;
        }

        document.getElementById('loading-overlay').classList.remove('hidden');

        try {
            const endpoint = editId ? `/api/hr/interviews/${editId}` : '/api/hr/create-interview';
            const method = editId ? 'PUT' : 'POST';
            
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, room: room.dataset.room, dateTime: `${date}T${time}`, participants })
            });

            const result = await response.json();
            
            if (response.ok) {
                document.getElementById('interview-success').classList.remove('hidden');
                document.getElementById('interview-success').querySelector('span').textContent = 
                    editId ? 'Cập nhật thành công!' : 'Tạo mới thành công!';
                document.getElementById('interview-form').reset();
                delete document.getElementById('interview-form').dataset.editId;
                this.loadInterviews();
                this.loadInterviewsList();
                setTimeout(() => document.getElementById('interview-success').classList.add('hidden'), 3000);
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể lưu'));
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        } finally {
            document.getElementById('loading-overlay').classList.add('hidden');
        }
    }

    static async submitFacebook() {
        const content = document.getElementById('facebook-content').value.trim();
        if (!content) { alert('Nhập nội dung'); return; }

        document.getElementById('loading-overlay').classList.remove('hidden');

        try {
            const formData = new FormData();
            formData.append('message', content);
            if (this.selectedFile) formData.append('file', this.selectedFile);

            const response = await fetch('/api/hr/post-facebook-with-media', { method: 'POST', body: formData });
            const result = await response.json();

            if (response.ok) {
                document.getElementById('facebook-success').classList.remove('hidden');
                document.getElementById('facebook-form').reset();
                this.selectedFile = null;
                document.getElementById('char-count').textContent = '0 ký tự';
                document.getElementById('file-chosen').classList.add('hidden');
                setTimeout(() => document.getElementById('facebook-success').classList.add('hidden'), 3000);
            } else {
                alert('Lỗi: ' + (result.error || result.message));
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        } finally {
            document.getElementById('loading-overlay').classList.add('hidden');
        }
    }

    static async loadPosts() {
        try {
            const response = await fetch('/api/hr/facebook-posts');
            const result = await response.json();

            if (result.success) {
                const posts = JSON.parse(result.data).data || [];
                
                // Update selector
                const selector = document.getElementById('post-selector');
                selector.innerHTML = '<option value="">-- Chọn bài đăng --</option>' + posts.map(p => `<option value="${p.id}">${p.message?.substring(0, 40) || 'Không tiêu đề'}</option>`).join('');

                // Update list
                const list = document.getElementById('posts-list');
                list.innerHTML = posts.length ? posts.map(p => `
                    <div class="border-2 border-surface-200 rounded-lg p-4">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <p class="font-semibold">${p.message || 'Không tiêu đề'}</p>
                                <p class="text-xs text-surface-500 mt-1">${new Date(p.created_time).toLocaleString('vi-VN')}</p>
                            </div>
                            <button class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 delete-post" data-post-id="${p.id}">
                                <i class="fa-solid fa-trash mr-1"></i>Xóa
                            </button>
                        </div>
                    </div>
                `).join('') : '<p class="text-center text-surface-600 py-8">Chưa có bài đăng</p>';

                document.querySelectorAll('.delete-post').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        if (confirm('Xóa bài đăng?')) this.deletePost(e.currentTarget.dataset.postId);
                    });
                });
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async deletePost(postId) {
        try {
            const response = await fetch(`/api/hr/facebook-post/${postId}`, { method: 'DELETE' });
            if ((await response.json()).success) {
                alert('Xóa thành công');
                this.loadPosts();
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    }

    static async loadComments(postId) {
        try {
            const response = await fetch(`/api/hr/facebook-post/${postId}/comments`);
            const result = await response.json();
            const comments = JSON.parse(result.data).data || [];
            const list = document.getElementById('comments-list');
            
            list.innerHTML = comments.length ? comments.map(c => `
                <div class="border-2 border-surface-200 rounded-lg p-4">
                    <p class="font-semibold">${c.from?.name || 'Ẩn danh'}</p>
                    <p class="text-surface-800 mt-2">${c.message}</p>
                    <p class="text-xs text-surface-500 mt-1">${new Date(c.created_time).toLocaleString('vi-VN')}</p>
                </div>
            `).join('') : '<p class="text-center text-surface-600 py-8">Không có bình luận</p>';
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async loadMessages() {
        try {
            const response = await fetch('/api/hr/facebook-messages');
            const result = await response.json();
            const messages = JSON.parse(result.data).data || [];
            const list = document.getElementById('messages-list');
            
            list.innerHTML = messages.length ? messages.map((m, i) => `
                <div class="border-2 border-surface-200 rounded-lg p-4">
                    <p class="font-semibold">Cuộc ${i + 1}</p>
                    <p class="text-sm text-surface-600">Cập nhật: ${new Date(m.updated_time).toLocaleString('vi-VN')}</p>
                    <p class="text-xs text-surface-500 mt-1">${m.participants?.length || 0} người</p>
                </div>
            `).join('') : '<p class="text-center text-surface-600 py-8">Không có tin nhắn</p>';
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async loadAutoReplySettings() {
        try {
            const response = await fetch('/api/hr/auto-reply-settings');
            const result = await response.json();
            if (result.data?.autoReply) {
                document.getElementById('auto-reply-message').value = result.data.autoReply;
                document.getElementById('auto-reply-char-count').textContent = `${result.data.autoReply.length} ký tự`;
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async saveAutoReplySettings() {
        const message = document.getElementById('auto-reply-message').value.trim();
        if (!message) { alert('Nhập nội dung'); return; }

        document.getElementById('loading-overlay').classList.remove('hidden');

        try {
            const response = await fetch('/api/hr/auto-reply-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if ((await response.json()).success) {
                document.getElementById('auto-reply-success').classList.remove('hidden');
                setTimeout(() => document.getElementById('auto-reply-success').classList.add('hidden'), 3000);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        } finally {
            document.getElementById('loading-overlay').classList.add('hidden');
        }
    }

    static async loadInterviews() {
        try {
            const response = await fetch('/api/hr/interviews');
            const result = await response.json();
            const interviews = result.data || [];
            const list = document.getElementById('interviews-list');
            
            if (interviews.length === 0) {
                list.innerHTML = '<p class="text-center text-surface-600 py-8">Chưa có buổi phỏng vấn nào</p>';
                return;
            }

            list.innerHTML = interviews.map(i => `
                <div class="border-2 border-primary-200 rounded-lg p-4 bg-primary-50">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <p class="font-bold text-lg text-surface-900">${i.title}</p>
                            <p class="text-sm text-surface-600 mt-1"><i class="fa-solid fa-door-open mr-2"></i>${i.room}</p>
                            <p class="text-sm text-surface-600"><i class="fa-solid fa-calendar mr-2"></i>${new Date(i.dateTime).toLocaleString('vi-VN')}</p>
                            <p class="text-sm text-surface-600"><i class="fa-solid fa-users mr-2"></i>${i.participants?.length || 0} người</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 edit-interview" data-interview-id="${i.id}">
                                <i class="fa-solid fa-edit mr-1"></i>Sửa
                            </button>
                            <button class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 delete-interview" data-interview-id="${i.id}">
                                <i class="fa-solid fa-trash mr-1"></i>Xóa
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add listeners for edit/delete buttons
            document.querySelectorAll('.edit-interview').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.interviewId;
                    const interview = interviews.find(i => i.id === id);
                    if (interview) this.editInterview(interview);
                });
            });

            document.querySelectorAll('.delete-interview').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm('Xóa buổi phỏng vấn này?')) {
                        this.deleteInterview(e.currentTarget.dataset.interviewId);
                    }
                });
            });
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static async loadInterviewsList() {
        try {
            const response = await fetch('/api/hr/interviews');
            const result = await response.json();
            const interviews = result.data || [];
            const list = document.getElementById('interviews-list-container');
            
            if (interviews.length === 0) {
                list.innerHTML = '<div class="col-span-full text-center py-12 bg-surface-50 rounded-xl"><i class="fa-solid fa-inbox text-4xl text-surface-300 mb-3 block"></i><p class="text-surface-600">Chưa có buổi phỏng vấn nào</p></div>';
                return;
            }

            list.innerHTML = interviews.map(i => {
                const dateObj = new Date(i.dateTime);
                const dateStr = dateObj.toLocaleDateString('vi-VN');
                const timeStr = dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
                return `
                    <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-primary-500 overflow-hidden">
                        <!-- Header -->
                        <div class="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-200">
                            <h3 class="text-lg font-bold text-surface-900 truncate">${i.title}</h3>
                            <p class="text-sm text-primary-600 mt-1"><i class="fa-solid fa-door-open mr-2"></i>${i.room}</p>
                        </div>
                        
                        <!-- Content -->
                        <div class="px-6 py-4 space-y-3">
                            <div class="flex items-center gap-2 text-sm">
                                <i class="fa-solid fa-calendar text-primary-500 w-4"></i>
                                <span class="text-surface-700"><strong>${dateStr}</strong> lúc <strong>${timeStr}</strong></span>
                            </div>
                            <div class="flex items-start gap-2 text-sm">
                                <i class="fa-solid fa-users text-primary-500 w-4 mt-0.5 flex-shrink-0"></i>
                                <span class="text-surface-700">${(i.participants && i.participants.length > 0) ? (i.participants.length + ' nhân viên tham gia') : 'Không có tham gia'}</span>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div class="px-6 py-3 bg-surface-50 border-t border-surface-200 flex gap-2">
                            <button class="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition font-medium edit-interview-btn" data-interview-id="${i.id}">
                                <i class="fa-solid fa-edit mr-1"></i>Sửa
                            </button>
                            <button class="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition font-medium delete-interview-btn" data-interview-id="${i.id}">
                                <i class="fa-solid fa-trash mr-1"></i>Xóa
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Add listeners for edit/delete buttons
            document.querySelectorAll('.edit-interview-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.interviewId;
                    const interview = interviews.find(i => i.id === id);
                    if (interview) {
                        this.editInterview(interview);
                        document.getElementById('tab-interview').click();
                    }
                });
            });

            document.querySelectorAll('.delete-interview-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm('Xóa buổi phỏng vấn này?')) {
                        this.deleteInterview(e.currentTarget.dataset.interviewId);
                    }
                });
            });
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }

    static editInterview(interview) {
        document.getElementById('interview-title').value = interview.title;
        const [date, time] = interview.dateTime.split('T');
        document.getElementById('interview-date').value = date;
        document.getElementById('interview-time').value = time.substring(0, 5);
        
        // Select room
        const roomInput = document.querySelector(`input[name="room"][data-room="${interview.room}"]`);
        if (roomInput) roomInput.checked = true;
        
        // Select participants
        const participantInputs = document.querySelectorAll('input[name="participants"]');
        participantInputs.forEach(input => {
            input.checked = interview.participants?.includes(input.value);
            if (input.checked) {
                input.parentElement.classList.add('border-primary-500', 'bg-primary-50');
            } else {
                input.parentElement.classList.remove('border-primary-500', 'bg-primary-50');
            }
        });

        // Store ID for update
        document.getElementById('interview-form').dataset.editId = interview.id;
        
        // Scroll to form
        document.getElementById('interview-form').scrollIntoView({ behavior: 'smooth' });
    }

    static async deleteInterview(id) {
        try {
            const response = await fetch(`/api/hr/interviews/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                alert('Xóa thành công');
                this.loadInterviews();
                this.loadInterviewsList();
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    }
}
