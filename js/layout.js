// Injects sidebar + topbar into .layout element
// Call: initLayout('dashboard') — pass active page key
function initLayout(activePage, pageTitle) {
  Auth.guardPage();

  const user = Auth.getUser();

  // Patients never see the staff dashboard — they get their own booking + chat portal
  if (user?.role === 'patient') {
    window.location.href = '../patient-portal.html';
    return;
  }

  const isAdmin = user?.role === 'admin';
  const isStaff = ['admin', 'secretary'].includes(user?.role);
  const isDoctor = user?.role === 'doctor';

  const nav = [
    { key:'dashboard', icon:'ti-dashboard',      label:'Tableau de bord', show: true },
    { key:'patients',  icon:'ti-users',           label:'Patients',        show: isStaff || isDoctor },
    { key:'doctors',   icon:'ti-stethoscope',     label:'Médecins',        show: isStaff },
    { key:'appointments', icon:'ti-calendar',     label:'Rendez-vous',     show: true },
    { key:'messages',  icon:'ti-message-circle',  label:'Messages',        show: isDoctor || isStaff },
    { key:'consultations', icon:'ti-clipboard-heart', label:'Consultations', show: isDoctor || isStaff },
    { key:'ordonnances', icon:'ti-file-medical',    label:'Ordonnances',     show: isDoctor || isStaff },
    { key:'invoices',  icon:'ti-receipt',         label:'Factures',        show: isStaff },
    { key:'staff',     icon:'ti-user-plus',       label:'Créer un compte', show: isAdmin },
    { key:'users',     icon:'ti-users-group',     label:'Utilisateurs',    show: isAdmin },
    { key:'profile',   icon:'ti-user-circle',     label:'Mon Profil',      show: true },
  ].filter(n => n.show);

  const navHTML = nav.map(n => `
    <div class="nav-item ${activePage === n.key ? 'active' : ''}" onclick="navigate('${n.key}')">
      <i class="ti ${n.icon}"></i>
      <span>${n.label}</span>
    </div>
  `).join('');

  const initials = (user?.name || 'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  const layout = document.querySelector('.layout');
  layout.innerHTML = `
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon"><i class="ti ti-heart-rate-monitor"></i></div>
        <div>
          <div class="logo-text">Gestion Clinique</div>
          <div class="logo-sub">Administration</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-label">Navigation</div>
        ${navHTML}
      </nav>
      <div class="sidebar-footer">
        <div class="user-chip" id="sidebarUser" onclick="navigate('profile')" style="cursor:pointer">
          <div class="user-avatar">${user?.avatar ? `<img src="${API_BASE}${user.avatar}?v=${Date.now()}" alt="">` : initials}</div>
          <div>
            <div class="user-name">${user?.name || ''}</div>
            <div class="user-role">${user?.role || ''}</div>
          </div>
        </div>
        <div class="nav-item" onclick="logout()" style="margin-top:4px">
          <i class="ti ti-logout"></i><span>Déconnexion</span>
        </div>
      </div>
    </aside>
    <div class="main" id="mainArea">
      <header class="topbar">
        <div style="display:flex;align-items:center;gap:12px;min-width:0">
          <button class="btn btn-ghost btn-sm menu-btn" id="menuBtn" onclick="toggleSidebar()">
            <i class="ti ti-menu-2"></i>
          </button>
          <span class="topbar-title" id="pageTitle">${pageTitle || ''}</span>
        </div>
        <div class="topbar-actions" id="topbarActions"></div>
      </header>
      <div class="page-content" id="pageContent"></div>
    </div>
  `;

  // close the sidebar automatically after navigating on mobile
  layout.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('open');
    });
  });
}

function navigate(page) {
  window.location.href = `${page}.html`;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}