function getNotifications() {
    return JSON.parse(localStorage.getItem('pzmc_notifications')) || [];
}

function saveNotifications(notifications) {
    localStorage.setItem('pzmc_notifications', JSON.stringify(notifications));
}

function addNotification(type, data) {
    const notifications = getNotifications();
    notifications.unshift({
        id: Date.now(),
        type: type,
        ...data,
        time: new Date().toLocaleString('fa-IR'),
        read: false
    });
    saveNotifications(notifications);
    updateNotificationBadge();

    if (typeof showToastNotification === 'function') {
        const msg = getNotificationMessage(type, data);
        showToastNotification(msg);
    }
}

function getNotificationMessage(type, data) {
    const fa = PZLang() === 'fa';
    switch (type) {
        case 'comment':
            return fa ? `💬 نظر جدید از ${data.user} در ${data.packName}` : `💬 New comment from ${data.user} on ${data.packName}`;
        case 'signup':
            return fa ? `🆕 کاربر جدید: ${data.user} ثبتنام کرد!` : `🆕 New user: ${data.user} signed up!`;
        case 'login':
            return fa ? `👤 ${data.user} وارد سایت شد!` : `👤 ${data.user} logged in!`;
        default:
            return fa ? '🔔 نوتیفیکیشن جدید' : '🔔 New notification';
    }
}

function updateNotificationBadge() {
    const notifications = getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unread > 0 ? unread : '';
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

function markAllAsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => n.read = true);
    saveNotifications(notifications);
    updateNotificationBadge();
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            renderNotifications();
        }
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;

    const fa = PZLang() === 'fa';
    const notifications = getNotifications();
    if (notifications.length === 0) {
        list.innerHTML = fa ? '<div class="empty-notifications">📭 هیچ نوتیفیکیشنی وجود ندارد</div>' : '<div class="empty-notifications">📭 No notifications yet</div>';
        return;
    }

    let html = '';
    notifications.slice(0, 20).forEach(n => {
        const icon = n.type === 'comment' ? '💬' : n.type === 'signup' ? '🆕' : '👤';
        html += `
            <div class="notification-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                <div class="notif-icon">${icon}</div>
                <div class="notif-content">
                    <div class="notif-text">${getNotificationMessage(n.type, n)}</div>
                    <div class="notif-time">${n.time}</div>
                </div>
                ${!n.read ? '<span class="notif-dot"></span>' : ''}
            </div>
        `;
    });
    list.innerHTML = html;

    list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            markNotificationAsRead(id);
        });
    });
}

function markNotificationAsRead(id) {
    const notifications = getNotifications();
    const found = notifications.find(n => n.id === id);
    if (found) {
        found.read = true;
        saveNotifications(notifications);
        updateNotificationBadge();
        renderNotifications();
    }
}

function clearAllNotifications() {
    const fa = PZLang() === 'fa';
    if (confirm(fa ? 'آیا مطمئن هستید که میخواهید همه نوتیفیکیشنها را پاک کنید؟' : 'Are you sure you want to clear all notifications?')) {
        localStorage.removeItem('pzmc_notifications');
        updateNotificationBadge();
        if (document.getElementById('notificationList')) {
            renderNotifications();
        }
    }
}

function PZLang() {
    return (document.documentElement.lang || 'fa').toLowerCase().startsWith('en') ? 'en' : 'fa';
}

function pzToast(msg) {
    const old = document.querySelector('.pz-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'pz-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() {
        t.style.opacity = '0';
        t.style.transition = 'opacity 0.4s ease';
        setTimeout(function() { t.remove(); }, 400);
    }, 2800);
}

function showToast(msg) { pzToast(msg); }

function PZUser() {
    try { return JSON.parse(localStorage.getItem('pzmc_current_user')); } catch (e) { return null; }
}

function logoutUser() {
    const fa = PZLang() === 'fa';
    if (confirm(fa ? 'آیا مطمئن هستید که میخواهید خارج شوید؟' : 'Are you sure you want to log out?')) {
        localStorage.removeItem('pzmc_current_user');
        pzToast(fa ? '👋 شما با موفقیت خارج شدید' : '👋 You have been logged out');
        setTimeout(function() { window.location.reload(); }, 500);
    }
}

const PZ_ICONS = {
    home: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    pack: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2 21 7v10l-9 5-9-5V7l9-5z"/><path d="M12 22V12M3.3 7.2 12 12l8.7-4.8"/></svg>',
    tool: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7z"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5"/></svg>'
};

function PZNavConfig() {
    const fa = PZLang() === 'fa';
    const dir = fa ? '' : 'e_';
    return {
        home: { label: fa ? 'خانه' : 'Home', href: 'index.html', icon: PZ_ICONS.home },
        packs: {
            label: fa ? 'پکها' : 'Packs',
            icon: PZ_ICONS.pack,
            items: [
                { ico: '📦', label: fa ? 'پکهای من' : 'My Packs', href: 'my-packs.html', key: 'my-packs' },
                { ico: '🎮', label: fa ? 'کالکشن میستی' : 'MysMce Collection', href: 'mysmce.html', key: 'mysmce' },
                { ico: '🔥', label: fa ? 'کالکشن دیویر' : 'Dewier MCBE', href: 'dewier.html', key: 'dewier' },
                { ico: '🟩', label: fa ? 'پکهای MCBE' : 'MCBE Packs', href: 'bedrock.html', key: 'bedrock' },
                { ico: '🟦', label: fa ? 'پکهای جاوا' : 'Java Packs', href: 'java.html', key: 'java' }
            ]
        },
        tools: {
            label: fa ? 'ابزارها' : 'Tools',
            icon: PZ_ICONS.tool,
            items: [
                { ico: '🔄', label: fa ? 'کانورتر پک' : 'Converter', href: fa ? 'fa_converter.html' : 'en_converter.html', key: 'converter' },
                { ico: '📄', label: fa ? 'مانیفست بیلدر' : 'Manifest Builder', href: 'manifest.html', key: 'manifest' },
                { ico: '📦', label: fa ? 'mcmeta بیلدر' : 'mcmeta Builder', href: 'mcmeta.html', key: 'mcmeta' },
                { ico: '🌤️', label: fa ? 'کانورتر اسکای' : 'Sky Converter', href: 'sky-converter.html', key: 'sky-converter' }
            ]
        },
        signup: { label: fa ? 'ثبتنام' : 'Sign up', href: 'signup.html' },
        login: { label: fa ? 'ورود' : 'Login', href: 'login.html' },
        dashboard: { label: fa ? 'داشبورد' : 'Dashboard', href: 'dashboard.html' },
        profile: { label: fa ? 'پروفایل' : 'Profile', href: 'profile.html' },
        logout: { label: fa ? 'خروج' : 'Logout' },
        lang: fa ? 'فارسی' : 'English',
        other: fa ? { flag: '🇺🇸', name: 'English', code: 'EN', href: '../en/' } : { flag: '🇮🇷', name: 'فارسی', code: 'FA', href: '../fa/' },
        self: fa ? { flag: '🇮🇷', name: 'فارسی', code: 'FA' } : { flag: '🇺🇸', name: 'English', code: 'EN' },
        authTitle: fa ? 'حساب کاربری' : 'Account',
        accountM: fa ? 'منوی حساب' : 'Account menu'
    };
}

function PZCurrentPage() {
    const p = location.pathname.split('/').pop().replace('.html', '') || 'index';
    if (p.indexOf('_converter') > -1) return 'converter';
    return p;
}

function PZOtherLangPath() {
    const cfg = PZNavConfig();
    const page = location.pathname.split('/').pop() || 'index.html';
    return cfg.other.href + page;
}

function renderPZNav() {
    const mount = document.getElementById('pzNavbar');
    if (!mount) return;
    const c = PZNavConfig();
    const cur = PZCurrentPage();
    const user = PZUser();
    const page = location.pathname.split('/').pop() || 'index.html';

    function item(it, extra) {
        const active = it.key === cur || (it.href === 'index.html' && cur === 'index');
        return '<li><a href="' + it.href + '" class="' + (active ? 'is-active' : '') + '" ' + (extra || '') + '><span class="pz-dd-ico">' + it.ico + '</span><span>' + it.label + '</span></a></li>';
    }

    const packsMenu = c.packs.items.map(function(it) { return item(it); }).join('');
    const toolsMenu = c.tools.items.map(function(it) { return item(it); }).join('');

    const links =
        '<li><a href="' + c.home.href + '" class="pz-nav-link ' + (cur === 'index' ? 'is-active' : '') + '">' + c.home.label + '</a></li>' +
        '<li class="pz-dd"><button type="button" class="pz-nav-link" data-dd>' + c.packs.label + '<span class="pz-caret"></span></button><ul class="pz-dd-menu">' + packsMenu + '</ul></li>' +
        '<li class="pz-dd"><button type="button" class="pz-nav-link" data-dd>' + c.tools.label + '<span class="pz-caret"></span></button><ul class="pz-dd-menu">' + toolsMenu + '</ul></li>';

    const side = user
        ? '<a href="' + c.profile.href + '"><img class="pz-avatar" alt="" src="' + (localStorage.getItem('pzmc_avatar_' + user.email) || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=0ea5e9&color=fff&size=40&bold=true') + '"></a>' +
          '<a class="pz-username" href="' + c.profile.href + '">' + (user.name || 'User') + '</a>' +
          '<a class="pz-btn pz-btn-green" href="' + c.dashboard.href + '">' + (PZLang() === 'fa' ? '📊 داشبورد' : '📊 Dashboard') + '</a>' +
          '<button type="button" class="pz-btn pz-btn-logout" onclick="logoutUser()">' + (PZLang() === 'fa' ? '🚪 خروج' : '🚪 Logout') + '</button>'
        : '<a class="pz-btn pz-btn-ghost" href="' + c.login.href + '">' + (PZLang() === 'fa' ? '🔐 ورود' : '🔐 Login') + '</a>' +
          '<a class="pz-btn pz-btn-primary" href="' + c.signup.href + '">' + (PZLang() === 'fa' ? '📝 ثبتنام' : '📝 Sign up') + '</a>';

    const langBtn =
        '<div class="pz-lang pz-dd"><button type="button" class="pz-lang-btn" data-dd>🌍 ' + c.lang + '<span class="pz-caret" style="width:7px;height:7px;"></span></button>' +
        '<div class="pz-lang-menu">' +
        '<a class="pz-lang-item is-active" href="' + page + '"><span>' + c.self.flag + '</span><span>' + c.self.name + '</span><span class="pz-lc">' + c.self.code + '</span></a>' +
        '<a class="pz-lang-item" href="' + PZOtherLangPath() + '"><span>' + c.other.flag + '</span><span>' + c.other.name + '</span><span class="pz-lc">' + c.other.code + '</span></a>' +
        '</div></div>';

    const mPacks = c.packs.items.map(function(it) {
        return '<a href="' + it.href + '" class="' + (it.key === cur ? 'is-active' : '') + '"><span class="pz-dd-ico">' + it.ico + '</span><span>' + it.label + '</span></a>';
    }).join('');
    const mTools = c.tools.items.map(function(it) {
        return '<a href="' + it.href + '" class="' + (it.key === cur ? 'is-active' : '') + '"><span class="pz-dd-ico">' + it.ico + '</span><span>' + it.label + '</span></a>';
    }).join('');

    const mActions = user
        ? '<a class="pz-btn pz-btn-green" href="' + c.dashboard.href + '">' + (PZLang() === 'fa' ? '📊 داشبورد' : '📊 Dashboard') + '</a>' +
          '<a class="pz-btn pz-btn-ghost" href="' + c.profile.href + '">' + (PZLang() === 'fa' ? '👤 پروفایل' : '👤 Profile') + '</a>' +
          '<button type="button" class="pz-btn pz-btn-logout" onclick="logoutUser()">' + (PZLang() === 'fa' ? '🚪 خروج' : '🚪 Logout') + '</button>'
        : '<a class="pz-btn pz-btn-primary" href="' + c.signup.href + '">' + (PZLang() === 'fa' ? '📝 ثبتنام' : '📝 Sign up') + '</a>' +
          '<a class="pz-btn pz-btn-ghost" href="' + c.login.href + '">' + (PZLang() === 'fa' ? '🔐 ورود' : '🔐 Login') + '</a>';

    mount.innerHTML =
        '<nav class="pz-nav" aria-label="main">' +
        '<a class="pz-nav-logo" href="index.html"><span class="pz-logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M12 2 21 7v10l-9 5-9-5V7l9-5z"/><path d="M12 22V12M3.3 7.2 12 12l8.7-4.8"/></svg></span><b>PACKZONE MC</b></a>' +
        '<ul class="pz-nav-links">' + links + '</ul>' +
        '<div class="pz-nav-side">' + side + langBtn +
        '<button type="button" class="pz-burger" id="pzBurger" aria-label="' + c.accountM + '"><span></span><span></span><span></span></button>' +
        '</div></nav>' +
        '<div class="pz-mobile-wrap" id="pzMobileWrap">' +
        '<div class="pz-mobile-back" id="pzMobileBack"></div>' +
        '<aside class="pz-mobile" id="pzMobile">' +
        '<div class="pz-mobile-head"><b>PACKZONE MC</b><button type="button" class="pz-mobile-close" id="pzMobileClose">✕</button></div>' +
        '<div class="pz-m-group"><a class="pz-m-toggle" href="' + c.home.href + '"><span class="pz-m-main"><span class="pz-m-ico">' + c.home.icon + '</span>' + c.home.label + '</span></a></div>' +
        '<div class="pz-m-group" data-mgroup><button type="button" class="pz-m-toggle" data-macc><span class="pz-m-main"><span class="pz-m-ico">' + c.packs.icon + '</span>' + c.packs.label + '</span><span class="pz-m-arrow"></span></button><div class="pz-m-sub">' + mPacks + '</div></div>' +
        '<div class="pz-m-group" data-mgroup><button type="button" class="pz-m-toggle" data-macc><span class="pz-m-main"><span class="pz-m-ico">' + c.tools.icon + '</span>' + c.tools.label + '</span><span class="pz-m-arrow"></span></button><div class="pz-m-sub">' + mTools + '</div></div>' +
        '<div class="pz-m-actions">' + mActions + '</div>' +
        '<div class="pz-lang-row"><a class="is-active" href="' + page + '">' + c.self.flag + ' ' + c.self.name + '</a><a href="' + PZOtherLangPath() + '">' + c.other.flag + ' ' + c.other.name + '</a></div>' +
        '</aside></div>';

    const burger = document.getElementById('pzBurger');
    const wrap = document.getElementById('pzMobileWrap');
    const back = document.getElementById('pzMobileBack');
    const closeBtn = document.getElementById('pzMobileClose');

    function closeMobile() {
        wrap.classList.remove('pz-open');
        burger.classList.remove('pz-x');
        document.body.classList.remove('pz-locked');
    }

    burger.addEventListener('click', function() {
        const open = wrap.classList.toggle('pz-open');
        burger.classList.toggle('pz-x', open);
        document.body.classList.toggle('pz-locked', open);
        wrap.querySelectorAll('[data-mgroup]').forEach(function(g) { g.classList.remove('pz-dd-open'); });
    });
    back.addEventListener('click', closeMobile);
    closeBtn.addEventListener('click', closeMobile);

    wrap.querySelectorAll('[data-macc]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const g = btn.closest('[data-mgroup]');
            const wasOpen = g.classList.contains('pz-dd-open');
            wrap.querySelectorAll('[data-mgroup]').forEach(function(o) { o.classList.remove('pz-dd-open'); });
            g.classList.toggle('pz-dd-open', !wasOpen);
        });
    });

    wrap.querySelectorAll('.pz-m-sub a, .pz-m-actions a, .pz-m-toggle[href]').forEach(function(a) {
        a.addEventListener('click', closeMobile);
    });

    mount.querySelectorAll('[data-dd]').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const li = btn.closest('.pz-dd');
            const wasOpen = li.classList.contains('pz-dd-open');
            document.querySelectorAll('.pz-dd-open').forEach(function(o) { o.classList.remove('pz-dd-open'); });
            li.classList.toggle('pz-dd-open', !wasOpen);
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.pz-dd')) {
            document.querySelectorAll('.pz-dd-open').forEach(function(o) { o.classList.remove('pz-dd-open'); });
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobile();
            document.querySelectorAll('.pz-dd-open').forEach(function(o) { o.classList.remove('pz-dd-open'); });
        }
    });
}

function hidePZLoader() {
    const l = document.getElementById('pzLoader');
    if (l && !l.classList.contains('is-hidden')) {
        l.classList.add('is-hidden');
        setTimeout(function() { l.remove(); }, 600);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderPZNav();
    updateNotificationBadge();
    window.addEventListener('load', function() { setTimeout(hidePZLoader, 200); });
    setTimeout(hidePZLoader, 1400);

    var bar = document.getElementById('pzProgress');
    if (bar) {
        window.addEventListener('scroll', function() {
            var p = document.documentElement;
            var s = p.scrollTop / (p.scrollHeight - p.clientHeight) * 100;
            bar.style.width = s + '%';
        }, { passive: true });
    }

    document.addEventListener('visibilitychange', function() {
        document.body.classList.toggle('pz-paused', document.hidden);
    });
});
