// js/announcements.js — Announcements page renderer

window.renderAnnouncements = async function (container, user) {
  try {
    const announcements = await window.api.getAnnouncements();

    function render(filter = 'All', search = '') {
      const categories = ['All', ...new Set(announcements.map(a => a.category))];
      let filtered = announcements;
      if (filter !== 'All') filtered = filtered.filter(a => a.category === filter);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s));
      }

      const catColors = {
        Exams: 'danger', Event: 'info', Facility: 'success', Important: 'warning', General: 'muted'
      };

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h2 class="page-title">📢 Announcements</h2>
            <p class="page-subtitle">${announcements.length} announcements</p>
          </div>
        </div>

        <!-- Search -->
        <div class="search-bar" style="max-width:400px;margin-bottom:1.25rem;">
          <span class="icon">🔍</span>
          <input type="text" id="ann-search" placeholder="Search announcements…" value="${search}" />
        </div>

        <!-- Category filter tabs -->
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
          ${categories.map(cat => `
            <button class="btn btn-${cat === filter ? 'primary' : 'ghost'} btn-sm cat-btn" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Announcements -->
        <div>
          ${filtered.length === 0
            ? `<div class="empty-state"><div class="icon">📭</div><p>No announcements found.</p></div>`
            : filtered.map(a => `
              <div class="card" style="margin-bottom:1rem;cursor:pointer;" onclick="this.querySelector('.ann-full').classList.toggle('hidden')">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
                  <div>
                    <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.35rem;">
                      <span class="badge badge-${catColors[a.category] || 'muted'}">${a.category}</span>
                      <span style="font-size:0.75rem;color:var(--text-muted);">by ${a.author}</span>
                    </div>
                    <h3 style="font-size:1rem;">${a.title}</h3>
                  </div>
                  <span style="font-size:0.75rem;color:var(--text-muted);">${window.formatDate(a.created_at)}</span>
                </div>

                <!-- Preview (first 120 chars) -->
                <p style="font-size:0.875rem;color:var(--text-secondary);">
                  ${a.body.length > 120 ? a.body.slice(0, 120) + '…' : a.body}
                </p>

                <!-- Full text (initially hidden) -->
                <div class="ann-full hidden" style="margin-top:1rem;padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:0.875rem;color:var(--text-primary);">
                  ${a.body}
                </div>
                <p style="font-size:0.75rem;color:var(--accent);margin-top:0.5rem;">Click to expand ▼</p>
              </div>
            `).join('')}
        </div>
      `;

      // Add .hidden CSS if not present
      if (!document.getElementById('hidden-style')) {
        const style = document.createElement('style');
        style.id = 'hidden-style';
        style.textContent = '.hidden { display: none !important; }';
        document.head.appendChild(style);
      }

      // Wire category buttons
      container.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const search = document.getElementById('ann-search')?.value || '';
          render(btn.dataset.cat, search);
        });
      });

      // Wire search
      document.getElementById('ann-search')?.addEventListener('input', window.debounce(e => render(filter, e.target.value), 250));
    }

    render();

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
