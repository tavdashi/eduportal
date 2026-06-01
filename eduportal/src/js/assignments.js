// js/assignments.js — Assignments page renderer

window.renderAssignments = async function (container, user) {
  try {
    const assignments = await window.api.getAssignments(user.id);

    function render(filter = 'all', search = '') {
      let filtered = assignments;
      if (filter === 'pending')   filtered = filtered.filter(a => !a.submitted);
      if (filter === 'submitted') filtered = filtered.filter(a => a.submitted);
      if (filter === 'overdue')   filtered = filtered.filter(a => !a.submitted && window.isOverdue(a.due_date));
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(a => a.title.toLowerCase().includes(s) || a.course_name.toLowerCase().includes(s));
      }

      const pending   = assignments.filter(a => !a.submitted).length;
      const submitted = assignments.filter(a => a.submitted).length;
      const overdue   = assignments.filter(a => !a.submitted && window.isOverdue(a.due_date)).length;

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h2 class="page-title">📝 Assignments</h2>
            <p class="page-subtitle">${assignments.length} total · ${pending} pending · ${submitted} submitted</p>
          </div>
        </div>

        <!-- Stats row -->
        <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
          <div class="card card-sm" style="flex:1;min-width:120px;text-align:center;border-left:4px solid var(--warning);">
            <div style="font-size:1.5rem;font-weight:800;color:var(--warning);">${pending}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Pending</div>
          </div>
          <div class="card card-sm" style="flex:1;min-width:120px;text-align:center;border-left:4px solid var(--success);">
            <div style="font-size:1.5rem;font-weight:800;color:var(--success);">${submitted}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Submitted</div>
          </div>
          <div class="card card-sm" style="flex:1;min-width:120px;text-align:center;border-left:4px solid var(--danger);">
            <div style="font-size:1.5rem;font-weight:800;color:var(--danger);">${overdue}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Overdue</div>
          </div>
        </div>

        <!-- Filters + Search -->
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.5rem;">
          <div style="display:flex;gap:0.5rem;">
            ${['all','pending','submitted','overdue'].map(f => `
              <button class="btn btn-${f === filter ? 'primary' : 'ghost'} btn-sm filter-btn" data-filter="${f}" style="text-transform:capitalize;">
                ${f === 'all' ? '📋 All' : f === 'pending' ? '⏳ Pending' : f === 'submitted' ? '✅ Submitted' : '🚨 Overdue'}
              </button>
            `).join('')}
          </div>
          <div class="search-bar" style="flex:1;max-width:320px;">
            <span class="icon">🔍</span>
            <input type="text" id="assign-search" placeholder="Search assignments…" value="${search}" />
          </div>
        </div>

        <!-- Assignments List -->
        <div id="assign-list">
          ${filtered.length === 0
            ? `<div class="empty-state"><div class="icon">${filter === 'submitted' ? '🎉' : '📭'}</div>
               <p>${filter === 'submitted' ? 'No submitted assignments yet.' : filter === 'overdue' ? 'No overdue assignments! Great job!' : 'No assignments found.'}</p></div>`
            : filtered.map(a => renderAssignmentCard(a)).join('')
          }
        </div>
      `;

      // Wire filter buttons
      container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const newSearch = document.getElementById('assign-search')?.value || '';
          render(btn.dataset.filter, newSearch);
        });
      });

      // Wire search
      document.getElementById('assign-search')?.addEventListener('input', window.debounce(e => render(filter, e.target.value), 250));

      // Wire submit buttons
      container.querySelectorAll('.submit-assign-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const asgn = assignments.find(a => a.id === id);
          showSubmitModal(asgn, user, () => window.renderAssignments(container, user));
        });
      });

      // Wire view buttons
      container.querySelectorAll('.view-assign-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = parseInt(btn.dataset.id);
          const asgn = assignments.find(a => a.id === id);
          showViewModal(asgn);
        });
      });
    }

    render();

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};

function renderAssignmentCard(a) {
  const days = window.daysUntil(a.due_date);
  const isOverdue = days < 0 && !a.submitted;
  const typeColors = { Quiz: '#f59e0b', Project: '#3b82f6', Lab: '#10b981', Assignment: '#c084fc' };
  const color = typeColors[a.type] || '#c084fc';

  let dueText = '';
  if (a.submitted) dueText = `<span class="badge badge-success">✅ Submitted</span>`;
  else if (isOverdue) dueText = `<span class="badge badge-danger">🚨 Overdue</span>`;
  else if (days === 0) dueText = `<span class="badge badge-warning">⏰ Due Today!</span>`;
  else if (days === 1) dueText = `<span class="badge badge-warning">⏰ Due Tomorrow</span>`;
  else dueText = `<span class="badge badge-muted">📅 Due in ${days} days</span>`;

  return `
    <div class="card" style="margin-bottom:1rem;border-left:4px solid ${color};padding:1.25rem;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
        <div>
          <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;margin-bottom:0.35rem;">
            <span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}55;">${a.type}</span>
            <span class="badge badge-accent">${a.course_code}</span>
            ${a.student_grade && a.student_grade !== 'Pending' ? `<span class="badge badge-success">Grade: ${a.student_grade}</span>` : ''}
          </div>
          <h3 style="font-size:1rem;">${a.title}</h3>
          <p style="font-size:0.8rem;color:var(--text-muted);">📚 ${a.course_name}</p>
        </div>
        <div style="text-align:right;">
          ${dueText}
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;">
            Due: ${window.formatDate(a.due_date)} · Max: ${a.max_marks} marks
          </div>
        </div>
      </div>

      ${a.description ? `<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">${a.description}</p>` : ''}

      ${a.submitted && a.submission_text ? `
        <div style="padding:0.75rem;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:0.82rem;color:var(--text-muted);margin-bottom:0.875rem;">
          <strong>Your submission:</strong><br>${a.submission_text}
        </div>
      ` : ''}

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm view-assign-btn" data-id="${a.id}">👁 View Details</button>
        ${!a.submitted
          ? `<button class="btn btn-primary btn-sm submit-assign-btn" data-id="${a.id}">📤 Submit</button>`
          : `<button class="btn btn-secondary btn-sm submit-assign-btn" data-id="${a.id}">✏️ Resubmit</button>`
        }
      </div>
    </div>`;
}

function showSubmitModal(asgn, user, onSuccess) {
  const html = `
    <div class="modal-header">
      <h3>📤 Submit Assignment</h3>
      <button class="modal-close" onclick="window.closeModal()" aria-label="Close">×</button>
    </div>
    <p style="color:var(--text-muted);margin-bottom:1.25rem;font-size:0.875rem;">
      <strong>${asgn.title}</strong> — ${asgn.course_name}<br/>
      Due: ${window.formatDate(asgn.due_date)}
    </p>
    <div class="form-group">
      <label class="form-label" for="submit-text">Submission Notes / Answer</label>
      <textarea class="form-input" id="submit-text" placeholder="Enter your submission text, notes, or file reference…" rows="5">${asgn.submission_text || ''}</textarea>
    </div>
    <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
      <button class="btn btn-ghost" onclick="window.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="confirm-submit-btn">Submit Now ✅</button>
    </div>
  `;

  window.openModal(html);

  document.getElementById('confirm-submit-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('submit-text').value.trim();
    if (!text) { window.showToast('Please enter your submission.', 'warning'); return; }
    const result = await window.api.submitAssignment({ studentId: user.id, assignmentId: asgn.id, text });
    if (result.success) {
      window.closeModal();
      window.showToast('Assignment submitted! 🎉', 'success');
      onSuccess();
    } else {
      window.showToast('Submission failed.', 'error');
    }
  });
}

function showViewModal(asgn) {
  const days = window.daysUntil(asgn.due_date);
  const html = `
    <div class="modal-header">
      <h3>${asgn.title}</h3>
      <button class="modal-close" onclick="window.closeModal()" aria-label="Close">×</button>
    </div>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
      <span class="badge badge-accent">${asgn.course_code}</span>
      <span class="badge badge-muted">${asgn.type}</span>
      <span class="badge badge-${asgn.submitted ? 'success' : days < 0 ? 'danger' : 'warning'}">${asgn.submitted ? 'Submitted' : days < 0 ? 'Overdue' : 'Pending'}</span>
    </div>
    <table style="width:100%;font-size:0.875rem;border-collapse:collapse;">
      ${[['Course', asgn.course_name],['Due Date', window.formatDate(asgn.due_date)],['Max Marks', asgn.max_marks],['Type', asgn.type]].map(([k,v]) => `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:0.5rem 0;color:var(--text-muted);width:100px;">${k}</td>
          <td style="padding:0.5rem 0;font-weight:600;">${v}</td>
        </tr>
      `).join('')}
    </table>
    ${asgn.description ? `<div style="margin-top:1rem;padding:0.875rem;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:0.875rem;">${asgn.description}</div>` : ''}
    ${asgn.submission_text ? `<div style="margin-top:1rem;"><strong>Your Submission:</strong><div style="margin-top:0.5rem;padding:0.875rem;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:0.875rem;">${asgn.submission_text}</div></div>` : ''}
    <div style="margin-top:1.5rem;"><button class="btn btn-secondary w-full" onclick="window.closeModal()">Close</button></div>
  `;
  window.openModal(html);
}
