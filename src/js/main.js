// ========================================
// PACKZONE MC - MAIN SCRIPT (با مدیریت کاربر)
// ========================================

console.log('💙 PackZone MC Loaded!');

// ===== اجرا وقتی صفحه کامل لود شد =====
document.addEventListener('DOMContentLoaded', function() {

    // ===== گرفتن کاربر از localStorage =====
    const currentUser = JSON.parse(localStorage.getItem('pzmc_current_user'));

    // ===== پیدا کردن جای دکمه‌ها در هدر =====
    const header = document.querySelector('.custom-header') || document.querySelector('.header') || document.querySelector('header');
    if (!header) return;

    // ===== پیدا کردن منوی ناوبری =====
    let nav = header.querySelector('.custom-nav') || header.querySelector('.nav') || header.querySelector('nav');

    // اگه منو وجود نداشت، خودمون می‌سازیم
    if (!nav) {
        nav = document.createElement('nav');
        nav.className = 'custom-nav';
        header.appendChild(nav);
    }

    // ===== حذف دکمه‌های قدیمی =====
    nav.innerHTML = '';

    // ===== ساخت دکمه‌ها بر اساس وضعیت کاربر =====
    if (currentUser) {
        // ===== کاربر وارد شده =====

        // ۱. عکس پروفایل (آواتار)
        const avatarImg = document.createElement('img');
        const savedAvatar = localStorage.getItem('pzmc_avatar_' + currentUser.email);
        avatarImg.src = savedAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=008cff&color=fff&size=40';
        avatarImg.alt = 'پروفایل';
        avatarImg.style.cssText = `
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 2px solid #008cff;
            object-fit: cover;
            cursor: pointer;
            transition: 0.3s;
        `;
        avatarImg.onmouseover = function() { this.style.borderColor = '#7b00ff'; };
        avatarImg.onmouseout = function() { this.style.borderColor = '#008cff'; };
        avatarImg.onclick = function() {
            window.location.href = 'profile.html';
        };

        // ۲. نام کاربری
        const userName = document.createElement('span');
        userName.textContent = currentUser.name || 'کاربر';
        userName.style.cssText = `
            color: #7ec8ff;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: 0.3s;
        `;
        userName.onclick = function() {
            window.location.href = 'profile.html';
        };
        userName.onmouseover = function() { this.style.color = '#008cff'; };
        userName.onmouseout = function() { this.style.color = '#7ec8ff'; };

        // ۳. دکمه خروج
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = '🚪 خروج';
        logoutBtn.style.cssText = `
            background: rgba(255, 23, 68, 0.15);
            color: #ff1744;
            border: 1px solid #ff1744;
            padding: 8px 16px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            transition: 0.3s;
            font-family: inherit;
        `;
        logoutBtn.onmouseover = function() {
            this.style.background = '#ff1744';
            this.style.color = '#fff';
        };
        logoutBtn.onmouseout = function() {
            this.style.background = 'rgba(255, 23, 68, 0.15)';
            this.style.color = '#ff1744';
        };
        logoutBtn.onclick = function() {
            if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
                localStorage.removeItem('pzmc_current_user');
                alert('👋 شما با موفقیت خارج شدید');
                window.location.reload();
            }
        };

        // ===== اضافه کردن به منو =====
        nav.appendChild(avatarImg);
        nav.appendChild(userName);
        nav.appendChild(logoutBtn);

        // مخفی کردن دکمه‌های ثبت‌نام و ورود از جای دیگه (اگه باشن)
        document.querySelectorAll('.btn-signup, .btn-login, a[href="signup.html"], a[href="login.html"]').forEach(el => {
            if (el.closest('nav') || el.closest('.custom-nav')) return;
            el.style.display = 'none';
        });

    } else {
        // ===== کاربر وارد نشده =====

        // ۱. دکمه ثبت‌نام
        const signupBtn = document.createElement('a');
        signupBtn.href = 'signup.html';
        signupBtn.textContent = '📝 ثبت‌نام';
        signupBtn.className = 'btn-signup';
        signupBtn.style.cssText = `
            color: #fff;
            text-decoration: none;
            font-weight: 600;
            padding: 10px 22px;
            background: linear-gradient(135deg, #008cff, #7b00ff);
            border-radius: 12px;
            transition: 0.3s;
            font-family: inherit;
        `;
        signupBtn.onmouseover = function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 30px rgba(0, 140, 255, 0.3)';
        };
        signupBtn.onmouseout = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        };

        // ۲. دکمه ورود
        const loginBtn = document.createElement('a');
        loginBtn.href = 'login.html';
        loginBtn.textContent = '🔐 ورود';
        loginBtn.className = 'btn-login';
        loginBtn.style.cssText = `
            color: #9ecfff;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 12px;
            transition: 0.3s;
            font-family: inherit;
        `;
        loginBtn.onmouseover = function() { this.style.color = '#7ec8ff'; };
        loginBtn.onmouseout = function() { this.style.color = '#9ecfff'; };

        // ===== اضافه کردن به منو =====
        nav.appendChild(signupBtn);
        nav.appendChild(loginBtn);
    }
});

// ===== تابع خروج (برای استفاده در جاهای دیگه) =====
function logoutUser() {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        localStorage.removeItem('pzmc_current_user');
        alert('👋 شما با موفقیت خارج شدید');
        window.location.reload();
    }
}

// ===== بقیه توابع (تم، فونت، toast) =====

// ===== CHANGE THEME =====
function changeTheme(theme) {
    document.body.className = '';
    document.body.classList.add('theme-' + theme);
    localStorage.setItem('selectedTheme', theme);
    showToast('✅ تم با موفقیت تغییر کرد!');
}

// ===== CHANGE FONT =====
function changeFont(font) {
    document.body.classList.remove('font-inter', 'font-vazirmatn', 'font-iransans', 'font-shabnam');
    let fontClass = '';
    switch (font) {
        case 'inter':
            fontClass = 'font-inter';
            break;
        case 'vazirmatn':
            fontClass = 'font-vazirmatn';
            break;
        case 'iransans':
            fontClass = 'font-iransans';
            break;
        case 'shabnam':
            fontClass = 'font-shabnam';
            break;
    }
    if (fontClass) {
        document.body.classList.add(fontClass);
    }
    localStorage.setItem('selectedFont', font);
    showToast('✅ فونت با موفقیت تغییر کرد!');
}

// ===== SHOW TOAST =====
function showToast(message) {
    const oldToast = document.querySelector('.toast-message');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #0d2038;
        color: #7ec8ff;
        padding: 15px 30px;
        border-radius: 15px;
        border: 1px solid #008cff;
        box-shadow: 0 0 30px rgba(0, 140, 255, 0.3);
        font-size: 1rem;
        z-index: 9999;
        animation: fadeInUp 0.3s ease;
        font-family: inherit !important;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

// ===== ADD ANIMATION =====
const styleAnim = document.createElement('style');
styleAnim.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(styleAnim);

// ===== LOAD SAVED THEME & FONT =====
window.onload = function() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.classList.add('theme-' + savedTheme);
    }
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        let fontClass = '';
        switch (savedFont) {
            case 'inter':
                fontClass = 'font-inter';
                break;
            case 'vazirmatn':
                fontClass = 'font-vazirmatn';
                break;
            case 'iransans':
                fontClass = 'font-iransans';
                break;
            case 'shabnam':
                fontClass = 'font-shabnam';
                break;
        }
        if (fontClass) {
            document.body.classList.add(fontClass);
        }
    }
};
