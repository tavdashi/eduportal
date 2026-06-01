// js/courses.js — Courses page renderer

window.renderCourses = async function (container, user) {
  try {
    const [myCourses, allCourses] = await Promise.all([
      window.api.getCourses(user.id),
      window.api.getAllCourses(),
    ]);

    const enrolledIds = new Set(myCourses.map(c => c.id));

    function render(searchTerm = '') {
      const term = searchTerm.toLowerCase();
      const filtered = myCourses.filter(c =>
        !term || c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term) || c.instructor.toLowerCase().includes(term)
      );

      const colors = ['#f472b6','#60a5fa','#34d399','#fb923c','#a78bfa','#f87171','#facc15','#4ade80'];

      container.innerHTML = `
        <div class="page-header">
          <div>
            <h2 class="page-title">📚 My Courses</h2>
            <p class="page-subtitle">${myCourses.length} enrolled courses</p>
          </div>
          <button class="btn btn-primary" id="enroll-btn">➕ Enroll in Course</button>
        </div>

        <!-- Search -->
        <div class="search-bar" style="max-width:400px; margin-bottom:1.5rem;">
          <span class="icon">🔍</span>
          <input type="text" id="course-search" placeholder="Search courses…" aria-label="Search courses" value="${searchTerm}" />
        </div>

        ${filtered.length === 0
          ? `<div class="empty-state"><div class="icon">📭</div><p>No courses found. Try a different search or enroll in a new course.</p></div>`
          : `<div class="grid-2" id="courses-grid">
              ${filtered.map((c, i) => `
                <div class="card" style="border-left:4px solid ${colors[i % colors.length]}; padding:1.25rem;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
                    <div>
                      <span class="badge badge-accent">${c.code}</span>
                      <h3 style="margin-top:0.5rem;font-size:1rem;">${c.name}</h3>
                    </div>
                    <span class="badge badge-${window.gradeColor(c.grade)}">${c.grade || 'N/A'}</span>
                  </div>

                  <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;">👨‍🏫 ${c.instructor}</p>
                  <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">${c.description || ''}</p>

                  <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;">
                    <span>📍 ${c.room}</span>
                    <span>💳 ${c.credits} credits</span>
                  </div>

                  <div style="margin-bottom:0.25rem;display:flex;justify-content:space-between;font-size:0.8rem;">
                    <span>Progress</span>
                    <span style="font-weight:700;color:var(--accent);">${c.progress}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width:${c.progress}%;background:${colors[i % colors.length]};"></div>
                  </div>
                </div>
              `).join('')}
            </div>`
        }
      `;

      // Re-bind search
      document.getElementById('course-search')?.addEventListener('input', window.debounce(e => render(e.target.value), 250));

      // Enroll button
      document.getElementById('enroll-btn')?.addEventListener('click', () => showEnrollModal(allCourses, enrolledIds, user));
    }

    render();

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};

function showEnrollModal(allCourses, enrolledIds, user) {
  const available = allCourses.filter(c => !enrolledIds.has(c.id));

  const html = `
    <div class="modal-header">
      <h3>➕ Enroll in a Course</h3>
      <button class="modal-close" onclick="window.closeModal()" aria-label="Close">×</button>
    </div>
    ${available.length === 0
      ? `<p class="text-muted">You are already enrolled in all available courses!</p>`
      : `
        <div class="form-group">
          <label class="form-label" for="enroll-select">Select a Course</label>
          <select class="form-input" id="enroll-select">
            <option value="">— Choose a course —</option>
            ${available.map(c => `<option value="${c.id}">${c.code} — ${c.name} (${c.credits} cr)</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary w-full" id="confirm-enroll-btn">Enroll Now</button>
      `
    }
  `;

  window.openModal(html);

  document.getElementById('confirm-enroll-btn')?.addEventListener('click', async () => {
    const courseId = parseInt(document.getElementById('enroll-select').value);
    if (!courseId) { window.showToast('Please select a course', 'warning'); return; }
    const result = await window.api.enrollCourse({ studentId: user.id, courseId });
    if (result.success) {
      window.closeModal();
      window.showToast('Enrolled successfully! 🎉', 'success');
      window.renderCourses(document.getElementById('page-content'), user);
    } else {
      window.showToast(result.message || 'Enrollment failed', 'error');
    }
  });
}
