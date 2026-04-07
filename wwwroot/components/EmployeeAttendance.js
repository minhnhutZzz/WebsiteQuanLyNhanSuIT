export default {
    render(container) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-8 text-center max-w-md mx-auto mt-10">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fa-solid fa-clock text-green-600 text-2xl"></i>
                </div>
                <h2 class="text-xl font-bold text-surface-900 mb-2">Chấm công hôm nay</h2>
                <p class="text-surface-500 mb-6 font-medium text-sm" id="current-time">--:--:--</p>
                <div class="flex gap-4 justify-center">
                    <button class="btn-primary" onclick="alert('Đã chấm công (Demo)')">
                        <i class="fa-solid fa-sign-in-alt"></i> Vào ca
                    </button>
                    <button class="px-4 py-2 border border-surface-200 text-surface-600 rounded-lg text-sm font-medium hover:bg-surface-50 focus:ring-2 focus:ring-surface-200 transition-all font-sans" onclick="alert('Đã kết thúc ca (Demo)')">
                        <i class="fa-solid fa-sign-out-alt"></i> Ra ca
                    </button>
                </div>
            </div>
        `;
        
        // Start simple clock
        const timerEl = document.getElementById('current-time');
        if(timerEl) {
            timerEl.innerText = new Date().toLocaleTimeString('vi-VN');
            setInterval(() => {
                const el = document.getElementById('current-time');
                if(el) el.innerText = new Date().toLocaleTimeString('vi-VN');
            }, 1000);
        }
    }
}
