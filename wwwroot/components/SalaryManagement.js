// SalaryManagement Component - Quản lý Lương (cho Kế Toán)
export default class SalaryManagement {
    static render(container) {
        const user = window.appState?.user;
        
        container.innerHTML = `
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-surface-900 mb-2">Quản Lý Lương</h1>
                <p class="text-lg text-surface-600">Vai trò: <span class="font-semibold">Kế Toán</span></p>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Stats Cards -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 font-medium mb-1">Tổng Lương Tháng</p>
                            <h3 class="text-3xl font-bold text-gray-800">$45,200</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <i class="fa-solid fa-money-bill-wave text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 font-medium mb-1">Đã Thanh Toán</p>
                            <h3 class="text-3xl font-bold text-gray-800">$42,500</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <i class="fa-solid fa-check-circle text-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-500 font-medium mb-1">Chờ Xử Lý</p>
                            <h3 class="text-3xl font-bold text-gray-800">$2,700</h3>
                        </div>
                        <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <i class="fa-solid fa-hourglass-end text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Payroll -->
            <div class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-6 border-b border-gray-100">
                    <h2 class="text-xl font-bold text-gray-800">Danh Sách Lương Gần Đây</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-left font-semibold text-gray-700">Nhân Viên</th>
                                <th class="px-6 py-3 text-left font-semibold text-gray-700">Tháng</th>
                                <th class="px-6 py-3 text-left font-semibold text-gray-700">Lương Cơ Bản</th>
                                <th class="px-6 py-3 text-left font-semibold text-gray-700">Bonus</th>
                                <th class="px-6 py-3 text-left font-semibold text-gray-700">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td class="px-6 py-4 text-gray-800 font-medium">Nguyễn Văn A</td>
                                <td class="px-6 py-4 text-gray-600">Tháng 4/2026</td>
                                <td class="px-6 py-4 text-gray-800 font-semibold">$3,000</td>
                                <td class="px-6 py-4 text-gray-800 font-semibold">$200</td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Đã thanh toán</span>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td class="px-6 py-4 text-gray-800 font-medium">Trần Thị B</td>
                                <td class="px-6 py-4 text-gray-600">Tháng 4/2026</td>
                                <td class="px-6 py-4 text-gray-800 font-semibold">$2,800</td>
                                <td class="px-6 py-4 text-gray-800 font-semibold">$150</td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Chờ xử lý</span>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 text-gray-800 font-medium">Lê Văn C</td>
                                <td class="px-6 py-4 text-gray-600">Tháng 4/2026</td>
                                <td class="px-6 py-4 text-gray-800 font-semibold">$3,500</td>
                                <td class="px-6 py-4 text-gray-800 font-semibold">$300</td>
                                <td class="px-6 py-4">
                                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Đã thanh toán</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}
