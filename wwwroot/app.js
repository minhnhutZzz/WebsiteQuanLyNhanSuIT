import EmployeeDirectory from './components/EmployeeDirectory.js';
import UnifiedTaskForm from './components/UnifiedTaskForm.js';
import EmployeeAttendance from './components/EmployeeAttendance.js';
import EmployeeTasks from './components/EmployeeTasks.js';
import HomePage from './components/HomePage.js';
import AboutPage from './components/AboutPage.js';
import HRDashboard from './components/HRDashboard.js';
import DashboardWidget from './components/DashboardWidget.js';
import HeaderFooter from './components/Header.js';
// import SalaryManagement from './components/SalaryManagement.js';

// Bước 1: Khởi tạo State toàn cục
window.appState = {
    user: null,
    token: null,
    currentTab: 'employees',
    currentPage: 'home' // Track current page (home, about, dashboard, profile, login)
};

// Check if user is already logged-in (from localStorage)
const savedToken = localStorage.getItem('jwt');
const savedUser = localStorage.getItem('user');
if (savedToken && savedUser && savedUser !== 'undefined') {
    try {
        window.appState.token = savedToken;
        window.appState.user = JSON.parse(savedUser);
    } catch (e) {
        console.log('Failed to parse saved user:', e);
        localStorage.clear();
    }
}

// Bước 2: Cache DOM
const DOM = {
    authScreen: document.getElementById('auth-screen'),
    appScreen: document.getElementById('app-screen'),
    appContainer: document.getElementById('app-container'),
    loginForm: document.getElementById('login-form'),
    loginBtn: document.getElementById('login-btn')
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

// === Routing ===
function renderPage(page) {
    const container = DOM.appContainer;
    if (!container) return;
    
    container.innerHTML = '';
    
    // Render header + content for authenticated pages
    if (page === 'dashboard' || page === 'profile') {
        HeaderFooter.render(container, page);
    } else {
        // For public pages (home, about), still show header
        HeaderFooter.render(container, page);
    }
}

// Global navigation function - called by Header component listeners
window.navigate = function(route) {
    window.appState.currentPage = route;
    const container = DOM.appContainer;
    if (!container) return;
    
    // Show app screen, hide auth screen
    if (DOM.appScreen) DOM.appScreen.classList.remove('hidden');
    if (DOM.authScreen) DOM.authScreen.classList.add('hidden');
    
    if (route === 'login') {
        // Show login screen
        if (DOM.authScreen) DOM.authScreen.classList.remove('hidden');
        if (DOM.appScreen) DOM.appScreen.classList.add('hidden');
        return;
    }
    
    // Render header
    container.innerHTML = '';
    HeaderFooter.render(container);
    
    // Render page content
    const contentDiv = document.getElementById('page-content');
    if (contentDiv) {
        if (route === 'home') {
            HomePage.render(contentDiv);
        } else if (route === 'about') {
            AboutPage.render(contentDiv);
        } else if (route === 'dashboard') {
            // Role-based dashboard routing
            const userRole = window.appState.user?.Role || window.appState.user?.role;
            console.log('=== Dashboard routing ===');
            console.log('Full user object:', JSON.stringify(window.appState.user, null, 2));
            console.log('User Role (PascalCase):', window.appState.user?.Role);
            console.log('User role (camelCase):', window.appState.user?.role);
            console.log('Final userRole variable:', userRole);
            console.log('Is HR?', userRole === 'HR');
            
            if (userRole === 'HR') {
                console.log('✓ Routing to HRDashboard');
                HRDashboard.render(contentDiv);
            } else {
                console.log('✓ Routing to DashboardWidget for role:', userRole);
                // For other roles (QuanLy, KeToan, NhanVien), show DashboardWidget
                DashboardWidget.render(contentDiv);
            }
        } else {
            HomePage.render(contentDiv);
        }
    }
};

window.navigateTo = function(route) {
    window.navigate(route);
};

function navigateToDashboard() {
    window.navigate('dashboard');
}

// === Auth ===
function initAuth() {
    if (window.appState.token && window.appState.user) {
        // Đã đăng nhập → vào dashboard
        navigateToDashboard();
    } else {
        // Chưa đăng nhập → vào trang chủ
        navigateTo('home');
    }
}

// === Login Handler ===
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
        console.log('Login response:', data);
        if (res.ok) {
            const user = data.User || data.user; // Handle both cases
            localStorage.setItem('jwt', data.token);
            localStorage.setItem('user', JSON.stringify(user));
            window.appState.token = data.token;
            window.appState.user = user;
            console.log('User saved to appState:', window.appState.user);
            console.log('User Role field:', user?.Role, 'User role field:', user?.role);
            showToast('Đăng nhập thành công');
            navigateTo('dashboard');
        } else {
            showToast(data.message || 'Sai thông tin đăng nhập', 'error');
        }
    } catch { showToast('Lỗi kết nối máy chủ', 'error'); }
    finally { btn.innerHTML = orig; btn.disabled = false; }
});

// Bước 4: Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.appState = { user: null, token: null, currentTab: 'employees' };
        initAuth();
    });
}

// === Tab Navigation (OLD - DEPRECATED) ===
// Dùng navigateTo() từ new routing system
/*
function setupTabs() {
    DOM.mainNav.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

export function switchTab(tab) {
    window.appState.currentTab = tab;
    DOM.mainNav.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('tab-active', btn.dataset.tab === tab);
    });
    DOM.viewOutlet.innerHTML = '';
    DOM.viewOutlet.classList.add('fade-in');
    
    if (tab === 'employees') EmployeeDirectory.render(DOM.viewOutlet);
    else if (tab === 'workspace') UnifiedTaskForm.render(DOM.viewOutlet);
    else if (tab === 'attendance') EmployeeAttendance.render(DOM.viewOutlet);
    else if (tab === 'mytasks') EmployeeTasks.render(DOM.viewOutlet);
    
    setTimeout(() => DOM.viewOutlet.classList.remove('fade-in'), 300);
}
*/

document.addEventListener('DOMContentLoaded', initAuth);
