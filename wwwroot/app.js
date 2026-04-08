import EmployeeDirectory from './components/EmployeeDirectory.js';
import UnifiedTaskForm from './components/UnifiedTaskForm.js';
import EmployeeAttendance from './components/EmployeeAttendance.js';
import EmployeeTasks from './components/EmployeeTasks.js';
import SalaryManagement from './components/SalaryManagement.js';

// Bước 1: Khởi tạo State toàn cục (Xóa session cũ để luôn bắt đầu ở trang đăng nhập)
localStorage.clear(); // Xóa dữ liệu cũ

window.appState = {
    user: null, // Không lấy từ localStorage nữa
    token: null,
    currentTab: 'employees'
};

// Bước 2: Cache DOM
const DOM = {
    authScreen: document.getElementById('auth-screen'),
    appScreen: document.getElementById('app-screen'),
    loginForm: document.getElementById('login-form'),
    loginBtn: document.getElementById('login-btn'),
    viewOutlet: document.getElementById('view-outlet'),
    userLabel: document.getElementById('user-label'),
    logoutBtn: document.getElementById('logout-btn'),
    mainNav: document.getElementById('main-nav')
};

// === Toast ===
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const icon = type === 'success' ? 'fa-check' : 'fa-xmark';
    el.className = `toast-enter flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm`;
    el.innerHTML = `<i class="fa-solid ${icon} w-4 text-center"></i><span class="flex-1">${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
        el.classList.replace('toast-enter', 'toast-leave');
        setTimeout(() => el.remove(), 300);
    }, 3500);
}

// === API Helper ===
export async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (window.appState.token) headers['Authorization'] = `Bearer ${window.appState.token}`;
    return fetch(url, { ...options, headers });
}

// === Auth ===
function initAuth() {
    if (window.appState.token && window.appState.user) {
        DOM.authScreen.classList.add('hidden');
        DOM.appScreen.classList.remove('hidden');
        DOM.userLabel.textContent = window.appState.user.hoTen;
        
        // Render navigation based on Role
        if (window.appState.user.role === 'QuanLy' || window.appState.user.role === 'KeToan') {
            DOM.mainNav.innerHTML = `
                <button data-tab="employees" class="tab-btn">
                    <i class="fa-solid fa-users text-xs"></i> Nhân viên
                </button>
                <button data-tab="workspace" class="tab-btn">
                    <i class="fa-solid fa-pen-ruler text-xs"></i> Phân công
                </button>
                <button data-tab="salary" class="tab-btn">
                    <i class="fa-solid fa-money-bill-wave text-xs"></i> Lương
                </button>
            `;
            if (!['employees', 'workspace', 'salary'].includes(window.appState.currentTab)) {
                window.appState.currentTab = 'employees';
            }
        } else {
            DOM.mainNav.innerHTML = `
                <button data-tab="attendance" class="tab-btn">
                    <i class="fa-solid fa-clock text-xs"></i> Chấm công
                </button>
                <button data-tab="mytasks" class="tab-btn">
                    <i class="fa-solid fa-list-check text-xs"></i> Công việc của tôi
                </button>
                <button data-tab="salary" class="tab-btn">
                    <i class="fa-solid fa-money-bill-wave text-xs"></i> Lương
                </button>
            `;
            if (!['attendance', 'mytasks', 'salary'].includes(window.appState.currentTab)) {
                window.appState.currentTab = 'attendance';
            }
        }
        
        setupTabs();
        switchTab(window.appState.currentTab);
    } else {
        DOM.authScreen.classList.remove('hidden');
        DOM.appScreen.classList.add('hidden');
    }
}

// Bước 3: Login
DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = DOM.loginBtn;
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Đang xác thực...';
    btn.disabled = true;

    try {
        await new Promise(r => setTimeout(r, 800));
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('jwt', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.appState.token = data.token;
            window.appState.user = data.user;
            showToast('Đăng nhập thành công');
            initAuth();
        } else {
            showToast(data.message || 'Sai thông tin đăng nhập', 'error');
        }
    } catch { showToast('Lỗi kết nối máy chủ', 'error'); }
    finally { btn.innerHTML = orig; btn.disabled = false; }
});

// Bước 4: Logout
DOM.logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.appState = { user: null, token: null, currentTab: 'employees' };
    initAuth();
});

// === Tab Navigation ===
function setupTabs() {
    DOM.mainNav.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

export function switchTab(tab) {
    window.appState.currentTab = tab;
    // Update active style
    DOM.mainNav.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('tab-active', btn.dataset.tab === tab);
    });
    // Render component
    DOM.viewOutlet.innerHTML = '';
    DOM.viewOutlet.classList.add('fade-in');
    
    if (tab === 'employees') EmployeeDirectory.render(DOM.viewOutlet);
    else if (tab === 'workspace') UnifiedTaskForm.render(DOM.viewOutlet);
    else if (tab === 'attendance') EmployeeAttendance.render(DOM.viewOutlet);
    else if (tab === 'mytasks') EmployeeTasks.render(DOM.viewOutlet);
    else if (tab === 'salary') SalaryManagement.render(DOM.viewOutlet);
    
    setTimeout(() => DOM.viewOutlet.classList.remove('fade-in'), 300);
}

document.addEventListener('DOMContentLoaded', initAuth);
