// HomePage Component - Trang chủ công ty
export default class HomePage {
    static render(container) {
        const user = window.appState?.user;
        const isLoggedIn = !!user;

        container.innerHTML = `
                <!-- Hero Section -->
                <section class="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-16 px-6">
                    <div class="max-w-7xl mx-auto text-center">
                        <!-- Content -->
                        <div class="space-y-8">
                            <h1 class="text-5xl md:text-6xl font-bold leading-tight">
                                Quản lý Nhân sự <span class="text-primary-200">Thông minh</span>
                            </h1>
                            <p class="text-xl text-primary-100 leading-relaxed max-w-2xl mx-auto">
                                Hệ thống quản lý nhân sự thông minh. Quản lý nhân viên, lương, chấm công và công vthiệc từ một nền tảng duy nhất.
                            </p>
                            <div class="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                                <button id="cta-start-btn" class="btn-primary-white text-lg px-8 py-3 font-semibold transition-transform hover:scale-105">
                                    <i class="fa-solid fa-rocket mr-2"></i>
                                    Bắt đầu ngay
                                </button>
                                <button id="cta-learn-btn" class="btn-secondary-white text-lg px-8 py-3 font-semibold transition-transform hover:scale-105">
                                    <i class="fa-solid fa-play-circle mr-2"></i>
                                    Tìm hiểu thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Animation Section -->
                <section class="py-20 px-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div class="max-w-7xl mx-auto">
                        <div class="relative h-96 bg-white rounded-2xl overflow-hidden border-2 border-surface-200 shadow-lg" id="animation-container">
                            <svg class="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" id="cityscape-svg">
                                <defs>
                                    <style>
                                        @keyframes walkToRight {
                                            0% { transform: translateX(-80px); }
                                            100% { transform: translateX(800px); }
                                        }
                                        .employee-walking {
                                            animation: walkToRight 12s linear infinite;
                                        }
                                        @keyframes fall {
                                            0% { transform: rotateZ(0deg) translateY(0); }
                                            60% { transform: rotateZ(90deg) translateY(20px); }
                                            100% { transform: rotateZ(90deg) translateY(20px); }
                                        }
                                        @keyframes standup {
                                            0% { transform: rotateZ(90deg) translateY(20px); }
                                            100% { transform: rotateZ(0deg) translateY(0); }
                                        }
                                        .employee-falling {
                                            animation: fall 0.6s ease-in forwards !important;
                                        }
                                        .employee-standingup {
                                            animation: standup 0.8s ease-out forwards !important;
                                        }
                                        .employee-clickable {
                                            cursor: pointer;
                                        }
                                        .employee-clickable:hover {
                                            opacity: 0.8;
                                        }
                                    </style>
                                </defs>
                                
                                <!-- Sky Background -->
                                <rect width="1200" height="400" fill="url(#skyGrad)"/>
                                
                                <!-- Sun -->
                                <circle cx="1100" cy="80" r="35" fill="#fbbf24" opacity="0.8"/>
                                
                                <!-- Clouds -->
                                <ellipse cx="150" cy="70" rx="45" ry="28" fill="#ffffff" opacity="0.7"/>
                                <ellipse cx="200" cy="80" rx="40" ry="25" fill="#ffffff" opacity="0.65"/>
                                <ellipse cx="100" cy="85" rx="35" ry="20" fill="#ffffff" opacity="0.6"/>
                                
                                <!-- Road/Street -->
                                <rect x="0" y="300" width="1200" height="100" fill="#5a5a5a"/>
                                
                                <!-- Road markings -->
                                <line x1="50" y1="350" x2="1150" y2="350" stroke="#fbbf24" stroke-width="8" stroke-dasharray="40,30" opacity="0.8"/>
                                
                                <!-- Sidewalk -->
                                <rect x="0" y="300" width="1200" height="30" fill="#b8860b" opacity="0.4"/>
                                
                                <!-- LEFT SIDE BUILDINGS -->
                                <!-- Building L1 -->
                                <rect x="30" y="100" width="110" height="300" fill="#8b7355"/>
                                <rect x="45" y="120" width="16" height="20" fill="#ffd700" opacity="0.8"/>
                                <rect x="65" y="120" width="16" height="20" fill="#4a4a4a"/>
                                <rect x="85" y="120" width="16" height="20" fill="#ffd700" opacity="0.8"/>
                                <rect x="45" y="155" width="16" height="20" fill="#ffd700" opacity="0.8"/>
                                <rect x="65" y="155" width="16" height="20" fill="#ffd700" opacity="0.8"/>
                                <rect x="85" y="155" width="16" height="20" fill="#4a4a4a"/>
                                <rect x="45" y="190" width="16" height="20" fill="#4a4a4a"/>
                                <rect x="65" y="190" width="16" height="20" fill="#ffd700" opacity="0.8"/>
                                <rect x="85" y="190" width="16" height="20" fill="#ffd700" opacity="0.8"/>
                                <rect x="50" y="320" width="35" height="80" fill="#3a3a3a"/>
                                
                                <!-- Building L2 -->
                                <rect x="180" y="130" width="100" height="270" fill="#6b8e23"/>
                                <rect x="195" y="155" width="14" height="18" fill="#87ceeb"/>
                                <rect x="215" y="155" width="14" height="18" fill="#87ceeb"/>
                                <rect x="235" y="155" width="14" height="18" fill="#4a4a4a"/>
                                <rect x="195" y="185" width="14" height="18" fill="#87ceeb"/>
                                <rect x="215" y="185" width="14" height="18" fill="#4a4a4a"/>
                                <rect x="235" y="185" width="14" height="18" fill="#87ceeb"/>
                                <rect x="195" y="215" width="14" height="18" fill="#4a4a4a"/>
                                <rect x="215" y="215" width="14" height="18" fill="#87ceeb"/>
                                <rect x="235" y="215" width="14" height="18" fill="#87ceeb"/>
                                <rect x="200" y="315" width="30" height="85" fill="#2a2a2a"/>
                                
                                <!-- RIGHT SIDE BUILDINGS -->
                                <!-- Building R1 -->
                                <rect x="800" y="120" width="140" height="280" fill="#34495e" opacity="0.7"/>
                                <rect x="810" y="140" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                <rect x="840" y="140" width="20" height="25" fill="#34495e" opacity="0.8"/>
                                <rect x="870" y="140" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                <rect x="810" y="180" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                <rect x="840" y="180" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                <rect x="870" y="180" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                <rect x="810" y="220" width="20" height="25" fill="#34495e" opacity="0.8"/>
                                <rect x="840" y="220" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                <rect x="870" y="220" width="20" height="25" fill="#87ceeb" opacity="0.6"/>
                                
                                <!-- Building R2 -->
                                <rect x="950" y="180" width="120" height="220" fill="#2c3e50"/>
                                <rect x="965" y="200" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="995" y="200" width="18" height="22" fill="#2c3e50" opacity="0.9"/>
                                <rect x="1025" y="200" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="1055" y="200" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="965" y="245" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="995" y="245" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="1025" y="245" width="18" height="22" fill="#2c3e50" opacity="0.9"/>
                                <rect x="1055" y="245" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="965" y="290" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="995" y="290" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="1025" y="290" width="18" height="22" fill="#fbbf24" opacity="0.9"/>
                                <rect x="1055" y="290" width="18" height="22" fill="#2c3e50" opacity="0.9"/>
                                <rect x="1050" y="330" width="30" height="70" fill="#1a252f"/>
                                <circle cx="1077" cy="365" r="3" fill="#fbbf24" opacity="0.8"/>
                                
                                <!-- Building R3 -->
                                <rect x="1100" y="150" width="100" height="250" fill="#34495e" opacity="0.65"/>
                                
                                <!-- Traffic light -->
                                <rect x="80" y="180" width="20" height="100" fill="#2c3e50"/>
                                <circle cx="90" cy="200" r="8" fill="#dc2626" opacity="0.9"/>
                                <circle cx="90" cy="225" r="8" fill="#4b5563" opacity="0.6"/>
                                <circle cx="90" cy="250" r="8" fill="#16a34a" opacity="0.8"/>
                                
                                <!-- Trash bin -->
                                <rect x="250" y="270" width="25" height="40" fill="#3a3a3a" rx="2"/>
                                <rect x="248" y="268" width="29" height="5" fill="#4a4a4a"/>
                                
                                <!-- Street sign -->
                                <rect x="620" y="160" width="8" height="80" fill="#3a3a3a"/>
                                <rect x="600" y="155" width="48" height="20" fill="#1e40af"/>
                                <text x="624" y="168" font-size="8" fill="#ffffff" text-anchor="middle" font-weight="bold">OFFICE</text>
                                
                                <!-- Employee 1 - Tân (Red dress) -->
                                <g class="employee-walking employee-clickable" data-name="Tân" data-employee="1">
                                    <text x="80" y="200" font-size="12" fill="#000" text-anchor="middle" font-weight="bold">Tân</text>
                                    <circle cx="80" cy="235" r="15" fill="#d4a574"/>
                                    <!-- Long wavy hair -->
                                    <path d="M 65 235 Q 60 225 65 210 Q 70 215 75 208 Q 80 213 85 208 Q 90 215 95 210 Q 100 225 95 235" fill="#7c3f1d" opacity="0.95"/>
                                    <circle cx="80" cy="232" r="2" fill="#000"/>
                                    <path d="M 72 238 Q 80 241 88 238" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                                    <line x1="80" y1="250" x2="80" y2="257" stroke="#d4a574" stroke-width="4"/>
                                    <rect x="68" y="257" width="24" height="44" fill="#ef4444" rx="2"/>
                                    <polygon points="80,257 76,261 76,276 80,279 84,276 84,261" fill="#fbbf24"/>
                                    <line x1="68" y1="266" x2="50" y2="289" stroke="#d4a574" stroke-width="6" stroke-linecap="round"/>
                                    <circle cx="48" cy="291" r="4.5" fill="#d4a574"/>
                                    <line x1="92" y1="266" x2="110" y2="289" stroke="#d4a574" stroke-width="6" stroke-linecap="round"/>
                                    <circle cx="112" cy="291" r="4.5" fill="#d4a574"/>
                                    <rect x="105" y="303" width="26" height="19" fill="#78350f" rx="2" stroke="#5a2d0c" stroke-width="1"/>
                                    <path d="M 112 303 Q 118 295 124 303" stroke="#5a2d0c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
                                    <rect x="73" y="301" width="5.5" height="28" fill="#2d1810"/>
                                    <rect x="82.5" y="301" width="5.5" height="28" fill="#2d1810"/>
                                    <ellipse cx="76" cy="335" rx="5.5" ry="4" fill="#000"/>
                                    <ellipse cx="85.5" cy="335" rx="5.5" ry="4" fill="#000"/>
                                </g>
                                
                                <!-- Employee 2 - Nhựt (Green shirt) -->
                                <g class="employee-walking employee-clickable" data-name="Nhựt" data-employee="2" style="animation-delay: 1s;">
                                    <text x="80" y="200" font-size="12" fill="#000" text-anchor="middle" font-weight="bold">Nhựt</text>
                                    <circle cx="80" cy="228" r="17" fill="#d4a574"/>
                                    <!-- Short spiky hair -->
                                    <path d="M 70 218 L 68 205 L 73 215 L 78 203 L 82 214 L 87 204 L 92 215 L 97 205 L 95 218" fill="#1a472a" opacity="0.95"/>
                                    <circle cx="87" cy="224" r="2" fill="#000"/>
                                    <path d="M 74 233 Q 80 236 86 233" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                                    <line x1="80" y1="245" x2="80" y2="253" stroke="#d4a574" stroke-width="5"/>
                                    <rect x="66" y="253" width="28" height="48" fill="#10b981" rx="2"/>
                                    <polygon points="80,253 75,258 75,273 80,276 85,273 85,258" fill="#fbbf24"/>
                                    <line x1="66" y1="263" x2="44" y2="291" stroke="#d4a574" stroke-width="8" stroke-linecap="round"/>
                                    <circle cx="42" cy="293" r="5.5" fill="#d4a574"/>
                                    <line x1="94" y1="263" x2="116" y2="291" stroke="#d4a574" stroke-width="8" stroke-linecap="round"/>
                                    <circle cx="118" cy="293" r="5.5" fill="#d4a574"/>
                                    <rect x="110" y="301" width="30" height="21" fill="#78350f" rx="3" stroke="#5a2d0c" stroke-width="1"/>
                                    <path d="M 118 301 Q 125 290 132 301" stroke="#5a2d0c" stroke-width="2" fill="none" stroke-linecap="round"/>
                                    <line x1="115" y1="305" x2="135" y2="305" stroke="#fbbf24" stroke-width="1" opacity="0.6"/>
                                    <rect x="71" y="301" width="6.5" height="31" fill="#0d3b2d"/>
                                    <rect x="82.5" y="301" width="6.5" height="31" fill="#0d3b2d"/>
                                    <ellipse cx="74.5" cy="337" rx="6.5" ry="4.5" fill="#000"/>
                                    <ellipse cx="86" cy="337" rx="6.5" ry="4.5" fill="#000"/>
                                </g>
                                
                                <!-- Employee 3 - Bảo (Blue shirt) -->
                                <g class="employee-walking employee-clickable" data-name="Bảo" data-employee="3" style="animation-delay: 2s;">
                                    <text x="80" y="200" font-size="12" fill="#000" text-anchor="middle" font-weight="bold">Bảo</text>
                                    <circle cx="80" cy="230" r="16" fill="#d4a574"/>
                                    <!-- Curly hair -->
                                    <path d="M 68 228 Q 65 218 68 210 Q 73 216 75 205 Q 78 218 82 210 Q 85 218 88 208 Q 92 215 95 210 Q 98 218 98 228" fill="#4a2511" opacity="0.95"/>
                                    <circle cx="85" cy="227" r="2" fill="#000"/>
                                    <path d="M 73 235 Q 80 238 87 235" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                                    <line x1="80" y1="246" x2="80" y2="254" stroke="#d4a574" stroke-width="5"/>
                                    <rect x="67" y="254" width="26" height="46" fill="#3b82f6" rx="2"/>
                                    <polygon points="80,254 76,259 76,275 80,278 84,275 84,259" fill="#dc2626"/>
                                    <line x1="67" y1="264" x2="47" y2="290" stroke="#d4a574" stroke-width="7" stroke-linecap="round"/>
                                    <circle cx="45" cy="292" r="5" fill="#d4a574"/>
                                    <line x1="93" y1="264" x2="113" y2="290" stroke="#d4a574" stroke-width="7" stroke-linecap="round"/>
                                    <circle cx="115" cy="292" r="5" fill="#d4a574"/>
                                    <rect x="108" y="302" width="28" height="20" fill="#78350f" rx="2" stroke="#5a2d0c" stroke-width="1"/>
                                    <path d="M 115 302 Q 122 293 129 302" stroke="#5a2d0c" stroke-width="2" fill="none" stroke-linecap="round"/>
                                    <line x1="113" y1="306" x2="131" y2="306" stroke="#fbbf24" stroke-width="1" opacity="0.6"/>
                                    <rect x="72" y="300" width="6" height="30" fill="#1e3a5f"/>
                                    <rect x="82" y="300" width="6" height="30" fill="#1e3a5f"/>
                                    <ellipse cx="75" cy="336" rx="6" ry="4" fill="#000"/>
                                    <ellipse cx="85" cy="336" rx="6" ry="4" fill="#000"/>
                                </g>
                                
                                <!-- Employee 4 - Lợi (Purple shirt) -->
                                <g class="employee-walking employee-clickable" data-name="Lợi" data-employee="4" style="animation-delay: 3s;">
                                    <text x="80" y="200" font-size="12" fill="#000" text-anchor="middle" font-weight="bold">Lợi</text>
                                    <circle cx="80" cy="232" r="16" fill="#d4a574"/>
                                    <!-- Blow-back hair -->
                                    <path d="M 70 230 L 68 210 L 72 222 L 75 208 L 80 220 L 85 205 L 90 218 L 95 210 L 98 230" fill="#8b6914" opacity="0.95"/>
                                    <circle cx="85" cy="229" r="2" fill="#000"/>
                                    <path d="M 73 236 Q 80 239 87 236" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                                    <line x1="80" y1="248" x2="80" y2="256" stroke="#d4a574" stroke-width="5"/>
                                    <rect x="67" y="256" width="26" height="45" fill="#8b5cf6" rx="2"/>
                                    <polygon points="80,256 76,261 76,276 80,279 84,276 84,261" fill="#ec4899"/>
                                    <line x1="67" y1="265" x2="47" y2="290" stroke="#d4a574" stroke-width="7" stroke-linecap="round"/>
                                    <circle cx="45" cy="292" r="5" fill="#d4a574"/>
                                    <line x1="93" y1="265" x2="113" y2="290" stroke="#d4a574" stroke-width="7" stroke-linecap="round"/>
                                    <circle cx="115" cy="292" r="5" fill="#d4a574"/>
                                    <rect x="108" y="302" width="28" height="20" fill="#78350f" rx="2" stroke="#5a2d0c" stroke-width="1"/>
                                    <path d="M 115 302 Q 122 293 129 302" stroke="#5a2d0c" stroke-width="2" fill="none" stroke-linecap="round"/>
                                    <line x1="113" y1="306" x2="131" y2="306" stroke="#fbbf24" stroke-width="1" opacity="0.6"/>
                                    <rect x="72" y="301" width="6" height="29" fill="#3d2d5f"/>
                                    <rect x="82" y="301" width="6" height="29" fill="#3d2d5f"/>
                                    <ellipse cx="75" cy="335" rx="6" ry="4" fill="#000"/>
                                    <ellipse cx="85" cy="335" rx="6" ry="4" fill="#000"/>
                                </g>
                                
                                <!-- Tree decoration -->
                                <circle cx="550" cy="280" r="25" fill="#228b22" opacity="0.7"/>
                                <circle cx="530" cy="270" r="20" fill="#228b22" opacity="0.7"/>
                                <circle cx="570" cy="270" r="22" fill="#228b22" opacity="0.7"/>
                                <rect x="545" y="295" width="10" height="25" fill="#8b4513"/>
                            </svg>
                            
                            <!-- Speech bubble (hidden by default) -->
                            <div id="speech-bubble" class="absolute hidden bg-white px-4 py-2 rounded-lg border-2 border-surface-300 text-sm font-semibold" style="bottom: 80px; left: 50px; z-index: 10;">
                                <div class="text-surface-900">Trễ giờ làm rồi!</div>
                                <div class="absolute bottom-0 left-3 w-0 h-0" style="border-left: 8px solid transparent; border-right: 0px solid transparent; border-top: 8px solid white; transform: translateY(8px);"></div>
                            </div>
                        </div>
                    </div>
                </section>
        `;

        this.setupListeners();
    }

    static setupListeners() {
        const user = window.appState?.user;

        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            // Start button
            const startBtn = document.getElementById('cta-start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Start button clicked');
                    if (user) {
                        window.navigate('dashboard');
                    } else {
                        window.navigate('login');
                    }
                });
            }

            // Learn more button
            const learnBtn = document.getElementById('cta-learn-btn');
            if (learnBtn) {
                learnBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.navigate('about');
                });
            }

            // Final CTA button
            const finalBtn = document.getElementById('cta-final-btn');
            if (finalBtn) {
                finalBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (user) {
                        window.navigate('dashboard');
                    } else {
                        window.navigate('login');
                    }
                });
            }

            // Setup employee click handlers
            const svg = document.getElementById('cityscape-svg');
            const employees = document.querySelectorAll('.employee-clickable');
            const speechBubble = document.getElementById('speech-bubble');
            
            if (svg && employees.length > 0 && speechBubble) {
                // Add linearGradient to defs if not exists
                const defs = svg.querySelector('defs');
                if (!defs.querySelector('#skyGrad')) {
                    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                    gradient.id = 'skyGrad';
                    gradient.setAttribute('x1', '0%');
                    gradient.setAttribute('y1', '0%');
                    gradient.setAttribute('x2', '0%');
                    gradient.setAttribute('y2', '100%');
                    
                    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop1.setAttribute('offset', '0%');
                    stop1.setAttribute('style', 'stop-color:#87ceeb;stop-opacity:1');
                    
                    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop2.setAttribute('offset', '100%');
                    stop2.setAttribute('style', 'stop-color:#e0f6ff;stop-opacity:1');
                    
                    gradient.appendChild(stop1);
                    gradient.appendChild(stop2);
                    defs.appendChild(gradient);
                }
                
                employees.forEach(employee => {
                    // Add flag to prevent multiple clicks
                    employee.isAnimating = false;
                    
                    employee.addEventListener('click', function(e) {
                        e.stopPropagation();
                        
                        // Prevent multiple clicks
                        if (this.isAnimating) return;
                        this.isAnimating = true;
                        
                        const name = this.getAttribute('data-name');
                        const empNum = this.getAttribute('data-employee');
                        
                        console.log('Clicked employee:', name);
                        
                        // Remove animation
                        this.classList.remove('employee-walking');
                        
                        // Add fall animation
                        this.classList.add('employee-falling');
                        
                        // Show speech bubble after fall
                        const self = this;
                        setTimeout(() => {
                            speechBubble.style.left = (parseInt(self.getAttribute('data-employee')) * 150 - 50) + 'px';
                            speechBubble.classList.remove('hidden');
                            
                            // Stand up animation
                            self.classList.remove('employee-falling');
                            self.classList.add('employee-standingup');
                            
                            // Hide speech bubble and restore animation after standing
                            setTimeout(() => {
                                speechBubble.classList.add('hidden');
                                self.classList.remove('employee-standingup');
                                self.classList.add('employee-walking');
                                self.isAnimating = false; // Allow clicks again
                            }, 900);
                        }, 600);
                    });
                });
            }
        }, 0);
    }
}
