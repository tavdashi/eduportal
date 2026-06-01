// js/theme.js — Theme manager
// Applies theme from localStorage and wires up all theme-dot buttons.
// This is loaded first on every page so themes apply before content renders.

(function () {
  const savedTheme = localStorage.getItem('eduportal-theme') || 'pastel';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    // Map 'pastel' to no attribute (default CSS vars)
    if (theme === 'pastel') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('eduportal-theme', theme);
    updateDots(theme);
  }

  function updateDots(theme) {
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.theme === theme);
    });
  }

  // Wire up all theme dots (including ones added later via MutationObserver)
  function wireDots() {
    document.querySelectorAll('.theme-dot').forEach(dot => {
      // Avoid double-binding
      if (!dot._themed) {
        dot._themed = true;
        dot.addEventListener('click', () => applyTheme(dot.dataset.theme));
      }
    });
    updateDots(savedTheme);
  }

  // Wait for DOM then wire
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireDots);
  } else {
    wireDots();
  }

  // Watch for dynamically added dots (sidebar loads async)
  const observer = new MutationObserver(wireDots);
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose globally so renderer.js can call after sidebar loads
  window.applyTheme = applyTheme;
  window.currentTheme = () => localStorage.getItem('eduportal-theme') || 'pastel';
})();
