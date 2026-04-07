import { navigate } from '../app.js';

const Sidebar = {
    render: (container) => {
        container.innerHTML = `
            <div class="p-6">
                <h1 class="text-2xl font-bold text-blue-600 tracking-wider">HR<span class="text-gray-800">PORTAL</span></h1>
            </div>
            <nav class="flex-1 px-4 space-y-2 mt-4 text-sm font-medium">
                <a href="#" data-route="dashboard" class="nav-link flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <i class="fa-solid fa-chart-pie w-5 text-center"></i> Tổng quan
                </a>
                <a href="#" data-route="task" class="nav-link flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors ${window.appState.user?.role !== 'QuanLy' ? 'opacity-50' : ''}">
                    <i class="fa-solid fa-list-check w-5 text-center"></i> Phân công nhiệm vụ
                </a>
                <a href="#" data-route="document" class="nav-link flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors ${window.appState.user?.role !== 'QuanLy' ? 'opacity-50' : ''}">
                    <i class="fa-solid fa-file-invoice w-5 text-center"></i> Cung cấp tài liệu
                </a>
            </nav>
            <div class="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
                © 2026 Core5 System
            </div>
        `;

        const links = container.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route !== 'dashboard' && window.appState.user.role !== 'QuanLy') {
                    import('../app.js').then(module => module.showToast('Truy cập bị từ chối: Chỉ Quản Lý mới có thể dùng tính năng này.', 'error'));
                    return;
                }
                navigate(route);
            });
        });
    },
    
    updateActive: (route) => {
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            if (link.getAttribute('data-route') === route) {
                link.classList.add('bg-blue-50', 'text-blue-600');
                link.classList.remove('text-gray-600');
            } else {
                link.classList.remove('bg-blue-50', 'text-blue-600');
                link.classList.add('text-gray-600');
            }
        });
    }
};

export default Sidebar;
