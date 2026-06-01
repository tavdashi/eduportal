// js/utils.js — Shared utility functions used across all page modules

// ── Toast notifications ──
window.showToast = function (message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ── Format dates ──
window.formatDate = function (dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

window.isOverdue = function (dateStr) {
  return new Date(dateStr) < new Date();
};

window.daysUntil = function (dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ── Grade to color ──
window.gradeColor = function (grade) {
  const map = {
    'A+': 'success', 'A': 'success', 'A-': 'success',
    'B+': 'info',    'B': 'info',    'B-': 'info',
    'C+': 'warning', 'C': 'warning', 'C-': 'warning',
    'D': 'danger', 'F': 'danger', 'N/A': 'muted'
  };
  return map[grade] || 'muted';
};

// ── GPA calculator ──
window.calculateGPA = function (grades) {
  const pts = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
  let totalPts = 0, totalCr = 0;
  for (const g of grades) {
    if (pts[g.grade] !== undefined) {
      totalPts += pts[g.grade] * (g.credits || 3);
      totalCr  += (g.credits || 3);
    }
  }
  return totalCr > 0 ? (totalPts / totalCr).toFixed(2) : 'N/A';
};

// ── Progress bar color ──
window.progressColor = function (pct) {
  if (pct >= 80) return 'var(--success)';
  if (pct >= 60) return 'var(--accent)';
  if (pct >= 40) return 'var(--warning)';
  return 'var(--danger)';
};

// ── Avatar initials ──
window.getInitials = function (name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

// ── Modal helpers ──
window.openModal = function (html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) window.closeModal();
  });
  document.body.appendChild(overlay);
  return overlay;
};

window.closeModal = function () {
  const m = document.getElementById('active-modal');
  if (m) m.remove();
};

// ── Animate number (count-up) ──
window.animateCount = function (el, target, suffix = '') {
  const num = parseFloat(target);
  if (isNaN(num)) { el.textContent = target; return; }
  const duration = 800;
  const start = performance.now();
  const startVal = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = startVal + (num - startVal) * eased;
    el.textContent = Number.isInteger(num) ? Math.round(current) + suffix : current.toFixed(2) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

// ── Debounce ──
window.debounce = function (fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ── Session helpers ──
window.getSession = function () {
  try { return JSON.parse(sessionStorage.getItem('eduportal-user')); } catch { return null; }
};

window.setSession = function (user) {
  sessionStorage.setItem('eduportal-user', JSON.stringify(user));
};

window.clearSession = function () {
  sessionStorage.removeItem('eduportal-user');
};
