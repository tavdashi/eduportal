// js/grades.js — Grades & GPA page renderer

window.renderGrades = async function (container, user) {
  try {
    const grades = await window.api.getGrades(user.id);
    const gpa = window.calculateGPA(grades);
    const totalCredits = grades.reduce((s, g) => s + g.credits, 0);

    // GPA color
    const gpaNum = parseFloat(gpa);
    const gpaColor = gpaNum >= 3.5 ? 'var(--success)' : gpaNum >= 2.5 ? 'var(--accent)' : gpaNum >= 1.5 ? 'var(--warning)' : 'var(--danger)';
    const gpaLabel = gpaNum >= 3.5 ? 'Excellent 🌟' : gpaNum >= 3.0 ? 'Very Good' : gpaNum >= 2.5 ? 'Good' : gpaNum >= 2.0 ? 'Satisfactory' : 'Needs Improvement';

    // Grade distribution
    const dist = {};
    for (const g of grades) { dist[g.grade] = (dist[g.grade] || 0) + 1; }

    const gradeOrder = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F','N/A'];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">📊 Grades & GPA</h2>
          <p class="page-subtitle">Academic performance overview</p>
        </div>
      </div>

      <!-- GPA Summary Cards -->
      <div class="grid-3" style="margin-bottom:2rem;">
        <div class="card" style="text-align:center;">
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.5rem;">CUMULATIVE GPA</div>
          <div style="font-size:3rem;font-weight:800;color:${gpaColor};line-height:1;" id="gpa-display">-</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.35rem;">${gpaLabel}</div>
          <div style="margin-top:1rem;">
            <div class="progress-bar" style="height:10px;">
              <div class="progress-fill" style="width:${(gpaNum / 4.0) * 100}%;background:${gpaColor};"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);margin-top:4px;">
              <span>0.0</span><span>4.0</span>
            </div>
          </div>
        </div>

        <div class="card" style="text-align:center;">
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.5rem;">TOTAL COURSES</div>
          <div style="font-size:3rem;font-weight:800;color:var(--accent);line-height:1;">${grades.length}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.35rem;">Enrolled subjects</div>
        </div>

        <div class="card" style="text-align:center;">
          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:700;margin-bottom:0.5rem;">CREDIT HOURS</div>
          <div style="font-size:3rem;font-weight:800;color:var(--info);line-height:1;">${totalCredits}</div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.35rem;">Total credits</div>
        </div>
      </div>

      <!-- Grade Distribution -->
      <div class="grid-2" style="margin-bottom:2rem;">
        <div class="card">
          <h3 style="margin-bottom:1.25rem;">Grade Distribution</h3>
          ${gradeOrder.filter(g => dist[g]).map(g => {
            const count = dist[g];
            const pct = Math.round((count / grades.length) * 100);
            const color = g.startsWith('A') ? 'var(--success)' : g.startsWith('B') ? 'var(--info)' : g.startsWith('C') ? 'var(--warning)' : g === 'N/A' ? 'var(--text-muted)' : 'var(--danger)';
            return `
              <div style="margin-bottom:0.875rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.85rem;">
                  <span style="font-weight:700;">${g}</span>
                  <span style="color:var(--text-muted);">${count} course${count > 1 ? 's' : ''} (${pct}%)</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${pct}%;background:${color};transition:width 1s ease;"></div>
                </div>
              </div>`;
          }).join('') || '<p class="text-muted">No graded courses yet.</p>'}
        </div>

        <!-- Grade Scale Reference -->
        <div class="card">
          <h3 style="margin-bottom:1.25rem;">Grade Scale Reference</h3>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;font-size:0.82rem;">
            ${[
              ['A+','4.0','97-100%'],['A','4.0','93-96%'],['A-','3.7','90-92%'],
              ['B+','3.3','87-89%'],['B','3.0','83-86%'],['B-','2.7','80-82%'],
              ['C+','2.3','77-79%'],['C','2.0','73-76%'],['C-','1.7','70-72%'],
              ['D','1.0','60-69%'],['F','0.0','< 60%'],
            ].map(([g, pts, range]) => `
              <div style="display:flex;justify-content:space-between;padding:0.4rem 0.6rem;background:var(--bg-secondary);border-radius:6px;">
                <span class="badge badge-${window.gradeColor(g)}">${g}</span>
                <span style="font-weight:700;">${pts}</span>
                <span style="color:var(--text-muted);">${range}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Course Grades Table -->
      <div class="card">
        <h3 style="margin-bottom:1.25rem;">📋 Course Grade Details</h3>
        ${grades.length === 0
          ? `<div class="empty-state"><p>No grade data available yet.</p></div>`
          : `<div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
                <thead>
                  <tr style="border-bottom:2px solid var(--border);">
                    <th style="text-align:left;padding:0.75rem;color:var(--text-muted);font-weight:700;">Course</th>
                    <th style="text-align:left;padding:0.75rem;color:var(--text-muted);font-weight:700;">Code</th>
                    <th style="text-align:center;padding:0.75rem;color:var(--text-muted);font-weight:700;">Credits</th>
                    <th style="text-align:center;padding:0.75rem;color:var(--text-muted);font-weight:700;">Grade</th>
                    <th style="text-align:center;padding:0.75rem;color:var(--text-muted);font-weight:700;">Grade Points</th>
                    <th style="text-align:left;padding:0.75rem;color:var(--text-muted);font-weight:700;">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  ${grades.map((g, i) => {
                    const gpts = { 'A+':4.0,'A':4.0,'A-':3.7,'B+':3.3,'B':3.0,'B-':2.7,'C+':2.3,'C':2.0,'C-':1.7,'D':1.0,'F':0.0 };
                    const pts = gpts[g.grade];
                    return `
                      <tr style="border-bottom:1px solid var(--border);transition:background 0.15s;"
                          onmouseenter="this.style.background='var(--bg-hover)'"
                          onmouseleave="this.style.background=''">
                        <td style="padding:0.875rem;font-weight:600;">${g.name}</td>
                        <td style="padding:0.875rem;"><span class="badge badge-accent">${g.code}</span></td>
                        <td style="padding:0.875rem;text-align:center;">${g.credits}</td>
                        <td style="padding:0.875rem;text-align:center;">
                          <span class="badge badge-${window.gradeColor(g.grade)}">${g.grade}</span>
                        </td>
                        <td style="padding:0.875rem;text-align:center;font-weight:700;">
                          ${pts !== undefined ? pts.toFixed(1) : '—'}
                        </td>
                        <td style="padding:0.875rem;min-width:120px;">
                          <div class="progress-bar">
                            <div class="progress-fill" style="width:${g.progress}%;"></div>
                          </div>
                          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">${g.progress}%</div>
                        </td>
                      </tr>`;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr style="background:var(--bg-secondary);">
                    <td colspan="2" style="padding:0.875rem;font-weight:800;">Total / GPA</td>
                    <td style="padding:0.875rem;text-align:center;font-weight:800;">${totalCredits}</td>
                    <td colspan="2" style="padding:0.875rem;text-align:center;font-weight:800;color:${gpaColor};">${gpa}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>`
        }
      </div>
    `;

    // Animate GPA
    window.animateCount(document.getElementById('gpa-display'), gpa);

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
