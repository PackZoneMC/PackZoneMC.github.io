// ============================================================
// ===== سیستم نوتیفیکیشن مرکزی =====
// ============================================================

// ===== ۱. دریافت همه نوتیفیکیشن‌ها =====
function getNotifications() {
    return JSON.parse(localStorage.getItem('pzmc_notifications')) || [];
}

// ===== ۲. ذخیره نوتیفیکیشن‌ها =====
function saveNotifications(notifications) {
    localStorage.setItem('pzmc_notifications', JSON.stringify(notifications));
}

// ===== ۳. افزودن نوتیفیکیشن جدید =====
function addNotification(type, data) {
    const notifications = getNotifications();
    notifications.unshift({
        id: Date.now(),
        type: type, // 'comment', 'signup', 'login'
        ...data,
        time: new Date().toLocaleString('fa-IR'),
        read: false
    });
    saveNotifications(notifications);
    updateNotificationBadge();
    
    // نمایش نوتیفیکیشن در صورت فعال بودن
    if (typeof showToastNotification === 'function') {
        const msg = getNotificationMessage(type, data);
        showToastNotification(msg);
    }
}

// ===== ۴. پیام نوتیفیکیشن =====
function getNotificationMessage(type, data) {
    switch(type) {
        case 'comment':
            return `💬 نظر جدید از ${data.user} در ${data.packName}`;
        case 'signup':
            return `🆕 کاربر جدید: ${data.user} ثبت‌نام کرد!`;
        case 'login':
            return `👤 ${data.user} وارد سایت شد!`;
        default:
            return '🔔 نوتیفیکیشن جدید';
    }
}

// ===== ۵. به‌روزرسانی تعداد نوتیفیکیشن‌ها =====
function updateNotificationBadge() {
    const notifications = getNotifications();
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unread > 0 ? unread : '';
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }
}

// ===== ۶. علامت‌گذاری همه به عنوان خوانده شده =====
function markAllAsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => n.read = true);
    saveNotifications(notifications);
    updateNotificationBadge();
}

// ===== ۷. نمایش پنل نوتیفیکیشن‌ها =====
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            renderNotifications();
        }
    }
}

// ===== ۸. رندر نوتیفیکیشن‌ها در پنل =====
function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (!list) return;
    
    const notifications = getNotifications();
    if (notifications.length === 0) {
        list.innerHTML = '<div class="empty-notifications">📭 هیچ نوتیفیکیشنی وجود ندارد</div>';
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
    
    // کلیک روی هر آیتم برای علامت‌گذاری به عنوان خوانده شده
    list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            markNotificationAsRead(id);
        });
    });
}

// ===== ۹. علامت‌گذاری یک نوتیفیکیشن به عنوان خوانده شده =====
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

// ===== ۱۰. حذف همه نوتیفیکیشن‌ها =====
function clearAllNotifications() {
    if (confirm('آیا مطمئن هستید که می‌خواهید همه نوتیفیکیشن‌ها را پاک کنید؟')) {
        localStorage.removeItem('pzmc_notifications');
        updateNotificationBadge();
        if (document.getElementById('notificationList')) {
            renderNotifications();
        }
    }
            }
