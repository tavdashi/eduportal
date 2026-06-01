// js/profile.js — Profile page renderer

window.renderProfile = async function (container, user) {
  try {
    // Fetch fresh data
    const fresh = await window.api.getStudent(user.id);
    if (fresh) Object.assign(user, fresh);

    const colors = ['#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#f87171','#facc15','#c084fc','#818cf8'];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">👤 My Profile</h2>
          <p class="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div class="grid-2">

        <!-- Profile Card -->
        <div class="card" style="text-align:center;">
          <!-- Avatar with color picker -->
          <div style="position:relative;display:inline-block;margin-bottom:1.25rem;">
            <div class="avatar avatar-lg" id="profile-avatar" style="background:${user.avatar_color};margin:0 auto;">
              ${window.getInitials(user.name)}
            </div>
          </div>

          <h3 id="profile-name-display">${user.name}</h3>
          <p class="text-muted">${user.department} · Year ${user.year}</p>
          <span class="badge badge-accent" style="margin:0.5rem auto 1.25rem;">${user.student_id}</span>

          <div style="text-align:left;font-size:0.875rem;">
            ${[
              ['📧 Email',      user.email],
              ['📱 Phone',      user.phone || 'Not set'],
              ['🏛️ Department', user.department],
              ['📅 Year',       `Year ${user.year}`],
            ].map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);">
                <span style="color:var(--text-muted);">${k}</span>
                <span style="font-weight:600;text-align:right;max-width:180px;overflow:hidden;text-overflow:ellipsis;">${v}</span>
              </div>
            `).join('')}
            ${user.bio ? `<div style="margin-top:0.75rem;"><p class="text-muted" style="font-size:0.78rem;margin-bottom:0.25rem;">Bio</p><p style="font-size:0.875rem;">${user.bio}</p></div>` : ''}
          </div>
        </div>

        <!-- Edit Form -->
        <div>
          <div class="card" style="margin-bottom:1.25rem;">
            <h3 style="margin-bottom:1.25rem;">✏️ Edit Profile</h3>
            <form id="profile-form">
              <div class="form-group">
                <label class="form-label" for="prof-name">Full Name</label>
                <input class="form-input" type="text" id="prof-name" value="${user.name}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-email">Email</label>
                <input class="form-input" type="email" id="prof-email" value="${user.email}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-phone">Phone</label>
                <input class="form-input" type="text" id="prof-phone" value="${user.phone || ''}" placeholder="Enter phone number" />
              </div>
              <div class="form-grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:0 0.875rem;">
                <div class="form-group">
                  <label class="form-label" for="prof-dept">Department</label>
                  <select class="form-input" id="prof-dept">
                    ${['Computer Science','Mathematics','Physics','Chemistry','Biology','Engineering','Business','Arts','General'].map(d => `
                      <option value="${d}" ${user.department === d ? 'selected' : ''}>${d}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="prof-year">Year</label>
                  <select class="form-input" id="prof-year">
                    ${[1,2,3,4].map(y => `<option value="${y}" ${user.year === y ? 'selected' : ''}>Year ${y}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-bio">Bio (optional)</label>
                <textarea class="form-input" id="prof-bio" rows="3" placeholder="Tell something about yourself…">${user.bio || ''}</textarea>
              </div>

              <!-- Avatar color picker -->
              <div class="form-group">
                <label class="form-label">Avatar Color</label>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;" id="color-picker">
                  ${colors.map(c => `
                    <button type="button" class="color-pick-btn" data-color="${c}"
                      style="width:28px;height:28px;border-radius:50%;background:${c};border:3px solid ${c === user.avatar_color ? 'var(--text-primary)' : 'transparent'};cursor:pointer;transition:all 0.2s;"></button>
                  `).join('')}
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-full">💾 Save Changes</button>
            </form>
          </div>

          <!-- Change Password -->
          <div class="card">
            <h3 style="margin-bottom:1.25rem;">🔒 Change Password</h3>
            <form id="password-form">
              <div class="form-group">
                <label class="form-label" for="old-pass">Current Password</label>
                <input class="form-input" type="password" id="old-pass" placeholder="Enter current password" />
              </div>
              <div class="form-group">
                <label class="form-label" for="new-pass">New Password</label>
                <input class="form-input" type="password" id="new-pass" placeholder="At least 6 characters" />
              </div>
              <div class="form-group">
                <label class="form-label" for="confirm-pass">Confirm New Password</label>
                <input class="form-input" type="password" id="confirm-pass" placeholder="Repeat new password" />
              </div>
              <button type="submit" class="btn btn-secondary w-full">🔑 Update Password</button>
            </form>
          </div>
        </div>

      </div>
    `;

    // ── Color picker ──
    let selectedColor = user.avatar_color;
    container.querySelectorAll('.color-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedColor = btn.dataset.color;
        container.querySelectorAll('.color-pick-btn').forEach(b => {
          b.style.border = `3px solid ${b.dataset.color === selectedColor ? 'var(--text-primary)' : 'transparent'}`;
        });
        document.getElementById('profile-avatar').style.background = selectedColor;
      });
    });

    // ── Profile form submit ──
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        id: user.id,
        name:         document.getElementById('prof-name').value.trim(),
        email:        document.getElementById('prof-email').value.trim(),
        phone:        document.getElementById('prof-phone').value.trim(),
        department:   document.getElementById('prof-dept').value,
        year:         parseInt(document.getElementById('prof-year').value),
        bio:          document.getElementById('prof-bio').value.trim(),
        avatar_color: selectedColor,
      };

      if (!data.name || !data.email) { window.showToast('Name and email are required.', 'warning'); return; }

      const result = await window.api.updateProfile(data);
      if (result.success) {
        Object.assign(user, data);
        // Update session
        window.setSession(user);
        // Update sidebar
        const avatarEl = document.getElementById('sidebar-avatar');
        const nameEl   = document.getElementById('sidebar-name');
        if (avatarEl) { avatarEl.textContent = window.getInitials(data.name); avatarEl.style.background = selectedColor; }
        if (nameEl)   nameEl.textContent = data.name;
        window.showToast('Profile updated successfully! 🎉', 'success');
        document.getElementById('profile-name-display').textContent = data.name;
      } else {
        window.showToast('Update failed.', 'error');
      }
    });

    // ── Password form submit ──
    document.getElementById('password-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPass     = document.getElementById('old-pass').value;
      const newPass     = document.getElementById('new-pass').value;
      const confirmPass = document.getElementById('confirm-pass').value;

      if (!oldPass || !newPass || !confirmPass) { window.showToast('Fill in all password fields.', 'warning'); return; }
      if (newPass.length < 6) { window.showToast('New password must be at least 6 characters.', 'warning'); return; }
      if (newPass !== confirmPass) { window.showToast('Passwords do not match.', 'error'); return; }

      const result = await window.api.changePassword({ id: user.id, oldPassword: oldPass, newPassword: newPass });
      if (result.success) {
        window.showToast('Password changed successfully! 🔒', 'success');
        document.getElementById('password-form').reset();
      } else {
        window.showToast(result.message || 'Failed to change password.', 'error');
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
