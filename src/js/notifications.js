// js/notifications.js — Notifications page renderer

window.renderNotifications = async function (container, user) {
  try {
    const notifications = await window.api.getNotifications(user.id);

    function render() {
      const unread = notifications.filter(n => !n.is_read);
      const read   = notifications.filter(n => n.is_read);

      const typeIcons = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h2 class="page-title">🔔 Notifications</h2>
            <p class="page-subtitle">${unread.length} unread · ${notifications.length} total</p>
          </div>
          ${unread.length > 0 ? `<button class="btn btn-secondary" id="mark-all-read">Mark All Read</button>` : ''}
        </div>

        ${notifications.length === 0
          ? `<div class="empty-state"><div class="icon">🔕</div><p>No notifications yet.</p></div>`
          : `
            ${unread.length > 0 ? `
              <h3 style="margin-bottom:1rem;">Unread (${unread.length})</h3>
              ${unread.map(n => renderNotif(n, typeIcons, true)).join('')}
              <div class="divider"></div>
            ` : ''}

            ${read.length > 0 ? `
              <h3 style="margin-bottom:1rem;color:var(--text-muted);">Read (${read.length})</h3>
              ${read.map(n => renderNotif(n, typeIcons, false)).join('')}
            ` : ''}
          `
        }
      `;

      // Wire mark-all-read
      document.getElementById('mark-all-read')?.addEventListener('click', async () => {
        await Promise.all(notifications.filter(n => !n.is_read).map(n => window.api.markNotificationRead(n.id)));
        window.showToast('All notifications marked as read.', 'success');
        // Update badge in sidebar
        const badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
        notifications.forEach(n => n.is_read = 1);
        render();
      });

      // Wire per-notification mark-read buttons
      container.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          await window.api.markNotificationRead(id);
          const notif = notifications.find(n => n.id === id);
          if (notif) notif.is_read = 1;
          render();
        });
      });
    }

    function renderNotif(n, typeIcons, isUnread) {
      return `
        <div class="card" style="margin-bottom:0.875rem;border-left:4px solid var(--${n.type === 'success' ? 'success' : n.type === 'warning' ? 'warning' : n.type === 'error' ? 'danger' : 'info'});${isUnread ? 'background:var(--accent-light);' : 'opacity:0.75;'}">
          <div style="display:flex;align-items:flex-start;gap:1rem;">
            <div style="font-size:1.5rem;flex-shrink:0;">${typeIcons[n.type] || 'ℹ️'}</div>
            <div style="flex:1;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;flex-wrap:wrap;">
                <h4 style="font-size:0.9rem;">${n.title}</h4>
                <span style="font-size:0.72rem;color:var(--text-muted);">${window.formatDate(n.created_at)}</span>
              </div>
              <p style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.25rem;">${n.body}</p>
            </div>
            ${isUnread ? `<button class="btn btn-ghost btn-sm mark-read-btn" data-id="${n.id}" title="Mark as read">✓</button>` : ''}
          </div>
        </div>`;
    }

    render();

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
