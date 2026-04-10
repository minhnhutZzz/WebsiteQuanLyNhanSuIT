// HeaderFooter Component
export default class HeaderFooter {
    static render(container) {
        const user = window.appState?.user;
        const isLoggedIn = !!user;

        container.innerHTML = `
            <!-- Header -->
            <header class="bg-white border-b border-surface-200 sticky top-0 z-20 shadow-sm">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <!-- Logo + Brand -->
                        <div class="flex items-center gap-2 cursor-pointer" id="logo-home">
                            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                <i class="fa-solid fa-building-user text-white text-lg"></i>
                            </div>
                            <span class="text-xl font-bold text-surface-900">
                                <span class="text-primary-500">HR</span>Portal
                            </span>
                        </div>

                        <!-- Navigation Center -->
                        <nav id="header-nav" class="hidden md:flex items-center gap-8">
                            <button class="header-nav-link" data-route="home">
                                <i class="fa-solid fa-house text-xs"></i>
                                <span>Trang chủ</span>
                            </button>
                            <button class="header-nav-link" data-route="about">
                                <i class="fa-solid fa-info-circle text-xs"></i>
                                <span>Giới thiệu</span>
                            </button>
                        </nav>

                        <!-- Right Section -->
                        <div id="header-auth" class="flex items-center gap-4">
                            ${!isLoggedIn ? `
                                <button id="header-login-btn" class="text-sm font-medium text-primary-500 hover:text-primary-600 transition">
                                    <i class="fa-solid fa-sign-in-alt text-xs mr-1"></i>
                                    Đăng nhập
                                </button>
                            ` : `
                                <div class="flex items-center gap-3 border-l border-surface-200 pl-4">
                                    <button id="header-profile-btn" class="flex items-center gap-2 text-sm font-medium text-surface-700 hover:text-primary-500 transition">
                                        <i class="fa-solid fa-user-circle text-lg"></i>
                                        <span class="hidden sm:inline">${user.hoTen || user.HoTen || 'Người dùng'}</span>
                                    </button>
                                    <button id="header-logout-btn" class="text-sm text-surface-400 hover:text-red-500 transition-colors">
                                        <i class="fa-solid fa-right-from-bracket text-lg"></i>
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content area (to be filled by pages) -->
            <div id="page-content"></div>
        `;

        this.setupListeners();
    }

    static setupListeners() {
        const user = window.appState?.user;

        // Logo to home
        document.getElementById('logo-home')?.addEventListener('click', () => {
            window.navigate('home');
        });

        // Header navigation links
        const headerNav = document.querySelector('header nav');
        if (headerNav) {
            headerNav.querySelectorAll('[data-route]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const route = btn.dataset.route;
                    window.navigate(route);
                });
            });
        }

        // Footer links
        const footer = document.querySelector('footer');
        if (footer) {
            footer.querySelectorAll('.footer-link').forEach(btn => {
                btn.addEventListener('click', () => {
                    const route = btn.dataset.route;
                    window.navigate(route);
                });
            });
        }

        // Login button
        document.getElementById('header-login-btn')?.addEventListener('click', () => {
            window.navigate('login');
        });

        // Profile button
        document.getElementById('header-profile-btn')?.addEventListener('click', () => {
            window.navigate('profile');
        });

        // Logout button
        document.getElementById('header-logout-btn')?.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                localStorage.clear();
                window.appState = { user: null, token: null, currentTab: 'employees', currentPage: 'home' };
                window.navigate('home');
            }
        });
    }
}
