// js/auth.js — Login & Register page logic

document.addEventListener('DOMContentLoaded', () => {

  // ── Animated background dots ──
  const dotsContainer = document.getElementById('auth-dots');
  if (dotsContainer) {
    for (let i = 0; i < 18; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      const size = Math.random() * 20 + 6;
      dot.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}%;
        bottom: -${size}px;
        animation-duration: ${Math.random() * 8 + 6}s;
        animation-delay: ${Math.random() * 6}s;
      `;
      dotsContainer.appendChild(dot);
    }
  }

  // ── Tab switching ──
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const panelLogin  = document.getElementById('panel-login');
  const panelReg    = document.getElementById('panel-register');
  const msg         = document.getElementById('auth-msg');

  function switchTab(tab) {
    const isLogin = tab === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    tabLogin.setAttribute('aria-selected', isLogin);
    tabRegister.setAttribute('aria-selected', !isLogin);
    panelLogin.style.display  = isLogin ? 'block' : 'none';
    panelReg.style.display    = isLogin ? 'none'  : 'block';
    hideMsg();
  }

  tabLogin.addEventListener('click',    () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));

  // ── Message helpers ──
  function showMsg(text, type = 'error') {
    msg.textContent = text;
    msg.className = `auth-message ${type} show`;
  }
  function hideMsg() {
    msg.className = 'auth-message';
  }

  // ── Password toggles ──
  function bindPassToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const inp = document.getElementById(inputId);
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
      const isPass = inp.type === 'password';
      inp.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁️';
    });
  }
  bindPassToggle('toggle-login-pass', 'login-password');
  bindPassToggle('toggle-reg-pass',   'reg-password');

  // ── LOGIN FORM ──
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      showMsg('Please fill in all fields.'); return;
    }

    const btn  = document.getElementById('login-btn');
    const text = document.getElementById('login-btn-text');
    btn.disabled = true;
    text.textContent = 'Signing in…';

    try {
      const result = await window.api.login({ username, password });
      if (result.success) {
        // Normalize any BigInt values sql.js may return
        const student = JSON.parse(JSON.stringify(result.student, (_k, v) =>
          typeof v === 'bigint' ? Number(v) : v
        ));
        window.setSession(student);
        showMsg('Welcome back! Redirecting…', 'success');
        setTimeout(() => {
          window.location.replace('dashboard.html');
        }, 600);
      } else {
        showMsg(result.message || 'Invalid username or password.');
        btn.disabled = false;
        text.textContent = 'Sign In';
      }
    } catch (err) {
      console.error('Login error:', err);
      showMsg('An error occurred: ' + err.message);
      btn.disabled = false;
      text.textContent = 'Sign In';
    }
  });

  // ── REGISTER FORM ──
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg();

    const name     = document.getElementById('reg-name').value.trim();
    const sid      = document.getElementById('reg-sid').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const dept     = document.getElementById('reg-dept').value;
    const year     = parseInt(document.getElementById('reg-year').value);
    const password = document.getElementById('reg-password').value;

    if (!name || !sid || !username || !email || !password) {
      showMsg('Please fill in all required fields.'); return;
    }
    if (password.length < 6) {
      showMsg('Password must be at least 6 characters.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('Please enter a valid email address.'); return;
    }

    const colors = ['#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#f87171','#facc15'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const btn = document.getElementById('register-btn');
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      const result = await window.api.register({
        name, username, password, email, student_id: sid,
        department: dept, year, avatar_color: avatarColor
      });

      if (result.success) {
        showMsg('Account created! You can now sign in.', 'success');
        registerForm.reset();
        setTimeout(() => switchTab('login'), 1500);
      } else {
        showMsg(result.message || 'Registration failed.');
      }
    } catch (err) {
      showMsg('An error occurred. Please try again.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });

  // ── Redirect if already logged in ──
  if (window.getSession()) {
    window.location.href = 'dashboard.html';
  }
});
