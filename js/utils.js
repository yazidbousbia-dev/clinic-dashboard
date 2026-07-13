// =============================================
// Clinic Dashboard — Shared Utilities
// =============================================

const API_BASE = 'http://localhost:8000/api';

// ---- Auth helpers ----
const Auth = {
  getToken:  () => localStorage.getItem('clinic_token'),
  getUser:   () => JSON.parse(localStorage.getItem('clinic_user') || 'null'),
  save: (token, user) => {
    localStorage.setItem('clinic_token', token);
    localStorage.setItem('clinic_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('clinic_token');
    localStorage.removeItem('clinic_user');
  },
  isLoggedIn: () => !!localStorage.getItem('clinic_token'),
  guardPage: () => {
    if (!Auth.isLoggedIn()) { // detect if we are already at root level
    const isInPages = window.location.pathname.includes("/pages/");
    window.location.href = isInPages ? "../login.html" : "login.html"; }
  },
  redirectIfLoggedIn: () => {
    if (Auth.isLoggedIn()) {
      const user = Auth.getUser();
      window.location.href = (user?.role === 'patient') ? 'patient-portal.html' : 'pages/dashboard.html';
    }
  },
};

// ---- API call helper ----
async function api(method, endpoint, data = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  const token = Auth.getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (data)  opts.body = JSON.stringify(data);

  const res = await fetch(API_BASE + endpoint, opts);
  const json = await res.json().catch(() => ({}));

  if (res.status === 401) {
    Auth.clear();
    // detect if we are already at root level
    const isInPages = window.location.pathname.includes("/pages/");
    window.location.href = isInPages ? "../login.html" : "login.html";
    return;
  }
  if (!res.ok) {
    const msg = json.message || json.errors
      ? (typeof json.errors === 'object' ? Object.values(json.errors).flat().join(', ') : json.message)
      : 'Erreur serveur';
    throw new Error(msg);
  }
  return json;
}

// ---- Toast notifications ----
function showToast(msg, type = 'default') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ---- Badge helper ----
function statusBadge(status) {
  const map = {
    pending:   ['badge-yellow', 'En attente'],
    confirmed: ['badge-blue',   'Confirmé'],
    completed: ['badge-green',  'Terminé'],
    cancelled: ['badge-red',    'Annulé'],
    paid:      ['badge-green',  'Payé'],
    unpaid:    ['badge-yellow', 'Non payé'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ---- Date format ----
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ', { day:'2-digit', month:'short', year:'numeric' });
}

// ---- Populate sidebar user info ----
function renderSidebarUser() {
  const user = Auth.getUser();
  if (!user) return;
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const el = document.getElementById('sidebarUser');
  if (el) {
    el.querySelector('.user-avatar').textContent = initials;
    el.querySelector('.user-name').textContent = user.name;
    el.querySelector('.user-role').textContent = user.role;
  }
}

// ---- Logout ----
async function logout() {
  try { await api('POST', '/logout'); } catch (_) {}
  Auth.clear();
  // detect if we are already at root level
    const isInPages = window.location.pathname.includes("/pages/");
    window.location.href = isInPages ? "../login.html" : "login.html";
}

// ---- Modal helpers ----
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});