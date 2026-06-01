// js/renderer.js — Main controller for the dashboard shell
// Handles: session guard, sidebar user info, nav routing, window controls, logout

document.addEventListener('DOMContentLoaded', async () => {

  // ── Guard: redirect to login if not authenticated ──
  const user = window.getSession();
  if (!user) {
    window.location.replace('login.html');
    return;
  }

  // ── Ensure window.api is available (preload must have run) ──
  if (!window.api) {
    console.error('window.api not available — preload.js may have failed');
    window.location.replace('login.html');
    return;
  }

  // ── Window controls ──
  document.getElementById('wc-close')   ?.addEventListener('click', () => window.api.close());
  document.getElementById('wc-minimize')?.addEventListener('click', () => window.api.minimize());
  document.getElementById('wc-maximize')?.addEventListener('click', () => window.api.maximize());

  // ── Populate sidebar user info ──
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl   = document.getElementById('sidebar-name');
  const sidEl    = document.getElementById('sidebar-sid');

  if (avatarEl && user) {
    avatarEl.textContent = window.getInitials(user.name);
    avatarEl.style.background = user.avatar_color || '#c084fc';
  }
  if (nameEl) nameEl.textContent = user.name || 'Student';
  if (sidEl)  sidEl.textContent  = user.student_id || '';

  // ── Fetch and show notification count ──
  try {
    const notifs = await window.api.getNotifications(user.id);
    const unread = notifs.filter(n => !n.is_read).length;
    const badge  = document.getElementById('notif-badge');
    if (badge && unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'inline';
    }
  } catch (e) { /* silent */ }

  // ── Navigation routing ──
  const pageContent = document.getElementById('page-content');
  const navLinks    = document.querySelectorAll('.nav-link[data-page]');

  // Page renderer map
  const pageRenderers = {
    dashboard:     () => window.renderDashboard(pageContent, user),
    courses:       () => window.renderCourses(pageContent, user),
    grades:        () => window.renderGrades(pageContent, user),
    assignments:   () => window.renderAssignments(pageContent, user),
    schedule:      () => window.renderSchedule(pageContent, user),
    attendance:    () => window.renderAttendance(pageContent, user),
    announcements: () => window.renderAnnouncements(pageContent, user),
    notifications: () => window.renderNotifications(pageContent, user),
    profile:       () => window.renderProfile(pageContent, user),
    shop:          () => window.renderShop(pageContent, user),
    todo:          () => window.renderTodo(pageContent, user),
    quiz:          () => window.renderQuiz(pageContent, user),
    portfolio:     () => window.renderPortfolio(pageContent, user),
  };

  function navigateTo(page) {
    // Update active nav link
    navLinks.forEach(link => {
      const isActive = link.dataset.page === page;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // Show spinner while loading
    pageContent.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:60vh;">
        <div class="spinner"></div>
      </div>`;

    // Render page
    const renderer = pageRenderers[page];
    if (renderer) {
      setTimeout(renderer, 80); // tiny delay for spinner flash
    } else {
      pageContent.innerHTML = `<div class="empty-state"><div class="icon">🚧</div><p>Page not found</p></div>`;
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
  });

  // ── Logout ──
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    window.clearSession();
    window.location.href = 'login.html';
  });

  // ── Load dashboard by default ──
  navigateTo('dashboard');

  // ── Quick action buttons (wired via dashboard.js) ──
  // Also expose navigate globally so page modules can navigate
  window.navigateTo = navigateTo;
});
