// AboutPage Component - Trang giới thiệu
export default class AboutPage {
    static render(container) {
        container.innerHTML = `
            <!-- Hero Section -->
            <section class="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white py-20 px-6">
                <div class="max-w-5xl mx-auto text-center">
                    <h1 class="text-5xl md:text-6xl font-bold mb-6">Giới thiệu hệ thống</h1>
                    <p class="text-xl md:text-2xl text-primary-100 leading-relaxed max-w-3xl mx-auto">
                        Hệ thống quản lý nhân sự thông minh dành cho các công ty IT
                    </p>
                </div>
            </section>

            <!-- Introduction Section -->
            <section class="py-20 px-6 bg-white">
                <div class="max-w-5xl mx-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 class="text-4xl font-bold text-surface-900 mb-6">Giới thiệu hệ thống</h2>
                            <div class="space-y-4 text-lg text-surface-700">
                                <p class="leading-relaxed">
                                    <strong>Website Quản lý nhân sự IT</strong> là hệ thống được xây dựng nhằm hỗ trợ doanh nghiệp số hóa các quy trình quản lý nhân sự. Hệ thống giúp quản lý toàn bộ vòng đời của nhân viên, từ tuyển dụng, đào tạo đến khi thôi việc.
                                </p>
                                <p class="leading-relaxed">
                                    Bằng việc tự động hóa các nghiệp vụ quan trọng như tính lương, quản lý hồ sơ và theo dõi công việc, hệ thống giúp giảm thiểu sai sót trong xử lý dữ liệu, đồng thời nâng cao hiệu quả vận hành trong doanh nghiệp.
                                </p>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-8 border-2 border-primary-200">
                            <div class="space-y-4">
                                <div class="flex items-start gap-4">
                                    <i class="fa-solid fa-check-circle text-2xl text-primary-500 mt-1 flex-shrink-0"></i>
                                    <div>
                                        <h3 class="font-bold text-surface-900">Quản lý toàn vòng đời nhân viên</h3>
                                        <p class="text-sm text-surface-600">Từ tuyển dụng, đào tạo đến thôi việc</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-4">
                                    <i class="fa-solid fa-check-circle text-2xl text-primary-500 mt-1 flex-shrink-0"></i>
                                    <div>
                                        <h3 class="font-bold text-surface-900">Tự động hóa nghiệp vụ quan trọng</h3>
                                        <p class="text-sm text-surface-600">Tính lương, quản lý hồ sơ, theo dõi công việc</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-4">
                                    <i class="fa-solid fa-check-circle text-2xl text-primary-500 mt-1 flex-shrink-0"></i>
                                    <div>
                                        <h3 class="font-bold text-surface-900">Giảm sai sót trong xử lý dữ liệu</h3>
                                        <p class="text-sm text-surface-600">Đảm bảo tính chính xác và nhất quán</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Objectives Section -->
            <section class="py-20 px-6 bg-gradient-to-br from-surface-50 to-surface-100">
                <div class="max-w-5xl mx-auto">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-surface-900 mb-4">Mục tiêu của hệ thống</h2>
                        <p class="text-xl text-surface-600">Hệ thống được phát triển với các mục tiêu chính:</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Objective 1 -->
                        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-t-4 border-primary-500">
                            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fa-solid fa-digital-tachograph text-2xl text-primary-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-surface-900 mb-3">Số hóa quy trình quản lý</h3>
                            <p class="text-surface-600">
                                Số hóa các quy trình quản lý nhân sự trong doanh nghiệp IT, từ tuyển dụng đến quản lý hiệu suất.
                            </p>
                        </div>

                        <!-- Objective 2 -->
                        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-t-4 border-blue-500">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fa-solid fa-calculator text-2xl text-blue-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-surface-900 mb-3">Tự động hóa tính lương</h3>
                            <p class="text-surface-600">
                                Tự động hóa việc tính lương, bao gồm lương Gross/Net, thuế thu nhập cá nhân và bảo hiểm xã hội.
                            </p>
                        </div>

                        <!-- Objective 3 -->
                        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-t-4 border-green-500">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fa-solid fa-users text-2xl text-green-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-surface-900 mb-3">Quản lý thông tin tập trung</h3>
                            <p class="text-surface-600">
                                Quản lý thông tin nhân viên một cách tập trung và nhất quán trong một nền tảng duy nhất.
                            </p>
                        </div>

                        <!-- Objective 4 -->
                        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-t-4 border-purple-500">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fa-solid fa-chart-line text-2xl text-purple-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-surface-900 mb-3">Theo dõi hiệu suất</h3>
                            <p class="text-surface-600">
                                Hỗ trợ theo dõi hiệu suất làm việc thông qua các báo cáo, thống kê và phân tích chi tiết.
                            </p>
                        </div>

                        <!-- Objective 5 -->
                        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-t-4 border-orange-500">
                            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fa-solid fa-lock text-2xl text-orange-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-surface-900 mb-3">Bảo mật dữ liệu</h3>
                            <p class="text-surface-600">
                                Đảm bảo tính chính xác, bảo mật và tuân thủ các quy định bảo vệ dữ liệu cá nhân.
                            </p>
                        </div>

                        <!-- Objective 6 -->
                        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-t-4 border-red-500">
                            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                <i class="fa-solid fa-rocket text-2xl text-red-500"></i>
                            </div>
                            <h3 class="text-xl font-bold text-surface-900 mb-3">Nâng cao hiệu quả</h3>
                            <p class="text-surface-600">
                                Nâng cao hiệu quả vận hành trong doanh nghiệp bằng cách giảm thiểu sai sót và tăng năng suất.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="py-20 px-6 bg-white">
                <div class="max-w-5xl mx-auto">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-bold text-surface-900 mb-4">Các tính năng chính</h2>
                        <p class="text-xl text-surface-600">Hệ thống bao gồm các tính năng toàn diện:</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-primary-500 font-bold"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-surface-900 mb-1">Quản lý nhân viên</h3>
                                <p class="text-surface-600">Lưu trữ và quản lý thông tin nhân viên một cách tập trung</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-primary-500 font-bold"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-surface-900 mb-1">Tính lương tự động</h3>
                                <p class="text-surface-600">Tính toán lương với mọi chi tiết từ lương cơ bản đến thưởng phạt</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-primary-500 font-bold"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-surface-900 mb-1">Chấm công thông minh</h3>
                                <p class="text-surface-600">Theo dõi thời gian làm việc và tính toán overtime tự động</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-primary-500 font-bold"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-surface-900 mb-1">Phân công công việc</h3>
                                <p class="text-surface-600">Giao và theo dõi công việc cho từng thành viên trong đội</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-primary-500 font-bold"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-surface-900 mb-1">Phỏng vấn tuyển dụng</h3>
                                <p class="text-surface-600">Quản lý quy trình phỏng vấn và lên lịch tuyển dụng</p>
                            </div>
                        </div>

                        <div class="flex gap-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <i class="fa-solid fa-check text-primary-500 font-bold"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-surface-900 mb-1">Tích hợp Facebook</h3>
                                <p class="text-surface-600">Đăng bài tuyển dụng trực tiếp lên Facebook Page công ty</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <div class="max-w-4xl mx-auto text-center">
                    <h2 class="text-4xl font-bold mb-6">Sẵn sàng để bắt đầu?</h2>
                    <p class="text-xl text-primary-100 mb-8">
                        Đăng nhập vào hệ thống và khám phá toàn bộ tính năng quản lý nhân sự thương hiệu
                    </p>
                    <button id="about-cta-btn" class="bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition">
                        <i class="fa-solid fa-arrow-right mr-2"></i>
                        Bắt đầu ngay
                    </button>
                </div>
            </section>
        `;

        this.setupListeners();
    }

    static setupListeners() {
        const ctaBtn = document.getElementById('about-cta-btn');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                window.navigate('dashboard');
            });
        }
    }
}
