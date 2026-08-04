// ========================================
// PACKZONE MC - AUTH SYSTEM
// ========================================

console.log('💙 PackZone MC Loaded!');

// ===== ثبت‌نام =====
document.addEventListener('DOMContentLoaded', function() {

    // ===== ثبت‌نام =====
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;

            // ===== اعتبارسنجی =====
            if (!name || name.length < 3) {
                showToast('❌ نام کامل باید حداقل ۳ کاراکتر باشد', 'error');
                return;
            }

            if (!email || !email.includes('@') || !email.includes('.')) {
                showToast('❌ لطفاً یک ایمیل معتبر وارد کنید (مثال: name@domain.com)', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('❌ رمز عبور باید حداقل ۶ کاراکتر باشد', 'error');
                return;
            }

            if (password !== confirm) {
                showToast('❌ رمز عبور و تکرار آن مطابقت ندارند', 'error');
                return;
            }

            // ===== ذخیره در localStorage =====
            let users = JSON.parse(localStorage.getItem('pzmc_users')) || [];

            if (users.find(u => u.email === email)) {
                showToast('❌ این ایمیل قبلاً ثبت شده است. لطفاً با ایمیل دیگری ثبت‌نام کنید.', 'error');
                return;
            }

            users.push({
                name: name,
                email: email,
                password: password,
                createdAt: new Date().toLocaleDateString('fa-IR')
            });

            localStorage.setItem('pzmc_users', JSON.stringify(users));

            showToast('✅ ثبت‌نام با موفقیت انجام شد! خوش آمدید ' + name + ' 🎉', 'success');

            // پاک کردن فرم
            signupForm.reset();

            // بعد از ۲ ثانیه بره به صفحه ورود
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // ===== ورود =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPass').value;

            if (!email || !password) {
                showToast('❌ لطفاً همه فیلدها را پر کنید', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('pzmc_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                showToast('❌ ایمیل یا رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.', 'error');
                return;
            }

            // ذخیره کاربر جاری
            localStorage.setItem('pzmc_current_user', JSON.stringify(user));
            showToast('✅ ورود با موفقیت انجام شد! خوش آمدید ' + user.name + ' 🎉', 'success');

            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1500);
        });
    }

    // ===== خروج =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('pzmc_current_user');
            showToast('👋 شما با موفقیت خارج شدید', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    // ===== بررسی وضعیت کاربر =====
    const currentUser = JSON.parse(localStorage.getItem('pzmc_current_user'));
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser.name;
        }
    }
});

// ===== تابع نمایش پیام (Toast) =====
function showToast(message, type = 'info') {
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';

    // رنگ‌های مختلف
    const colors = {
        success: '#00c853',
        error: '#ff1744',
        info: '#008cff'
    };

    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #0d2038;
        color: #fff;
        padding: 16px 32px;
        border-radius: 16px;
        border: 2px solid ${colors[type] || colors.info};
        box-shadow: 0 0 50px rgba(0, 140, 255, 0.15);
        font-size: 1rem;
        z-index: 9999;
        animation: fadeInDown 0.4s ease;
        font-family: 'Inter', sans-serif;
        max-width: 90%;
        text-align: center;
        direction: rtl;
    `;

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// ===== اضافه کردن انیمیشن =====
const styleAnim = document.createElement('style');
styleAnim.textContent = `
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(styleAnim);

// ===== تغییر تم (برای آینده) =====
function changeTheme(theme) {
    document.body.className = '';
    document.body.classList.add('theme-' + theme);
    localStorage.setItem('pzmc_theme', theme);
    showToast('🎨 تم با موفقیت تغییر کرد!', 'success');
}

// ===== بارگذاری تم ذخیره‌شده =====
window.onload = function() {
    const savedTheme = localStorage.getItem('pzmc_theme');
    if (savedTheme) {
        document.body.classList.add('theme-' + savedTheme);
    }
};
