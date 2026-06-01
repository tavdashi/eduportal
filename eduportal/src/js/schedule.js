// js/schedule.js — Timetable page renderer

window.renderSchedule = async function (container, user) {
  try {
    const schedule = await window.api.getSchedule(user.id);
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const colors = { Monday:'#f472b6', Tuesday:'#60a5fa', Wednesday:'#34d399', Thursday:'#fb923c', Friday:'#a78bfa', Saturday:'#facc15' };

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">📅 Class Schedule</h2>
          <p class="page-subtitle">Your weekly timetable</p>
        </div>
      </div>

      ${schedule.length === 0
        ? `<div class="empty-state"><div class="icon">📭</div><p>No schedule found. Enroll in courses to see your timetable.</p></div>`
        : `<div style="display:flex;flex-direction:column;gap:1.5rem;">
            ${days.map(day => {
              const dayClasses = schedule.filter(s => s.day === day);
              if (dayClasses.length === 0) return '';
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
              return `
                <div class="card" style="border-left: 4px solid ${colors[day] || 'var(--accent)'};">
                  <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
                    <h3 style="font-size:1rem;">${day}</h3>
                    ${isToday ? `<span class="badge badge-accent">Today</span>` : ''}
                    <span class="text-muted" style="font-size:0.8rem;margin-left:auto;">${dayClasses.length} class${dayClasses.length > 1 ? 'es' : ''}</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:0.75rem;">
                    ${dayClasses.map(s => `
                      <div style="display:flex;align-items:center;gap:1rem;padding:0.875rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">
                        <div style="text-align:center;min-width:80px;">
                          <div style="font-weight:800;font-size:0.875rem;color:${colors[day] || 'var(--accent)'};">${s.start_time}</div>
                          <div style="font-size:0.7rem;color:var(--text-muted);">${s.end_time}</div>
                        </div>
                        <div style="width:3px;height:40px;background:${colors[day] || 'var(--accent)'};border-radius:999px;flex-shrink:0;"></div>
                        <div style="flex:1;">
                          <div style="font-weight:700;font-size:0.9rem;">${s.course_name}</div>
                          <div style="font-size:0.78rem;color:var(--text-muted);">${s.course_code} · 📍 ${s.room}</div>
                        </div>
                        <span class="badge badge-accent">${s.course_code}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).filter(Boolean).join('')}
          </div>`
      }

      <!-- Weekly overview table -->
      ${schedule.length > 0 ? `
        <div class="card" style="margin-top:1.5rem;overflow-x:auto;">
          <h3 style="margin-bottom:1.25rem;">📊 Weekly Overview</h3>
          <table style="width:100%;border-collapse:collapse;font-size:0.8rem;min-width:500px;">
            <thead>
              <tr>
                <th style="padding:0.5rem 0.875rem;text-align:left;color:var(--text-muted);font-weight:700;border-bottom:2px solid var(--border);">Time</th>
                ${days.map(d => `<th style="padding:0.5rem 0.875rem;text-align:center;color:${colors[d] || 'var(--text-muted)'};font-weight:700;border-bottom:2px solid var(--border);">${d.slice(0,3)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // Collect all unique time slots
                const slots = [...new Set(schedule.map(s => s.start_time))].sort();
                return slots.map(time => `
                  <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:0.5rem 0.875rem;font-weight:700;color:var(--text-secondary);">${time}</td>
                    ${days.map(day => {
                      const cls = schedule.find(s => s.day === day && s.start_time === time);
                      return `<td style="padding:0.5rem 0.875rem;text-align:center;">
                        ${cls ? `<div style="background:${colors[day]}22;color:${colors[day]};border-radius:6px;padding:4px 8px;font-weight:700;font-size:0.75rem;">${cls.course_code}</div>` : '<span style="color:var(--border);">—</span>'}
                      </td>`;
                    }).join('')}
                  </tr>
                `).join('');
              })()}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
