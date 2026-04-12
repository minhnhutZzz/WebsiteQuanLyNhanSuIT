import EmployeeDirectory from './components/EmployeeDirectory.js';
import UnifiedTaskForm from './components/UnifiedTaskForm.js';
import EmployeeAttendance from './components/EmployeeAttendance.js';
import EmployeeTasks from './components/EmployeeTasks.js';
import EmployeeSalaryView from './components/EmployeeSalaryView.js';
import HomePage from './components/HomePage.js';
import AboutPage from './components/AboutPage.js';
import HRDashboard from './components/HRDashboard.js';
import SalaryManagement from './components/SalaryManagement.js';
import PayrollProcessing from './components/PayrollProcessing.js';
import HeaderFooter from './components/Header.js';

// Make components globally accessible for onclick handlers
window.SalaryManagement = SalaryManagement;
window.PayrollProcessing = PayrollProcessing;

// Bước 1: Khởi tạo State toàn cục
window.appState = {
    user: null,
    token: null,
    currentTab: 'employees',
    currentPage: 'home' // Track current page (home, about, dashboard, profile, login)
};

// Initialize appData
window.appData = {
    BangLuongs: [],
    NhanViens: []
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
    if (!container) return;
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

// Make showToast globally accessible
window.showToast = showToast;

// === API Helper ===
export async function apiFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (window.appState.token) {
        headers['Authorization'] = `Bearer ${window.appState.token}`;
        console.log('apiFetch - Authorization header set for:', url);
    } else {
        console.warn('apiFetch - No token available for:', url);
    }
    return fetch(url, { ...options, headers });
}

// Load app data for components
async function loadAppData() {
    try {
        console.log('[loadAppData] Bắt đầu tải dữ liệu ứng dụng...');
        
        // Ensure token is set before making authenticated requests
        if (!window.appState.token) {
            console.warn('[loadAppData] ✗ Không có token');
            return;
        }
        
        console.log('[loadAppData] Token: ' + window.appState.token.substring(0, 50) + '...');
        
        const response = await apiFetch('/api/hr/payroll');
        console.log('[loadAppData] Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('[loadAppData] ✓ Raw data from API:', data);
            
            window.appData = {
                BangLuongs: data.payroll || [],
                NhanViens: data.employees || []
            };
            console.log('[loadAppData] ✓ appData set: BangLuongs=' + window.appData.BangLuongs.length + ', NhanViens=' + window.appData.NhanViens.length);
        } else if (response.status === 401) {
            console.error('[loadAppData] ✗ Unauthorized - token may be invalid');
        } else {
            const errorText = await response.text();
            console.error('[loadAppData] ✗ Response error (status ' + response.status + '):', errorText);
        }
    } catch (e) {
        console.error('[loadAppData] ✗ Exception:', e.message);
        console.error('[loadAppData] Stack:', e.stack);
    }
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
window.navigate = async function(route) {
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
        
        // Attach event listeners to back button and logo when showing login
        setTimeout(() => {
            const loginBackBtn = document.getElementById('login-back-home-btn');
            const loginLogoBtn = document.getElementById('login-logo-home');
            
            if (loginBackBtn && !loginBackBtn.dataset.listenerAttached) {
                loginBackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.navigate('home');
                });
                loginBackBtn.dataset.listenerAttached = 'true';
            }
            
            if (loginLogoBtn && !loginLogoBtn.dataset.listenerAttached) {
                loginLogoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.navigate('home');
                });
                loginLogoBtn.dataset.listenerAttached = 'true';
            }
        }, 0);
        
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
            // Load app data before rendering
            await loadAppData();
            
            // Role-based dashboard routing
            const userRole = window.appState.user?.role || window.appState.user?.Role;
            console.log('Dashboard routing - Role:', userRole);
            
            if (userRole === 'HR') {
                HRDashboard.render(contentDiv);
            } else if (userRole === 'QuanLy') {
                // QuanLy has tabs: employees, workspace
                createDashboardWithTabs(contentDiv, 'QuanLy');
            } else if (userRole === 'KeToan') {
                SalaryManagement.render(contentDiv);
            } else {
                // NhanVien has tabs: attendance, mytasks, salary
                createDashboardWithTabs(contentDiv, 'NhanVien');
            }
        } else if (route === 'profile') {
            // Show user profile
            const user = window.appState.user;
            const roles = { 'HR': 'HR Manager', 'QuanLy': 'Quản Lý', 'KeToan': 'Kế Toán', 'NhanVien': 'Nhân Viên' };
            const roleDisplay = roles[user?.role || user?.Role] || 'Nhân Viên';
            contentDiv.innerHTML = `
                <div class="max-w-4xl mx-auto">
                    <div class="mb-8">
                        <h1 class="text-4xl font-bold text-surface-900 mb-2">Hồ Sơ Cá Nhân</h1>
                        <p class="text-lg text-surface-600">Quản lý thông tin tài khoản của bạn</p>
                    </div>

                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div class="space-y-6">
                            <div class="flex items-center gap-8">
                                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                    <i class="fa-solid fa-user text-white text-5xl"></i>
                                </div>
                                <div>
                                    <h2 class="text-3xl font-bold text-surface-900 mb-2">${user?.HoTen || user?.hoTen || 'Người dùng'}</h2>
                                    <p class="text-lg text-primary-600 font-semibold">${roleDisplay}</p>
                                </div>
                            </div>

                            <div class="border-t border-gray-200 pt-6">
                                <h3 class="text-xl font-bold text-surface-900 mb-4">Thông Tin Chi Tiết</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-semibold text-surface-600 mb-2">Mã Nhân Viên</label>
                                        <p class="text-lg text-surface-800 bg-surface-50 px-4 py-2 rounded-lg">${user?.MaNV || user?.maNV || '-'}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-surface-600 mb-2">Email</label>
                                        <p class="text-lg text-surface-800 bg-surface-50 px-4 py-2 rounded-lg">${user?.Email || user?.email || '-'}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-surface-600 mb-2">Trạng Thái</label>
                                        <p class="text-lg text-green-700 font-semibold px-4 py-2 rounded-lg bg-green-50">${user?.TrangThai || user?.trangThai || 'Đang làm'}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold text-surface-600 mb-2">Vai Trò</label>
                                        <p class="text-lg text-primary-700 font-semibold px-4 py-2 rounded-lg bg-primary-50">${roleDisplay}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="border-t border-gray-200 pt-6 text-center">
                                <button onclick="window.navigate('dashboard')" class="btn-primary">Quay Lại Dashboard</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (route === 'payroll-processing') {
            // Payroll processing page
            await loadAppData();
            PayrollProcessing.render(contentDiv);
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
        window.navigate('home');
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
            const token = data.Token || data.token; // API returns PascalCase Token
            localStorage.setItem('jwt', token);
            localStorage.setItem('user', JSON.stringify(user));
            window.appState.token = token;
            window.appState.user = user;
            console.log('Token set:', window.appState.token ? 'YES' : 'NO');
            console.log('Token value:', window.appState.token?.substring(0, 50) + '...');
            showToast('Đăng nhập thành công');
            // Give a moment for state to settle before navigating
            await new Promise(r => setTimeout(r, 100));
            // Direct navigate to dashboard after login (skip home page)
            window.navigate('dashboard');
        } else {
            showToast(data.message || 'Sai thông tin đăng nhập', 'error');
        }
    } catch { showToast('Lỗi kết nối máy chủ', 'error'); }
    finally { btn.innerHTML = orig; btn.disabled = false; }
});

// === Dashboard with Tabs ===
function createDashboardWithTabs(container, role) {
    container.innerHTML = '';
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'flex gap-2 border-b border-surface-200 mb-6 overflow-x-auto';
    
    let tabs = [];
    if (role === 'QuanLy') {
        tabs = [
            { id: 'employees', label: 'Nhân viên', icon: 'fa-users' },
            { id: 'workspace', label: 'Phân công', icon: 'fa-pen-ruler' }
        ];
        window.appState.currentTab = 'employees';
    } else if (role === 'NhanVien') {
        tabs = [
            { id: 'attendance', label: 'Chấm công', icon: 'fa-clock' },
            { id: 'mytasks', label: 'Công việc của tôi', icon: 'fa-list-check' },
            { id: 'salary', label: 'Lương', icon: 'fa-money-bill-wave' }
        ];
        window.appState.currentTab = 'attendance';
    }
    
    tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = `tab-btn px-4 py-2 border-b-2 font-medium transition ${window.appState.currentTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-600 hover:text-primary-500'}`;
        btn.innerHTML = `<i class="fa-solid ${tab.icon} mr-2"></i>${tab.label}`;
        btn.onclick = () => switchDashboardTab(tab.id, container, role);
        tabsContainer.appendChild(btn);
    });
    
    container.appendChild(tabsContainer);
    
    // Content container
    const contentDiv = document.createElement('div');
    contentDiv.id = 'dashboard-content';
    container.appendChild(contentDiv);
    
    // Render initial tab
    switchDashboardTab(window.appState.currentTab, container, role);
}

function switchDashboardTab(tabId, container, role) {
    window.appState.currentTab = tabId;
    const contentDiv = container.querySelector('#dashboard-content');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = '';
    
    // Update tab styles
    container.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.textContent.includes(getTabLabel(tabId))) {
            btn.className = `tab-btn px-4 py-2 border-b-2 font-medium transition border-primary-500 text-primary-600`;
        } else {
            btn.className = `tab-btn px-4 py-2 border-b-2 font-medium transition border-transparent text-surface-600 hover:text-primary-500`;
        }
    });
    
    // Render component
    if (tabId === 'employees') EmployeeDirectory.render(contentDiv);
    else if (tabId === 'workspace') UnifiedTaskForm.render(contentDiv);
    else if (tabId === 'attendance') EmployeeAttendance.render(contentDiv);
    else if (tabId === 'mytasks') EmployeeTasks.render(contentDiv);
    else if (tabId === 'salary') {
        // Use EmployeeSalaryView for employees, SalaryManagement for accountants
        if (role === 'NhanVien') {
            EmployeeSalaryView.render(contentDiv);
        } else {
            SalaryManagement.render(contentDiv);
        }
    }
}

function getTabLabel(tabId) {
    const labels = {
        employees: 'Nhân viên',
        workspace: 'Phân công',
        attendance: 'Chấm công',
        mytasks: 'Công việc của tôi',
        salary: 'Lương'
    };
    return labels[tabId] || '';
}

// === Back to Home from Login ===
// (Event listeners attached in window.navigate() when login route is triggered)

// Bước 4: Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.appState = { user: null, token: null, currentTab: 'employees' };
        window.navigate('login');
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
