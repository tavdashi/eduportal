// js/attendance.js — Attendance page renderer

window.renderAttendance = async function (container, user) {
  try {
    const records = await window.api.getAttendance(user.id);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">✅ Attendance</h2>
          <p class="page-subtitle">Track your attendance across all courses</p>
        </div>
      </div>

      ${records.length === 0
        ? `<div class="empty-state"><div class="icon">📭</div><p>No attendance records found.</p></div>`
        : `
          <!-- Overall Summary -->
          <div class="card" style="margin-bottom:1.5rem;">
            <h3 style="margin-bottom:1rem;">Overall Attendance Summary</h3>
            ${(() => {
              const totalClasses = records.reduce((s, r) => s + (r.total_classes || 0), 0);
              const totalPresent = records.reduce((s, r) => s + (r.present || 0), 0);
              const overallPct   = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
              const color = overallPct >= 75 ? 'var(--success)' : overallPct >= 60 ? 'var(--warning)' : 'var(--danger)';
              return `
                <div style="display:flex;align-items:center;gap:2rem;flex-wrap:wrap;">
                  <div style="text-align:center;min-width:100px;">
                    <div style="font-size:2.5rem;font-weight:800;color:${color};">${overallPct}%</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">Overall</div>
                  </div>
                  <div style="flex:1;">
                    <div class="progress-bar" style="height:14px;margin-bottom:0.5rem;">
                      <div class="progress-fill" style="width:${overallPct}%;background:${color};"></div>
                    </div>
                    <div style="display:flex;gap:1.5rem;font-size:0.8rem;flex-wrap:wrap;">
                      <span style="color:var(--success);">✅ ${totalPresent} Present</span>
                      <span style="color:var(--danger);">❌ ${totalClasses - totalPresent} Absent</span>
                      <span style="color:var(--text-muted);">📚 ${totalClasses} Total Classes</span>
                    </div>
                    ${overallPct < 75 ? `<p style="color:var(--danger);font-size:0.8rem;margin-top:0.5rem;font-weight:700;">⚠️ Your attendance is below 75%. Please improve.</p>` : ''}
                  </div>
                </div>`;
            })()}
          </div>

          <!-- Per-course Attendance -->
          <div class="grid-2">
            ${records.map(r => {
              const total = r.total_classes || 0;
              const present = r.present || 0;
              const absent = r.absent || 0;
              const pct = total > 0 ? Math.round((present / total) * 100) : 0;
              const color = pct >= 75 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
              const status = pct >= 75 ? 'Good Standing' : pct >= 60 ? 'At Risk' : 'Critical';
              const statusBadge = pct >= 75 ? 'success' : pct >= 60 ? 'warning' : 'danger';

              return `
                <div class="card">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                    <div>
                      <h4>${r.name}</h4>
                      <span class="badge badge-accent" style="margin-top:4px;">${r.code}</span>
                    </div>
                    <span class="badge badge-${statusBadge}">${status}</span>
                  </div>

                  <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.85rem;">
                    <span>Attendance</span>
                    <span style="font-weight:800;color:${color};">${pct}%</span>
                  </div>
                  <div class="progress-bar" style="margin-bottom:1rem;">
                    <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
                  </div>

                  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;text-align:center;font-size:0.8rem;">
                    <div style="padding:0.5rem;background:var(--bg-secondary);border-radius:8px;">
                      <div style="font-weight:800;font-size:1.1rem;">${total}</div>
                      <div style="color:var(--text-muted);">Total</div>
                    </div>
                    <div style="padding:0.5rem;background:#dcfce7;border-radius:8px;">
                      <div style="font-weight:800;font-size:1.1rem;color:var(--success);">${present}</div>
                      <div style="color:var(--success);">Present</div>
                    </div>
                    <div style="padding:0.5rem;background:#fee2e2;border-radius:8px;">
                      <div style="font-weight:800;font-size:1.1rem;color:var(--danger);">${absent}</div>
                      <div style="color:var(--danger);">Absent</div>
                    </div>
                  </div>

                  ${pct < 75 && total > 0 ? `
                    <div style="margin-top:0.875rem;padding:0.5rem;background:#fef3c7;border-radius:8px;font-size:0.75rem;color:#92400e;">
                      ⚠️ Need ${Math.ceil((0.75 * total - present) / 0.25)} more classes to reach 75%
                    </div>
                  ` : ''}
                </div>`;
            }).join('')}
          </div>`
      }
    `;

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
