/* PackZone MC — Cloud API + Comments + Favorites (v1.0)
 * Backend: textdb.dev (free, no server needed)
 * All user actions (signup / comment / save) are synced to the cloud DB
 * and pushed as events for the admin panel notifications.
 */
(function () {
    'use strict';

    /* ================= CONFIG ================= */
    var DB_URL = 'https://textdb.dev/api/data/pzmc-db-7f3k9x2v8q';
    var CACHE_KEY = 'pzmc_cloud_cache';
    var EMPTY_DB = { users: [], comments: [], favorites: [], events: [], meta: { v: 1 } };

    /* ================= HELPERS ================= */
    function PZLang() {
        return (document.documentElement.lang || 'fa').toLowerCase().indexOf('en') === 0 ? 'en' : 'fa';
    }
    function esc(text) {
        var d = document.createElement('div');
        d.textContent = (text == null ? '' : String(text));
        return d.innerHTML;
    }
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    /* ================= CLOUD DB ================= */
    var _lock = Promise.resolve();
    var _memDb = null;

    function cacheGet() {
        try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null; } catch (e) { return null; }
    }
    function cacheSet(db) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(db)); } catch (e) { }
    }

    function dbRead() {
        return fetch(DB_URL + '?t=' + Date.now(), { method: 'GET', cache: 'no-store' })
            .then(function (r) { return r.text(); })
            .then(function (t) {
                var clean = String(t || '').replace(/=+\s*$/, '').trim();
                if (!clean) throw new Error('empty');
                var db = JSON.parse(clean);
                if (!db || typeof db !== 'object') throw new Error('bad');
                ['users', 'comments', 'favorites', 'events'].forEach(function (k) { if (!Array.isArray(db[k])) db[k] = []; });
                _memDb = db;
                cacheSet(db);
                return db;
            })
            .catch(function () {
                var c = cacheGet() || _memDb || JSON.parse(JSON.stringify(EMPTY_DB));
                return c;
            });
    }

    function dbWrite(db) {
        db.meta = db.meta || {}; db.meta.updated = new Date().toISOString();
        var body = JSON.stringify(db);
        cacheSet(db);
        _memDb = db;
        return fetch(DB_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: body })
            .then(function (r) {
                if (!r.ok) throw new Error('write failed ' + r.status);
                return true;
            });
    }

    /* serialized read-modify-write to avoid races inside one page */
    function mutate(fn) {
        var run = _lock.then(function () {
            return dbRead().then(function (db) {
                var out = fn(db) || null;
                return dbWrite(db).then(function () { return out; });
            });
        });
        _lock = run.catch(function () { });
        return run;
    }

    function pushEvent(db, type, user, pack, text) {
        db.events.unshift({ id: uid(), type: type, user: user, pack: pack || '', text: text || '', date: new Date().toISOString(), read: false });
        if (db.events.length > 400) db.events.length = 400;
    }

    /* ================= PUBLIC API ================= */
    function PZDBSignup(name, email, pass) {
        return mutate(function (db) {
            var exists = db.users.some(function (u) { return (u.email || '').toLowerCase() === email.toLowerCase(); });
            if (exists) return { ok: false, reason: 'exists' };
            db.users.push({ name: name, email: email, pass: pass, date: new Date().toISOString() });
            pushEvent(db, 'signup', name, '', '');
            return { ok: true };
        });
    }

    function PZDBLogin(email, pass) {
        return dbRead().then(function (db) {
            var u = db.users.filter(function (x) { return (x.email || '').toLowerCase() === email.toLowerCase(); })[0];
            if (!u) return { ok: false, reason: 'notfound' };
            if (String(u.pass) !== String(pass)) return { ok: false, reason: 'wrongpass' };
            mutate(function (db2) { pushEvent(db2, 'login', u.name, '', ''); });
            return { ok: true, user: { name: u.name, email: u.email } };
        });
    }

    function PZDBAddComment(pack, userName, text) {
        return mutate(function (db) {
            var c = { id: uid(), pack: pack, user: userName, text: text, date: new Date().toISOString() };
            db.comments.push(c);
            if (db.comments.length > 800) db.comments = db.comments.slice(-800);
            pushEvent(db, 'comment', userName, pack, text);
            return c;
        });
    }

    function PZDBAddFavorite(pack, userName) {
        return mutate(function (db) {
            var dup = db.favorites.some(function (f) { return f.pack === pack && f.user === userName; });
            if (!dup) {
                db.favorites.push({ user: userName, pack: pack, date: new Date().toISOString() });
                pushEvent(db, 'save', userName, pack, '');
            }
            return true;
        });
    }

    function PZDBDeleteComment(id) {
        return mutate(function (db) {
            db.comments = db.comments.filter(function (c) { return c.id !== id; });
            return true;
        });
    }

    /* ================= UI: TOAST ================= */
    function ensureToastCss() {
        if (document.getElementById('pzApiToastCss')) return;
        var st = document.createElement('style');
        st.id = 'pzApiToastCss';
        st.textContent = '.toast-message{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(18,27,42,.95);color:#e0e0e0;padding:14px 28px;border-radius:14px;border:1px solid rgba(56,189,248,.2);box-shadow:0 8px 40px rgba(0,0,0,.5);font-size:.95rem;z-index:99999;font-family:inherit!important;text-align:center;animation:pzToastUp .4s ease}@keyframes pzToastUp{from{opacity:0;transform:translateX(-50%) translateY(20px) scale(.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}';
        document.head.appendChild(st);
    }

    function showToast(message, type) {
        ensureToastCss();
        var old = document.querySelector('.toast-message');
        if (old) old.remove();
        var t = document.createElement('div');
        t.className = 'toast-message';
        t.textContent = message;
        if (type === 'error') t.style.borderColor = '#f43f5e';
        else if (type === 'success') t.style.borderColor = '#10b981';
        document.body.appendChild(t);
        setTimeout(function () {
            t.style.opacity = '0';
            t.style.transition = 'opacity .5s ease';
            setTimeout(function () { t.remove(); }, 500);
        }, 3000);
    }

    /* ================= UI: COMMENT MODAL ================= */
    function ensureModal() {
        if (document.getElementById('commentModal')) return;

        var st = document.createElement('style');
        st.textContent =
            '.comment-modal{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:1000;justify-content:center;align-items:center;animation:pzFadeIn .3s ease;font-family:inherit}' +
            '.comment-modal.open{display:flex}' +
            '@keyframes pzFadeIn{from{opacity:0}to{opacity:1}}' +
            '.comment-modal .modal-box{background:#101828;border:1px solid rgba(56,189,248,.18);border-radius:22px;padding:24px;width:92%;max-width:520px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:pzPop .35s ease}' +
            '@keyframes pzPop{from{opacity:0;transform:scale(.92) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
            '.comment-modal .modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}' +
            '.comment-modal .modal-header h3{color:#fff;font-size:1.05rem;font-weight:700;margin:0}' +
            '.comment-modal .close-btn{background:rgba(255,255,255,.06);border:none;color:#aaa;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:1rem;transition:.25s}' +
            '.comment-modal .close-btn:hover{background:rgba(244,63,94,.18);color:#f43f5e}' +
            '.comment-modal .comments-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:4px 2px;margin-bottom:14px}' +
            '.comment-modal .no-comments{text-align:center;color:rgba(255,255,255,.35);padding:26px 10px;font-size:.9rem}' +
            '.comment-item{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:12px 16px}' +
            '.comment-user{color:#7dd3fc;font-weight:700;font-size:.88rem;margin-bottom:4px}' +
            '.comment-text{color:#e2e8f0;font-size:.92rem;line-height:1.7;word-wrap:break-word;white-space:pre-wrap}' +
            '.comment-date{display:block;color:rgba(255,255,255,.3);font-size:.7rem;margin-top:6px}' +
            '.comment-modal .comment-input-area{display:flex;gap:10px;border-top:1px solid rgba(255,255,255,.06);padding-top:12px}' +
            '.comment-modal .comment-input-area input{flex:1;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2);color:#fff;font-size:.9rem;outline:none;transition:.3s;font-family:inherit;min-width:0}' +
            '.comment-modal .comment-input-area input:focus{border-color:#38bdf8}' +
            '.comment-modal .comment-input-area input::placeholder{color:rgba(255,255,255,.25)}' +
            '.comment-modal .comment-input-area .send-btn{background:linear-gradient(135deg,#38bdf8,#7dd3fc);color:#fff;border:none;padding:10px 18px;border-radius:10px;cursor:pointer;font-weight:600;font-size:.85rem;transition:.3s;font-family:inherit;white-space:nowrap}' +
            '.comment-modal .comment-input-area .send-btn:hover{transform:scale(1.04)}' +
            '.comment-modal .comment-input-area .send-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}';
        document.head.appendChild(st);

        var fa = PZLang() === 'fa';
        var wrap = document.createElement('div');
        wrap.className = 'comment-modal';
        wrap.id = 'commentModal';
        wrap.innerHTML =
            '<div class="modal-box">' +
            '<div class="modal-header"><h3 id="commentModalTitle">' + (fa ? '💬 نظرات' : '💬 Comments') + '</h3><button class="close-btn" onclick="closeCommentModal()">✕</button></div>' +
            '<div class="comments-list" id="commentsList"></div>' +
            '<div class="comment-input-area"><input type="text" id="commentInput" maxlength="500" placeholder="' + (fa ? 'نظر خود را بنویسید...' : 'Write your comment...') + '"><button class="send-btn" id="commentSendBtn">' + (fa ? '📤 ارسال' : '📤 Send') + '</button></div>' +
            '</div>';
        document.body.appendChild(wrap);

        wrap.addEventListener('click', function (e) { if (e.target === wrap) closeCommentModal(); });
        wrap.querySelector('#commentSendBtn').addEventListener('click', sendComment);
        wrap.querySelector('#commentInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') sendComment(); });
    }

    var currentCommentPack = '';

    function renderCommentsList(packName, comments) {
        var fa = PZLang() === 'fa';
        var list = document.getElementById('commentsList');
        if (!list) return;
        if (!comments || comments.length === 0) {
            list.innerHTML = '<div class="no-comments">' + (fa ? '💬 هنوز نظری ثبت نشده است' : '💬 No comments yet') + '</div>';
            return;
        }
        var html = '';
        comments.slice().reverse().forEach(function (c) {
            var d = new Date(c.date);
            var dateTxt = isNaN(d) ? '' : d.toLocaleDateString(fa ? 'fa-IR' : 'en-US') + ' ' + d.toLocaleTimeString(fa ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
            html += '<div class="comment-item"><div class="comment-user">' + esc(c.user) + '</div><div class="comment-text">' + esc(c.text) + '</div><span class="comment-date">' + dateTxt + '</span></div>';
        });
        list.innerHTML = html;
    }

    function openCommentModal(packName) {
        ensureModal();
        currentCommentPack = packName;
        var fa = PZLang() === 'fa';
        document.getElementById('commentModalTitle').textContent = '💬 ' + (fa ? 'نظرات (' : 'Comments (') + packName + ')';
        document.getElementById('commentInput').value = '';
        document.getElementById('commentModal').classList.add('open');
        document.getElementById('commentsList').innerHTML = '<div class="no-comments">⏳ ' + (fa ? 'در حال بارگذاری نظرات...' : 'Loading comments...') + '</div>';
        dbRead().then(function (db) {
            if (currentCommentPack !== packName) return;
            renderCommentsList(packName, db.comments.filter(function (c) { return c.pack === packName; }));
        });
        if (document.getElementById('commentInput')) document.getElementById('commentInput').focus();
    }

    function closeCommentModal() {
        var m = document.getElementById('commentModal');
        if (m) m.classList.remove('open');
        currentCommentPack = '';
    }

    function sendComment() {
        var fa = PZLang() === 'fa';
        var input = document.getElementById('commentInput');
        if (!input) return;
        var text = (input.value || '').trim();
        if (!text) { showToast(fa ? '⚠️ لطفاً متن نظر را وارد کنید' : '⚠️ Please write a comment'); return; }
        var user = null;
        try { user = JSON.parse(localStorage.getItem('pzmc_current_user')); } catch (e) { }
        if (!user) {
            showToast(fa ? '❌ لطفاً ابتدا وارد حساب خود شوید!' : '❌ Please login first!', 'error');
            setTimeout(function () { window.location.href = 'login.html'; }, 1400);
            return;
        }
        var btn = document.getElementById('commentSendBtn');
        if (btn) btn.disabled = true;
        var userName = user.name || (fa ? 'کاربر ناشناس' : 'Anonymous');
        PZDBAddComment(currentCommentPack, userName, text).then(function () {
            if (btn) btn.disabled = false;
            input.value = '';
            dbRead().then(function (db) {
                renderCommentsList(currentCommentPack, db.comments.filter(function (c) { return c.pack === currentCommentPack; }));
            });
            showToast(fa ? '✅ نظر شما ثبت شد!' : '✅ Your comment was added!', 'success');
        }).catch(function () {
            if (btn) btn.disabled = false;
            showToast(fa ? '❌ خطا در ثبت نظر، دوباره تلاش کنید' : '❌ Failed to add comment, try again', 'error');
        });
    }

    /* ================= SAVE / FAVORITE ================= */
    function checkUser() {
        try { return JSON.parse(localStorage.getItem('pzmc_current_user')) !== null; } catch (e) { return false; }
    }

    function savePack(packName, btn) {
        var fa = PZLang() === 'fa';
        if (!checkUser()) {
            showToast(fa ? '❌ لطفاً ابتدا وارد حساب خود شوید!' : '❌ Please login first!', 'error');
            setTimeout(function () { window.location.href = 'login.html'; }, 1400);
            return;
        }
        var user = null;
        try { user = JSON.parse(localStorage.getItem('pzmc_current_user')); } catch (e) { }
        var users = [];
        try { users = JSON.parse(localStorage.getItem('pzmc_users')) || []; } catch (e) { }
        var idx = -1;
        for (var i = 0; i < users.length; i++) if (users[i].email === user.email) { idx = i; break; }
        if (idx === -1) { users.push({ email: user.email, name: user.name, favorites: [] }); idx = users.length - 1; }
        if (!users[idx].favorites) users[idx].favorites = [];
        if (users[idx].favorites.indexOf(packName) > -1) {
            showToast(fa ? '⚠️ این پک قبلاً ذخیره شده است!' : '⚠️ Already saved!', 'error');
            return;
        }
        users[idx].favorites.push(packName);
        localStorage.setItem('pzmc_users', JSON.stringify(users));
        user.favorites = users[idx].favorites;
        localStorage.setItem('pzmc_current_user', JSON.stringify(user));
        PZDBAddFavorite(packName, user.name || user.email);
        showToast(fa ? '✅ پک "' + packName + '" ذخیره شد! ⭐' : '✅ "' + packName + '" saved! ⭐', 'success');
        var card = document.querySelector('.card[data-pack="' + packName.replace(/"/g, '\\"') + '"]');
        var b = btn || (card ? card.querySelector('.save-btn') : null);
        if (b) { b.textContent = fa ? '⭐ ذخیره شد' : '⭐ Saved'; b.disabled = true; }
    }

    /* restore saved-state on load */
    function restoreSavedButtons() {
        var user = null;
        try { user = JSON.parse(localStorage.getItem('pzmc_current_user')); } catch (e) { }
        if (!user) return;
        var users = [];
        try { users = JSON.parse(localStorage.getItem('pzmc_users')) || []; } catch (e) { }
        var u = null;
        for (var i = 0; i < users.length; i++) if (users[i].email === user.email) { u = users[i]; break; }
        if (!u || !u.favorites) return;
        document.querySelectorAll('.card[data-pack]').forEach(function (card) {
            var packName = card.getAttribute('data-pack');
            if (u.favorites.indexOf(packName) > -1) {
                var btn = card.querySelector('.save-btn');
                if (btn) { btn.textContent = PZLang() === 'fa' ? '⭐ ذخیره شد' : '⭐ Saved'; btn.disabled = true; }
            }
        });
    }

    /* ================= COPY LINK ================= */
    function showFeedback(btn, success) {
        var feedback = btn && btn.querySelector ? btn.querySelector('.copy-feedback') : null;
        if (feedback) {
            feedback.textContent = success ? (PZLang() === 'fa' ? '✓ کپی شد!' : '✓ Copied!') : '❌';
            feedback.classList.add('show');
            setTimeout(function () { feedback.classList.remove('show'); }, 2000);
        }
    }

    function fallbackCopy(text, btn) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand('copy'); showFeedback(btn, true); } catch (e) { showFeedback(btn, false); }
        document.body.removeChild(textarea);
    }

    function copyLink(packName, btn) {
        var url = window.location.href.split('?')[0] + '?pack=' + encodeURIComponent(packName);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function () { showFeedback(btn, true); }).catch(function () { fallbackCopy(url, btn); });
        } else { fallbackCopy(url, btn); }
    }

    window.copyLink = copyLink;
    window.fallbackCopy = fallbackCopy;
    window.showFeedback = showFeedback;

    /* ================= BUTTON CSS (for pages without card-actions styles) ================= */
    function ensureButtonsCss() {
        if (document.getElementById('pzApiBtnCss')) return;
        var st = document.createElement('style');
        st.id = 'pzApiBtnCss';
        st.textContent =
            '.card-actions{display:flex;justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap}' +
            '.card-actions button{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#ddd;padding:6px 14px;border-radius:30px;font-size:.75rem;cursor:pointer;transition:all .3s ease;font-family:inherit;display:flex;align-items:center;gap:4px}' +
            '.card-actions button:hover{background:rgba(56,189,248,.15);border-color:#38bdf8;color:#fff}' +
            '.card-actions .copy-btn{background:rgba(0,200,83,.1);border-color:rgba(0,200,83,.2);color:#00c853}' +
            '.card-actions .copy-btn:hover{background:rgba(0,200,83,.2)}' +
            '.card-actions .save-btn{background:rgba(253,203,110,.1);border-color:rgba(253,203,110,.2);color:#fbbf24}' +
            '.card-actions .save-btn:hover{background:rgba(253,203,110,.2)}' +
            '.card-actions .comment-btn{background:rgba(56,189,248,.1);border-color:rgba(56,189,248,.2);color:#7dd3fc}' +
            '.card-actions .comment-btn:hover{background:rgba(56,189,248,.2)}' +
            '.card-actions button:disabled{opacity:.5;cursor:not-allowed}' +
            '.card-actions .copy-feedback{font-size:.68rem;opacity:0;transition:.25s}' +
            '.card-actions .copy-feedback.show{opacity:1}';
        document.head.appendChild(st);
    }

    /* ================= EXPORT GLOBALS ================= */
    window.PZDB = {
        read: dbRead,
        mutate: mutate,
        signup: PZDBSignup,
        login: PZDBLogin,
        addComment: PZDBAddComment,
        addFavorite: PZDBAddFavorite,
        deleteComment: PZDBDeleteComment,
        pushEvent: function (type, user, pack, text) { return mutate(function (db) { pushEvent(db, type, user, pack, text); }); }
    };
    window.showToast = showToast;
    window.openCommentModal = openCommentModal;
    window.closeCommentModal = closeCommentModal;
    window.sendComment = sendComment;
    window.savePack = savePack;
    window.checkUser = checkUser;
    window.escapeHtml = esc;
    /* legacy helpers kept compatible */
    window.getComments = function (packName) {
        var all = {};
        try { all = JSON.parse(localStorage.getItem('pzmc_comments')) || {}; } catch (e) { }
        return all[packName] || [];
    };
    window.saveComments = function () { /* cloud handles storage now */ };

    function boot() {
        ensureButtonsCss();
        ensureModal();
        restoreSavedButtons();
        dbRead().then(function (db) {
            /* mirror cloud comments into legacy localStorage so old UI bits still show counts */
            var grouped = {};
            db.comments.forEach(function (c) {
                if (!grouped[c.pack]) grouped[c.pack] = [];
                grouped[c.pack].push(c);
            });
            try { localStorage.setItem('pzmc_comments', JSON.stringify(grouped)); } catch (e) { }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
